from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta

from app.core.usage.depletion import (
    EWMAState,
    classify_risk,
    compute_burn_rate,
    compute_depletion_risk,
    compute_safe_usage_percent,
    ewma_update,
)
from app.core.utils.time import naive_utc_to_epoch, utcnow

# In-memory EWMA state: keyed by (account_id, limit_name, window)
# Persists across requests; resets on process restart.
_ewma_states: dict[tuple[str, str, str], EWMAState] = {}


@dataclass
class DepletionMetrics:
    risk: float
    risk_level: str  # "safe" | "warning" | "danger" | "critical"
    rate_per_second: float
    burn_rate: float
    safe_usage_percent: float  # budget line position
    projected_exhaustion_at: datetime | None
    seconds_until_exhaustion: float | None
    capacity_credits: float | None = None


@dataclass
class AggregateDepletionMetrics:
    risk: float
    risk_level: str
    burn_rate: float
    safe_usage_percent: float
    projected_exhaustion_at: datetime | None
    seconds_until_exhaustion: float | None


def compute_depletion_for_account(
    account_id: str,
    limit_name: str,
    window: str,
    history: list,  # list of objects with: used_percent, recorded_at, reset_at, window_minutes
    now: datetime | None = None,
    *,
    capacity_credits: float | None = None,
) -> DepletionMetrics | None:
    """
    Compute depletion metrics for a single account using EWMA.

    - history: list of usage entries ordered by recorded_at ASC
    - Returns None if insufficient data (<2 data points) or rate is unknown
    - Uses module-level _ewma_states for in-memory state
    """
    if not history:
        return None

    now = now or utcnow()
    key = (account_id, limit_name, window)

    if len(history) < 2:
        # Only one in-window sample — seed the EWMA but don't compute
        # depletion.  Reset any cached state so we never derive a rate
        # from an out-of-window sample plus this one.
        entry = history[0]
        _ewma_states[key] = ewma_update(
            None, entry.used_percent, naive_utc_to_epoch(entry.recorded_at), reset_at=entry.reset_at
        )
        return None

    state = _rebuild_ewma_state(history)

    if state is not None:
        _ewma_states[key] = state

    if state is None or state.rate is None:
        return None

    latest = history[-1]
    used_percent = latest.used_percent

    seconds_until_reset = 0.0
    if latest.reset_at is not None:
        seconds_until_reset = max(0.0, latest.reset_at - naive_utc_to_epoch(now))
        if seconds_until_reset == 0.0:
            # Window has already reset — the stale used_percent is
            # meaningless.  Clear EWMA state so next refresh starts fresh.
            _ewma_states.pop(key, None)
            return None
    elif latest.window_minutes is not None:
        # Without reset_at we cannot know when the window started.  Use
        # the full window duration as a conservative upper bound rather
        # than guessing from the first observed sample (which may appear
        # mid-window and dramatically underestimate remaining time).
        seconds_until_reset = float(latest.window_minutes * 60)

    total_window_seconds = (latest.window_minutes * 60) if latest.window_minutes else 0.0
    seconds_elapsed = max(0.0, total_window_seconds - seconds_until_reset)

    risk = compute_depletion_risk(used_percent, state.rate, seconds_until_reset)
    risk_level = classify_risk(risk)
    burn_rate = compute_burn_rate(state.rate, 100.0 - used_percent, seconds_until_reset)
    safe_pct = compute_safe_usage_percent(seconds_elapsed, total_window_seconds)

    projected_exhaustion_at = None
    seconds_until_exhaustion = None
    if state.rate > 0 and seconds_until_reset > 0:
        remaining = 100.0 - used_percent
        secs = remaining / state.rate
        if secs <= seconds_until_reset:
            seconds_until_exhaustion = secs
            projected_exhaustion_at = now + timedelta(seconds=secs)
        # else: exhaustion falls after the window resets — leave as None

    return DepletionMetrics(
        risk=risk,
        risk_level=risk_level,
        rate_per_second=state.rate,
        burn_rate=burn_rate,
        safe_usage_percent=safe_pct,
        projected_exhaustion_at=projected_exhaustion_at,
        seconds_until_exhaustion=seconds_until_exhaustion,
        capacity_credits=capacity_credits,
    )


def compute_aggregate_depletion(
    per_account_metrics: Sequence[DepletionMetrics | None],
) -> AggregateDepletionMetrics | None:
    """
    Aggregate depletion metrics across accounts using capacity-weighted averages.
    Returns None if no valid metrics.
    """
    valid = [m for m in per_account_metrics if m is not None]
    if not valid:
        return None

    weights = [m.capacity_credits if m.capacity_credits and m.capacity_credits > 0 else 1.0 for m in valid]
    total_weight = sum(weights)

    if total_weight <= 0:
        return None

    risk = sum(metric.risk * weight for metric, weight in zip(valid, weights, strict=False)) / total_weight
    burn_rate = sum(metric.burn_rate * weight for metric, weight in zip(valid, weights, strict=False)) / total_weight
    safe_usage_percent = (
        sum(metric.safe_usage_percent * weight for metric, weight in zip(valid, weights, strict=False)) / total_weight
    )
    risk_level = classify_risk(risk)

    exhaustion_candidates = [
        (metric.seconds_until_exhaustion, metric.projected_exhaustion_at)
        for metric in valid
        if metric.seconds_until_exhaustion is not None and metric.projected_exhaustion_at is not None
    ]
    if exhaustion_candidates:
        seconds_until_exhaustion, projected_exhaustion_at = min(exhaustion_candidates, key=lambda item: item[0])
    else:
        seconds_until_exhaustion = None
        projected_exhaustion_at = None

    return AggregateDepletionMetrics(
        risk=risk,
        risk_level=risk_level,
        burn_rate=burn_rate,
        safe_usage_percent=safe_usage_percent,
        projected_exhaustion_at=projected_exhaustion_at,
        seconds_until_exhaustion=seconds_until_exhaustion,
    )


def reset_ewma_state() -> None:
    """Clear all in-memory EWMA state. Used for testing."""
    _ewma_states.clear()


def _rebuild_ewma_state(history: list) -> EWMAState | None:
    state: EWMAState | None = None
    for entry in history:
        ts = naive_utc_to_epoch(entry.recorded_at)
        state = ewma_update(state, entry.used_percent, ts, reset_at=entry.reset_at)
    return state

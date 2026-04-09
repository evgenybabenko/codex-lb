from __future__ import annotations

import inspect
from collections.abc import Awaitable, Callable, Mapping
from typing import Any, TypeVar, cast

import httpx
from openai import AsyncOpenAI, AsyncStream, OpenAI, Stream
from openai._response import APIResponse, AsyncAPIResponse
from openai._types import Headers, Omit
from openai.types.responses import CompactedResponse, Response, ResponseStreamEvent

TURN_STATE_HEADER = "x-codex-turn-state"

_SyncParseResult = TypeVar("_SyncParseResult")
_AsyncParseResult = TypeVar("_AsyncParseResult")

_CreateResult = Response | Stream[ResponseStreamEvent]


def _has_explicit_turn_state_header(headers: Mapping[str, str | Omit]) -> bool:
    return any(key.lower() == TURN_STATE_HEADER for key in headers)


def _merge_turn_state_headers(
    extra_headers: Headers | None,
    turn_state: str | None,
) -> Headers | None:
    if extra_headers is None:
        if turn_state is None:
            return None
        return {TURN_STATE_HEADER: turn_state}
    merged = dict(extra_headers)
    if turn_state is not None and not _has_explicit_turn_state_header(merged):
        merged[TURN_STATE_HEADER] = turn_state
    return merged


class _TurnStateState:
    def __init__(self, *, initial_turn_state: str | None = None) -> None:
        self._turn_state = initial_turn_state

    @property
    def turn_state(self) -> str | None:
        return self._turn_state

    def set_turn_state(self, turn_state: str | None) -> None:
        self._turn_state = turn_state

    def clear_turn_state(self) -> None:
        self._turn_state = None

    def merged_extra_headers(self, extra_headers: Headers | None) -> Headers | None:
        return _merge_turn_state_headers(extra_headers, self._turn_state)

    def remember_turn_state(self, headers: httpx.Headers) -> None:
        value = headers.get(TURN_STATE_HEADER)
        if value:
            self._turn_state = value


class _TurnStateResponsesResource:
    def __init__(self, raw_resource: Any, state: _TurnStateState) -> None:
        self._raw_resource = raw_resource
        self._state = state

    def _call_and_parse(
        self,
        method: Callable[..., APIResponse[_SyncParseResult]],
        **kwargs: Any,
    ) -> _SyncParseResult:
        extra_headers = cast(Headers | None, kwargs.pop("extra_headers", None))
        raw_response = method(
            **kwargs,
            extra_headers=self._state.merged_extra_headers(extra_headers),
        )
        self._state.remember_turn_state(raw_response.headers)
        return raw_response.parse()

    def create(self, **kwargs: Any) -> _CreateResult:
        return self._call_and_parse(self._raw_resource.create, **kwargs)

    def compact(self, **kwargs: Any) -> CompactedResponse:
        return self._call_and_parse(self._raw_resource.compact, **kwargs)


class _AsyncTurnStateResponsesResource:
    def __init__(self, raw_resource: Any, state: _TurnStateState) -> None:
        self._raw_resource = raw_resource
        self._state = state

    async def _call_and_parse(
        self,
        method: Callable[..., Awaitable[AsyncAPIResponse[_AsyncParseResult]]],
        **kwargs: Any,
    ) -> _AsyncParseResult:
        extra_headers = cast(Headers | None, kwargs.pop("extra_headers", None))
        raw_response = await method(
            **kwargs,
            extra_headers=self._state.merged_extra_headers(extra_headers),
        )
        self._state.remember_turn_state(raw_response.headers)
        parsed = raw_response.parse()
        if inspect.isawaitable(parsed):
            return await parsed
        return parsed

    async def create(self, **kwargs: Any) -> Response | AsyncStream[ResponseStreamEvent]:
        return await self._call_and_parse(self._raw_resource.create, **kwargs)

    async def compact(self, **kwargs: Any) -> CompactedResponse:
        return await self._call_and_parse(self._raw_resource.compact, **kwargs)


class TurnStateOpenAI:
    """Reference OpenAI SDK wrapper that replays codex-lb turn-state."""

    def __init__(self, client: OpenAI, *, initial_turn_state: str | None = None) -> None:
        self.client = client
        self._state = _TurnStateState(initial_turn_state=initial_turn_state)
        self.responses = _TurnStateResponsesResource(client.with_raw_response.responses, self._state)

    @property
    def turn_state(self) -> str | None:
        return self._state.turn_state

    def set_turn_state(self, turn_state: str | None) -> None:
        self._state.set_turn_state(turn_state)

    def clear_turn_state(self) -> None:
        self._state.clear_turn_state()


class AsyncTurnStateOpenAI:
    """Async reference OpenAI SDK wrapper that replays codex-lb turn-state."""

    def __init__(self, client: AsyncOpenAI, *, initial_turn_state: str | None = None) -> None:
        self.client = client
        self._state = _TurnStateState(initial_turn_state=initial_turn_state)
        self.responses = _AsyncTurnStateResponsesResource(client.with_raw_response.responses, self._state)

    @property
    def turn_state(self) -> str | None:
        return self._state.turn_state

    def set_turn_state(self, turn_state: str | None) -> None:
        self._state.set_turn_state(turn_state)

    def clear_turn_state(self) -> None:
        self._state.clear_turn_state()


__all__ = [
    "AsyncTurnStateOpenAI",
    "TURN_STATE_HEADER",
    "TurnStateOpenAI",
]

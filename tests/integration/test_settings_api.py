from __future__ import annotations

import pytest

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_settings_api_get_and_update(async_client):
    response = await async_client.get("/api/settings")
    assert response.status_code == 200
    payload = response.json()
    assert payload["stickyThreadsEnabled"] is False
    assert payload["upstreamStreamTransport"] == "default"
    assert payload["weeklyResetPreference"] == "disabled"
    assert payload["prioritizeFullWeeklyCapacity"] is True
    assert payload["routingStrategy"] == "capacity_weighted"
    assert payload["openaiCacheAffinityMaxAgeSeconds"] == 1800
    assert payload["httpResponsesSessionBridgePromptCacheIdleTtlSeconds"] == 3600
    assert payload["stickyReallocationBudgetThresholdPct"] == 95.0
    assert payload["spreadNewCodexSessions"] is False
    assert payload["spreadNewCodexSessionsWindowSeconds"] == 60
    assert payload["spreadNewCodexSessionsTopPoolSize"] == 5
    assert payload["importWithoutOverwrite"] is False
    assert payload["totpRequiredOnLogin"] is False
    assert payload["totpConfigured"] is False
    assert payload["apiKeyAuthEnabled"] is False

    response = await async_client.put(
        "/api/settings",
        json={
            "stickyThreadsEnabled": True,
            "upstreamStreamTransport": "websocket",
            "weeklyResetPreference": "earlier_reset",
            "prioritizeFullWeeklyCapacity": False,
            "routingStrategy": "round_robin",
            "openaiCacheAffinityMaxAgeSeconds": 180,
            "httpResponsesSessionBridgePromptCacheIdleTtlSeconds": 1800,
            "stickyReallocationBudgetThresholdPct": 90.0,
            "spreadNewCodexSessions": True,
            "spreadNewCodexSessionsWindowSeconds": 90,
            "spreadNewCodexSessionsTopPoolSize": 3,
            "importWithoutOverwrite": True,
            "totpRequiredOnLogin": False,
            "apiKeyAuthEnabled": True,
        },
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["stickyThreadsEnabled"] is True
    assert updated["upstreamStreamTransport"] == "websocket"
    assert updated["weeklyResetPreference"] == "earlier_reset"
    assert updated["prioritizeFullWeeklyCapacity"] is False
    assert updated["routingStrategy"] == "round_robin"
    assert updated["openaiCacheAffinityMaxAgeSeconds"] == 180
    assert updated["httpResponsesSessionBridgePromptCacheIdleTtlSeconds"] == 1800
    assert updated["stickyReallocationBudgetThresholdPct"] == 90.0
    assert updated["spreadNewCodexSessions"] is True
    assert updated["spreadNewCodexSessionsWindowSeconds"] == 90
    assert updated["spreadNewCodexSessionsTopPoolSize"] == 3
    assert updated["importWithoutOverwrite"] is True
    assert updated["totpRequiredOnLogin"] is False
    assert updated["totpConfigured"] is False
    assert updated["apiKeyAuthEnabled"] is True

    response = await async_client.get("/api/settings")
    assert response.status_code == 200
    payload = response.json()
    assert payload["stickyThreadsEnabled"] is True
    assert payload["upstreamStreamTransport"] == "websocket"
    assert payload["weeklyResetPreference"] == "earlier_reset"
    assert payload["prioritizeFullWeeklyCapacity"] is False
    assert payload["routingStrategy"] == "round_robin"
    assert payload["openaiCacheAffinityMaxAgeSeconds"] == 180
    assert payload["httpResponsesSessionBridgePromptCacheIdleTtlSeconds"] == 1800
    assert payload["stickyReallocationBudgetThresholdPct"] == 90.0
    assert payload["spreadNewCodexSessions"] is True
    assert payload["spreadNewCodexSessionsWindowSeconds"] == 90
    assert payload["spreadNewCodexSessionsTopPoolSize"] == 3
    assert payload["importWithoutOverwrite"] is True
    assert payload["totpRequiredOnLogin"] is False
    assert payload["totpConfigured"] is False
    assert payload["apiKeyAuthEnabled"] is True

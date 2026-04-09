from __future__ import annotations

import json

import httpx
import openai
import pytest

from app.core.clients.openai_turn_state import AsyncTurnStateOpenAI, TurnStateOpenAI


def _response_payload(response_id: str) -> dict[str, object]:
    return {
        "id": response_id,
        "object": "response",
        "status": "completed",
        "output": [],
        "usage": {"input_tokens": 1, "output_tokens": 1, "total_tokens": 2},
    }


def test_turn_state_openai_replays_stored_header_between_calls() -> None:
    seen_turn_states: list[str | None] = []
    seen_previous_response_ids: list[str | None] = []
    response_turn_states = iter(("http_turn_1", "http_turn_2"))

    def handler(request: httpx.Request) -> httpx.Response:
        seen_turn_states.append(request.headers.get("x-codex-turn-state"))
        body = json.loads(request.content.decode("utf-8"))
        seen_previous_response_ids.append(body.get("previous_response_id"))
        response_id = f"resp_{len(seen_turn_states)}"
        return httpx.Response(
            200,
            json=_response_payload(response_id),
            headers={"x-codex-turn-state": next(response_turn_states)},
        )

    transport = httpx.MockTransport(handler)
    with httpx.Client(transport=transport, base_url="http://testserver/v1") as http_client:
        sdk = openai.OpenAI(api_key="test", base_url="http://testserver/v1", http_client=http_client)
        client = TurnStateOpenAI(sdk)

        first = client.responses.create(model="gpt-5.1", input="Say ok.")
        assert first.id == "resp_1"
        assert client.turn_state == "http_turn_1"

        second = client.responses.create(
            model="gpt-5.1",
            input="Repeat exactly: ok",
            previous_response_id=first.id,
        )
        assert second.id == "resp_2"
        assert client.turn_state == "http_turn_2"

    assert seen_turn_states == [None, "http_turn_1"]
    assert seen_previous_response_ids == [None, "resp_1"]


@pytest.mark.asyncio
async def test_async_turn_state_openai_preserves_explicit_header_override() -> None:
    seen_turn_states: list[str | None] = []
    seen_trace_headers: list[str | None] = []
    response_turn_states = iter(("http_turn_1", "http_turn_3"))

    def handler(request: httpx.Request) -> httpx.Response:
        seen_turn_states.append(request.headers.get("x-codex-turn-state"))
        seen_trace_headers.append(request.headers.get("x-test-header"))
        response_id = f"resp_{len(seen_turn_states)}"
        return httpx.Response(
            200,
            json=_response_payload(response_id),
            headers={"x-codex-turn-state": next(response_turn_states)},
        )

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver/v1") as http_client:
        sdk = openai.AsyncOpenAI(api_key="test", base_url="http://testserver/v1", http_client=http_client)
        client = AsyncTurnStateOpenAI(sdk)

        first = await client.responses.create(model="gpt-5.1", input="hi")
        assert first.id == "resp_1"
        assert client.turn_state == "http_turn_1"

        second = await client.responses.create(
            model="gpt-5.1",
            input="hi again",
            extra_headers={
                "x-codex-turn-state": "explicit_turn_state",
                "x-test-header": "trace-value",
            },
        )
        assert second.id == "resp_2"
        assert client.turn_state == "http_turn_3"

    assert seen_turn_states == [None, "explicit_turn_state"]
    assert seen_trace_headers == [None, "trace-value"]

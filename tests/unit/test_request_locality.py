from __future__ import annotations

from fastapi import Request

from app.core.config.settings import get_settings
from app.core.request_locality import request_is_local


def _make_request(
    *,
    client_host: str | None,
    server_host: str = "testserver",
    forwarded_for: str | None = None,
) -> Request:
    headers: list[tuple[bytes, bytes]] = []
    if forwarded_for is not None:
        headers.append((b"x-forwarded-for", forwarded_for.encode("utf-8")))
    scope = {
        "type": "http",
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": "/api/dashboard-auth/session",
        "raw_path": b"/api/dashboard-auth/session",
        "query_string": b"",
        "headers": headers,
        "client": (client_host, 12345) if client_host is not None else None,
        "server": (server_host, 80),
    }
    return Request(scope)


def test_request_is_local_for_loopback(monkeypatch):
    monkeypatch.setenv("CODEX_LB_FIREWALL_TRUST_PROXY_HEADERS", "false")
    get_settings.cache_clear()

    request = _make_request(client_host="127.0.0.1")

    assert request_is_local(request) is True


def test_request_is_remote_when_trusted_proxy_reports_remote_ip(monkeypatch):
    monkeypatch.setenv("CODEX_LB_FIREWALL_TRUST_PROXY_HEADERS", "true")
    get_settings.cache_clear()

    request = _make_request(client_host="127.0.0.1", forwarded_for="203.0.113.10")

    assert request_is_local(request) is False


def test_request_is_local_for_local_hostname_when_client_unknown(monkeypatch):
    monkeypatch.setenv("CODEX_LB_FIREWALL_TRUST_PROXY_HEADERS", "false")
    get_settings.cache_clear()

    request = _make_request(client_host=None, server_host="localhost")

    assert request_is_local(request) is True

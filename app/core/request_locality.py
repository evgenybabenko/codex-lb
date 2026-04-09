from __future__ import annotations

from ipaddress import ip_address

from fastapi import Request

from app.core.config.settings import get_settings
from app.core.middleware.api_firewall import _parse_trusted_proxy_networks, resolve_connection_client_ip

_LOCAL_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "[::1]", "testserver"}


def request_is_local(request: Request) -> bool:
    settings = get_settings()
    trusted_proxy_networks = _parse_trusted_proxy_networks(settings.firewall_trusted_proxy_cidrs)
    client_ip = resolve_connection_client_ip(
        request.headers,
        request.client.host if request.client else None,
        trust_proxy_headers=settings.firewall_trust_proxy_headers,
        trusted_proxy_networks=trusted_proxy_networks,
    )
    if client_ip is not None:
        return _is_loopback_ip(client_ip)
    hostname = (request.url.hostname or "").strip().lower()
    return hostname in _LOCAL_HOSTNAMES


def _is_loopback_ip(value: str | None) -> bool:
    if not value:
        return False
    try:
        return ip_address(value).is_loopback
    except ValueError:
        return False

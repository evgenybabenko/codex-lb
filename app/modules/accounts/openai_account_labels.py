from __future__ import annotations

import logging

import aiohttp

from app.core.clients.http import get_http_client
from app.core.config.settings import get_settings
from app.core.utils.request_id import get_request_id

logger = logging.getLogger(__name__)


async def fetch_account_labels(
    access_token: str,
    chatgpt_account_id: str | None = None,
) -> dict[str, str]:
    settings = get_settings()
    url = f"{settings.upstream_base_url.rstrip('/')}/wham/accounts/check"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }
    if chatgpt_account_id:
        headers["ChatGPT-Account-Id"] = chatgpt_account_id
    request_id = get_request_id()
    if request_id:
        headers["x-request-id"] = request_id

    session = get_http_client().session
    timeout = aiohttp.ClientTimeout(total=settings.usage_fetch_timeout_seconds)
    try:
        async with session.get(url, headers=headers, timeout=timeout) as resp:
            if resp.status >= 400:
                logger.warning(
                    "Account label fetch failed status=%s request_id=%s",
                    resp.status,
                    request_id,
                )
                return {}
            payload = await resp.json(content_type=None)
    except Exception:
        logger.warning(
            "Account label fetch failed request_id=%s",
            request_id,
            exc_info=True,
        )
        return {}

    if not isinstance(payload, dict):
        return {}
    accounts = payload.get("accounts")
    if not isinstance(accounts, list):
        return {}

    labels: dict[str, str] = {}
    for entry in accounts:
        if not isinstance(entry, dict):
            continue
        account_id = entry.get("id")
        name = entry.get("name")
        if not isinstance(account_id, str):
            continue
        if not isinstance(name, str):
            continue
        normalized_name = name.strip()
        if not normalized_name:
            continue
        labels[account_id] = normalized_name
    return labels

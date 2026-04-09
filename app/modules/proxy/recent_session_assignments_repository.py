from __future__ import annotations

from collections.abc import Collection
from datetime import datetime

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Insert

from app.core.utils.time import to_utc_naive
from app.db.models import RecentSessionAssignment, StickySessionKind


class RecentSessionAssignmentsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def upsert(self, key: str, account_id: str, *, kind: StickySessionKind) -> None:
        statement = self._build_upsert_statement(key, account_id, kind)
        await self._session.execute(statement)
        await self._session.commit()

    async def latest_account_assignments_since(
        self,
        *,
        kind: StickySessionKind,
        since: datetime,
        account_ids: Collection[str] | None = None,
    ) -> dict[str, datetime]:
        statement = (
            select(
                RecentSessionAssignment.account_id,
                func.max(RecentSessionAssignment.assigned_at),
            )
            .where(
                RecentSessionAssignment.kind == kind,
                RecentSessionAssignment.assigned_at >= to_utc_naive(since),
            )
            .group_by(RecentSessionAssignment.account_id)
        )
        if account_ids:
            statement = statement.where(RecentSessionAssignment.account_id.in_(tuple(account_ids)))
        result = await self._session.execute(statement)
        return {
            str(account_id): assigned_at
            for account_id, assigned_at in result.all()
            if isinstance(account_id, str) and isinstance(assigned_at, datetime)
        }

    async def purge_before(self, cutoff: datetime, *, kind: StickySessionKind | None = None) -> int:
        statement = delete(RecentSessionAssignment).where(
            RecentSessionAssignment.assigned_at < to_utc_naive(cutoff)
        )
        if kind is not None:
            statement = statement.where(RecentSessionAssignment.kind == kind)
        result = await self._session.execute(statement.returning(RecentSessionAssignment.key))
        deleted = len(result.scalars().all())
        await self._session.commit()
        return deleted

    def _build_upsert_statement(self, key: str, account_id: str, kind: StickySessionKind) -> Insert:
        dialect = self._session.get_bind().dialect.name
        if dialect == "postgresql":
            insert_fn = pg_insert
        elif dialect == "sqlite":
            insert_fn = sqlite_insert
        else:
            raise RuntimeError(f"RecentSessionAssignment upsert unsupported for dialect={dialect!r}")
        statement = insert_fn(RecentSessionAssignment).values(
            key=key,
            account_id=account_id,
            kind=kind,
        )
        return statement.on_conflict_do_update(
            index_elements=[RecentSessionAssignment.key, RecentSessionAssignment.kind],
            set_={
                "account_id": account_id,
                "assigned_at": func.now(),
            },
        )

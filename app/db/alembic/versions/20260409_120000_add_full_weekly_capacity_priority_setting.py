"""add full weekly capacity priority setting

Revision ID: 20260409_120000_add_full_weekly_capacity_priority_setting
Revises: 20260408_150000_replace_weekly_reset_toggle_with_preference
Create Date: 2026-04-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine import Connection

revision = "20260409_120000_add_full_weekly_capacity_priority_setting"
down_revision = "20260408_150000_replace_weekly_reset_toggle_with_preference"
branch_labels = None
depends_on = None


def _columns(connection: Connection, table_name: str) -> set[str]:
    inspector = sa.inspect(connection)
    if not inspector.has_table(table_name):
        return set()
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    columns = _columns(bind, "dashboard_settings")
    if not columns or "prioritize_full_weekly_capacity" in columns:
        return

    with op.batch_alter_table("dashboard_settings") as batch_op:
        batch_op.add_column(
            sa.Column(
                "prioritize_full_weekly_capacity",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    columns = _columns(bind, "dashboard_settings")
    if not columns or "prioritize_full_weekly_capacity" not in columns:
        return

    with op.batch_alter_table("dashboard_settings") as batch_op:
        batch_op.drop_column("prioritize_full_weekly_capacity")

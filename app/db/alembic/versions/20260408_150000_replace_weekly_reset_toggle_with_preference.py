"""replace weekly reset toggle with weekly reset preference enum

Revision ID: 20260408_150000_replace_weekly_reset_toggle_with_preference
Revises: 20260403_120000_add_account_workspace_metadata
Create Date: 2026-04-08
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine import Connection

revision = "20260408_150000_replace_weekly_reset_toggle_with_preference"
down_revision = "20260403_120000_add_account_workspace_metadata"
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
    if not columns:
        return

    if "weekly_reset_preference" not in columns:
        with op.batch_alter_table("dashboard_settings") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "weekly_reset_preference",
                    sa.String(),
                    nullable=False,
                    server_default="disabled",
                )
            )

    if "prefer_earlier_reset_accounts" in columns:
        bind.execute(
            sa.text(
                """
                UPDATE dashboard_settings
                SET weekly_reset_preference = CASE
                    WHEN prefer_earlier_reset_accounts THEN 'earlier_reset'
                    ELSE 'disabled'
                END
                """
            )
        )
        with op.batch_alter_table("dashboard_settings") as batch_op:
            batch_op.drop_column("prefer_earlier_reset_accounts")


def downgrade() -> None:
    bind = op.get_bind()
    columns = _columns(bind, "dashboard_settings")
    if not columns:
        return

    if "prefer_earlier_reset_accounts" not in columns:
        with op.batch_alter_table("dashboard_settings") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "prefer_earlier_reset_accounts",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                )
            )

    if "weekly_reset_preference" in columns:
        bind.execute(
            sa.text(
                """
                UPDATE dashboard_settings
                SET prefer_earlier_reset_accounts = CASE
                    WHEN weekly_reset_preference = 'disabled' THEN 0
                    ELSE 1
                END
                """
            )
        )
        with op.batch_alter_table("dashboard_settings") as batch_op:
            batch_op.drop_column("weekly_reset_preference")

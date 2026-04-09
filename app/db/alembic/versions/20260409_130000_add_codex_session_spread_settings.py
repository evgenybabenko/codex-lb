"""add codex session spread settings

Revision ID: 20260409_130000_add_codex_session_spread_settings
Revises: 20260409_120000_add_full_weekly_capacity_priority_setting
Create Date: 2026-04-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine import Connection

revision = "20260409_130000_add_codex_session_spread_settings"
down_revision = "20260409_120000_add_full_weekly_capacity_priority_setting"
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
    if columns:
        with op.batch_alter_table("dashboard_settings") as batch_op:
            if "spread_new_codex_sessions" not in columns:
                batch_op.add_column(
                    sa.Column(
                        "spread_new_codex_sessions",
                        sa.Boolean(),
                        nullable=False,
                        server_default=sa.false(),
                    )
                )
            if "spread_new_codex_sessions_window_seconds" not in columns:
                batch_op.add_column(
                    sa.Column(
                        "spread_new_codex_sessions_window_seconds",
                        sa.Integer(),
                        nullable=False,
                        server_default=sa.text("60"),
                    )
                )
            if "spread_new_codex_sessions_top_pool_size" not in columns:
                batch_op.add_column(
                    sa.Column(
                        "spread_new_codex_sessions_top_pool_size",
                        sa.Integer(),
                        nullable=False,
                        server_default=sa.text("5"),
                    )
                )

    inspector = sa.inspect(bind)
    if inspector.has_table("recent_session_assignments"):
        return

    sticky_kind_enum = sa.Enum(
        "codex_session",
        "sticky_thread",
        "prompt_cache",
        name="sticky_session_kind",
        native_enum=False,
    )
    op.create_table(
        "recent_session_assignments",
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("kind", sticky_kind_enum, nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("assigned_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("key", "kind"),
    )
    op.create_index(
        "ix_recent_session_assignments_assigned_at",
        "recent_session_assignments",
        ["assigned_at"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("recent_session_assignments"):
        op.drop_index("ix_recent_session_assignments_assigned_at", table_name="recent_session_assignments")
        op.drop_table("recent_session_assignments")

    columns = _columns(bind, "dashboard_settings")
    if not columns:
        return

    with op.batch_alter_table("dashboard_settings") as batch_op:
        if "spread_new_codex_sessions_top_pool_size" in columns:
            batch_op.drop_column("spread_new_codex_sessions_top_pool_size")
        if "spread_new_codex_sessions_window_seconds" in columns:
            batch_op.drop_column("spread_new_codex_sessions_window_seconds")
        if "spread_new_codex_sessions" in columns:
            batch_op.drop_column("spread_new_codex_sessions")

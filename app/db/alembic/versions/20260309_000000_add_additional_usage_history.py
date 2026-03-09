"""add additional_usage_history table

Revision ID: 20260309_000000_add_additional_usage_history
Revises: 20260308_000000_add_sqlite_performance_indexes
Create Date: 2026-03-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20260309_000000_add_additional_usage_history"
down_revision = "20260308_000000_add_sqlite_performance_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "additional_usage_history",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("account_id", sa.String(), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("limit_name", sa.String(), nullable=False),
        sa.Column("metered_feature", sa.String(), nullable=False),
        sa.Column("window", sa.String(), nullable=False),
        sa.Column("used_percent", sa.Float(), nullable=False),
        sa.Column("reset_at", sa.Integer(), nullable=True),
        sa.Column("window_minutes", sa.Integer(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_additional_usage_history_account_id", "additional_usage_history", ["account_id"])
    op.create_index("ix_additional_usage_history_recorded_at", "additional_usage_history", ["recorded_at"])
    op.create_index(
        "ix_additional_usage_history_composite",
        "additional_usage_history",
        ["account_id", "limit_name", "window", "recorded_at"],
    )


def downgrade() -> None:
    op.drop_table("additional_usage_history")

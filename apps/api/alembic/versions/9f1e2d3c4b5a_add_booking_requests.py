"""add booking_requests and user.is_online

Revision ID: 9f1e2d3c4b5a
Revises: 72ac8ed24a59
Create Date: 2026-05-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f1e2d3c4b5a'
down_revision: Union[str, Sequence[str], None] = '72ac8ed24a59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # add is_online to users
    op.add_column('users', sa.Column('is_online', sa.Boolean(), nullable=True, server_default=sa.text('false')))

    # create bookingrequeststatus enum and table
    booking_status_enum = sa.Enum('requested', 'matching', 'assigned', 'expired', 'cancelled', name='bookingrequeststatus')
    booking_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'booking_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=False),
        sa.Column('lat', sa.Float(), nullable=False),
        sa.Column('lng', sa.Float(), nullable=False),
        sa.Column('radius_km', sa.Integer(), nullable=True),
        sa.Column('status', booking_status_enum, nullable=True),
        sa.Column('attempted_barbers', sa.Text(), nullable=True),
        sa.Column('assigned_barber_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['assigned_barber_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['client_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_booking_requests_id'), 'booking_requests', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_booking_requests_id'), table_name='booking_requests')
    op.drop_table('booking_requests')
    # drop enum type
    booking_status_enum = sa.Enum(name='bookingrequeststatus')
    booking_status_enum.drop(op.get_bind(), checkfirst=True)
    # drop users.is_online
    op.drop_column('users', 'is_online')

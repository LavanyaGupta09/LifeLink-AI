"""
LifeLink AI Backend — Database Setup
Async SQLAlchemy engine with SQLite (dev) / PostgreSQL (prod)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool
from app.config import settings


# Supabase uses pgbouncer in transaction mode which does NOT support
# prepared statements. We must use NullPool + statement_cache_size=0
# to prevent "DuplicatePreparedStatementError" on startup.
is_postgres = settings.DATABASE_URL.startswith("postgresql")

connect_args = {}
pool_class = AsyncAdaptedQueuePool  # default for SQLite
if is_postgres:
    connect_args = {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    pool_class = NullPool  # disable SQLAlchemy pooling — pgbouncer handles it

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),
    future=True,
    connect_args=connect_args,
    poolclass=pool_class,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models"""
    pass


async def get_db():
    """FastAPI dependency — yields an async DB session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup"""
    async with engine.begin() as conn:
        from app.models import user, health_profile, sos_event, ambulance, doctor, hospital, blood_donor, blood_request, pharmacy  # noqa
        await conn.run_sync(Base.metadata.create_all)

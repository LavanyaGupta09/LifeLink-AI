"""
LifeLink AI Backend — Database Setup
Async SQLAlchemy engine with SQLite (dev) / PostgreSQL (prod)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),
    future=True,
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

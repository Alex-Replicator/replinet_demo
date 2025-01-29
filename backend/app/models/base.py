from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime

Base = declarative_base()

class TimestampMixin:
    """Миксин для добавления полей created_at и updated_at"""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class PrimaryKeyMixin:
    """Миксин для добавления первичного ключа id"""
    id = Column(Integer, primary_key=True, index=True)
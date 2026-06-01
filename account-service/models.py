from sqlalchemy import Column, Integer, Float, String
from database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    owner = Column(String)
    balance = Column(Float, default=1000.0)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)
    receiver = Column(String)
    amount = Column(Float)
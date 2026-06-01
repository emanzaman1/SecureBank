from fastapi import FastAPI
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Account, Transaction
from schemas import TransferRequest

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def home():
    return {"message": "SecureBank Account Service"}


@app.post("/create-account/{owner}")
def create_account(owner: str):

    db: Session = SessionLocal()

    existing = db.query(Account).filter(
        Account.owner == owner
    ).first()

    if existing:
        return {"message": "Account already exists"}

    account = Account(
        owner=owner,
        balance=1000.0
    )

    db.add(account)
    db.commit()

    return {
        "message": "Account created",
        "owner": owner,
        "balance": 1000.0
    }


@app.get("/balance/{owner}")
def get_balance(owner: str):

    db: Session = SessionLocal()

    account = db.query(Account).filter(
        Account.owner == owner
    ).first()

    if not account:
        return {"error": "Account not found"}

    return {
        "owner": owner,
        "balance": account.balance
    }


@app.post("/transfer")
def transfer(data: TransferRequest):

    db: Session = SessionLocal()

    if data.amount <= 0:
        return {"error": "Amount must be greater than zero"}

    if data.amount > 10000000:
        return {"error": "Amount exceeds limit"}

    sender = db.query(Account).filter(
        Account.owner == data.sender
    ).first()

    receiver = db.query(Account).filter(
        Account.owner == data.receiver
    ).first()

    if not sender:
        return {"error": "Sender account not found"}

    if not receiver:
        return {"error": "Receiver account not found"}

    if sender.balance < data.amount:
        return {"error": "Insufficient balance"}

    sender.balance -= data.amount
    receiver.balance += data.amount

    txn = Transaction(
        sender=data.sender,
        receiver=data.receiver,
        amount=data.amount
    )

    db.add(txn)
    db.commit()

    return {
        "message": "Transfer successful",
        "amount": data.amount
    }


@app.get("/transactions")
def transactions():

    db: Session = SessionLocal()

    txns = db.query(Transaction).all()

    return txns
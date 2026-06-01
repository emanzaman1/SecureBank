from fastapi import FastAPI
from fastapi import Header
from fastapi import HTTPException

from sqlalchemy.orm import Session

from database import Base
from database import engine
from database import SessionLocal

from models import UserDB

from schemas import UserCreate
from schemas import UserLogin

from security import hash_password
from security import verify_password
from security import create_access_token
from security import verify_token
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "SecureBank Auth Service"
    }


@app.post("/register")
def register(user: UserCreate):

    db: Session = SessionLocal()

    try:

        existing_user = db.query(UserDB).filter(
            UserDB.username == user.username
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User already exists"
            )

        existing_email = db.query(UserDB).filter(
            UserDB.email == user.email
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        new_user = UserDB(
            username=user.username,
            email=user.email,
            password=hash_password(user.password),
            role="customer"
        )

        db.add(new_user)
        db.commit()

        return {
            "message": "User registered successfully"
        }

    finally:
        db.close()


@app.post("/login")
def login(user: UserLogin):

    db: Session = SessionLocal()

    try:

        db_user = db.query(UserDB).filter(
            UserDB.username == user.username
        ).first()

        if not db_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        if not verify_password(
            user.password,
            db_user.password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        token = create_access_token(
            {
                "sub": db_user.username,
                "role": db_user.role
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        db.close()


@app.get("/profile")
def profile(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing token"
        )

    token = authorization.replace(
        "Bearer ",
        ""
    )

    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return {
        "username": payload["sub"],
        "role": payload["role"]
    }


@app.get("/admin")
def admin_panel(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing token"
        )

    token = authorization.replace(
        "Bearer ",
        ""
    )

    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    if payload["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return {
        "message": "Welcome Admin"
    }
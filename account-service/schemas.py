from pydantic import BaseModel

class TransferRequest(BaseModel):
    sender: str
    receiver: str
    amount: float
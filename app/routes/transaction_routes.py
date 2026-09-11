from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os, uuid
from datetime import datetime
from app.config import UPLOAD_DIR
from app.database import get_db
from app.models import User, Customer, Transaction, Expense, Notification
from app.schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from app.auth import get_current_user
from app.routes.customer_routes import compute_customer_metrics

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    customer_id: Optional[int] = None,
    type: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: Optional[int] = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    if type and type != "all":
        query = query.filter(Transaction.type == type)
    if payment_method and payment_method != "all":
        query = query.filter(Transaction.payment_method == payment_method)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        s = f"%{search}%"
        query = query.join(Customer, Transaction.customer_id == Customer.id, isouter=True).filter(
            (Transaction.description.ilike(s)) |
            (Transaction.payment_method.ilike(s)) |
            (Customer.name.ilike(s)) |
            (Customer.phone.ilike(s))
        )

    txs = query.order_by(Transaction.date.desc(), Transaction.id.desc()).limit(limit).all()

    # Pre-fetch customer names
    customer_ids = {t.customer_id for t in txs if t.customer_id}
    customers = {c.id: c.name for c in db.query(Customer).filter(Customer.id.in_(customer_ids)).all()} if customer_ids else {}

    results = []
    for t in txs:
        results.append({
            "id": t.id,
            "user_id": t.user_id,
            "customer_id": t.customer_id,
            "customer_name": customers.get(t.customer_id) if t.customer_id else None,
            "date": t.date,
            "type": t.type,
            "amount": t.amount,
            "description": t.description,
            "payment_method": t.payment_method or "Cash",
            "receipt_path": t.receipt_path,
            "running_balance": t.running_balance or 0.0,
            "created_at": t.created_at
        })
    return results

@router.post("", response_model=TransactionResponse)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = None
    if tx_in.customer_id:
        customer = db.query(Customer).filter(
            Customer.id == tx_in.customer_id,
            Customer.user_id == current_user.id
        ).first()
        if not customer:
            raise HTTPException(status_code=400, detail="Invalid Customer ID")

    new_tx = Transaction(
        user_id=current_user.id,
        customer_id=tx_in.customer_id,
        date=tx_in.date or datetime.now().strftime("%Y-%m-%d"),
        type=tx_in.type,
        amount=abs(tx_in.amount),
        description=tx_in.description,
        payment_method=tx_in.payment_method or "Cash",
        receipt_path=tx_in.receipt_path,
        running_balance=0.0
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    running_bal = 0.0
    if customer:
        metrics = compute_customer_metrics(customer, db)
        running_bal = metrics["current_balance"]
        new_tx.running_balance = running_bal
        db.commit()

        # Send notification for payment received or large credit
        if tx_in.type == "debit":
            db.add(Notification(
                user_id=current_user.id,
                title="Payment Received",
                message=f"Received ₨{tx_in.amount:,.2f} from {customer.name} via {tx_in.payment_method}.",
                type="success"
            ))
        elif tx_in.type == "credit":
            db.add(Notification(
                user_id=current_user.id,
                title="Udhaar / Credit Given",
                message=f"Added ₨{tx_in.amount:,.2f} Udhaar for {customer.name}.",
                type="info"
            ))
            if running_bal > 15000:
                db.add(Notification(
                    user_id=current_user.id,
                    title="High Outstanding Balance",
                    message=f"{customer.name} has an outstanding balance of ₨{running_bal:,.2f}.",
                    type="warning"
                ))

        db.commit()

    return {
        "id": new_tx.id,
        "user_id": new_tx.user_id,
        "customer_id": new_tx.customer_id,
        "customer_name": customer.name if customer else None,
        "date": new_tx.date,
        "type": new_tx.type,
        "amount": new_tx.amount,
        "description": new_tx.description,
        "payment_method": new_tx.payment_method,
        "receipt_path": new_tx.receipt_path,
        "running_balance": running_bal,
        "created_at": new_tx.created_at
    }

@router.post("/receipt-upload")
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"receipt_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    return {"receipt_url": f"/uploads/{filename}"}

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: int,
    tx_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx_in.customer_id is not None:
        customer = db.query(Customer).filter(
            Customer.id == tx_in.customer_id,
            Customer.user_id == current_user.id
        ).first()
        if not customer:
            raise HTTPException(status_code=400, detail="Invalid Customer ID")
        tx.customer_id = tx_in.customer_id
    if tx_in.type is not None:
        tx.type = tx_in.type
    if tx_in.amount is not None:
        tx.amount = abs(tx_in.amount)
    if tx_in.date is not None:
        tx.date = tx_in.date
    if tx_in.payment_method is not None:
        tx.payment_method = tx_in.payment_method
    if tx_in.description is not None:
        tx.description = tx_in.description

    db.commit()
    db.refresh(tx)

    # Recalculate running balance
    customer = db.query(Customer).filter(Customer.id == tx.customer_id).first() if tx.customer_id else None
    running_bal = 0.0
    if customer:
        metrics = compute_customer_metrics(customer, db)
        running_bal = metrics["current_balance"]
        tx.running_balance = running_bal
        db.commit()

    return {
        "id": tx.id,
        "user_id": tx.user_id,
        "customer_id": tx.customer_id,
        "customer_name": customer.name if customer else None,
        "date": tx.date,
        "type": tx.type,
        "amount": tx.amount,
        "description": tx.description,
        "payment_method": tx.payment_method,
        "receipt_path": tx.receipt_path,
        "running_balance": running_bal,
        "created_at": tx.created_at
    }

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}

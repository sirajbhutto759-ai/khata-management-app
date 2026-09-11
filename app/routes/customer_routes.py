from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Customer, Transaction
from app.schemas import CustomerCreate, CustomerUpdate, CustomerResponse, TransactionResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/customers", tags=["Customers"])

def compute_customer_metrics(customer: Customer, db: Session):
    txs = db.query(Transaction).filter(
        Transaction.user_id == customer.user_id,
        Transaction.customer_id == customer.id
    ).order_by(Transaction.date.asc(), Transaction.id.asc()).all()

    total_credit = 0.0
    total_received = 0.0
    running_bal = customer.opening_balance

    for tx in txs:
        if tx.type == "credit":
            total_credit += tx.amount
            running_bal += tx.amount
        elif tx.type == "debit":
            total_received += tx.amount
            running_bal -= tx.amount
        elif tx.type == "adjustment":
            running_bal += tx.amount  # Positive adds to receivable, negative reduces

    return {
        "current_balance": running_bal,
        "total_credit": total_credit,
        "total_received": total_received,
        "transactions_count": len(txs)
    }

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    filter_type: Optional[str] = "all", # all, debtor (receivable), creditor (payable), zero
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Customer).filter(Customer.user_id == current_user.id)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Customer.name.ilike(s)) | (Customer.phone.ilike(s)) | (Customer.address.ilike(s))
        )
    
    customers = query.order_by(Customer.name.asc()).all()
    results = []

    for c in customers:
        metrics = compute_customer_metrics(c, db)
        bal = metrics["current_balance"]

        if filter_type == "debtor" and bal <= 0:
            continue
        if filter_type == "creditor" and bal >= 0:
            continue
        if filter_type == "zero" and bal != 0:
            continue

        c_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "name": c.name,
            "phone": c.phone,
            "address": c.address,
            "opening_balance": c.opening_balance,
            "notes": c.notes,
            "current_balance": bal,
            "total_credit": metrics["total_credit"],
            "total_received": metrics["total_received"],
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }
        results.append(c_dict)

    return results

@router.post("", response_model=CustomerResponse)
def create_customer(
    customer_in: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_customer = Customer(
        user_id=current_user.id,
        name=customer_in.name.strip(),
        phone=customer_in.phone.strip() if customer_in.phone else None,
        address=customer_in.address.strip() if customer_in.address else None,
        opening_balance=customer_in.opening_balance or 0.0,
        notes=customer_in.notes
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    metrics = compute_customer_metrics(new_customer, db)
    return {
        "id": new_customer.id,
        "user_id": new_customer.user_id,
        "name": new_customer.name,
        "phone": new_customer.phone,
        "address": new_customer.address,
        "opening_balance": new_customer.opening_balance,
        "notes": new_customer.notes,
        "current_balance": metrics["current_balance"],
        "total_credit": metrics["total_credit"],
        "total_received": metrics["total_received"],
        "created_at": new_customer.created_at,
        "updated_at": new_customer.updated_at
    }

@router.get("/{customer_id}", response_model=dict)
def get_customer_detail(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.user_id == current_user.id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    metrics = compute_customer_metrics(customer, db)
    
    # Get ledger transactions with running balance per row
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.customer_id == customer_id
    ).order_by(Transaction.date.asc(), Transaction.id.asc()).all()

    ledger = []
    r_bal = customer.opening_balance
    for t in txs:
        if t.type == "credit":
            r_bal += t.amount
        elif t.type == "debit":
            r_bal -= t.amount
        elif t.type == "adjustment":
            r_bal += t.amount

        ledger.append({
            "id": t.id,
            "date": t.date,
            "type": t.type,
            "amount": t.amount,
            "description": t.description,
            "payment_method": t.payment_method,
            "receipt_path": t.receipt_path,
            "running_balance": r_bal,
            "created_at": t.created_at
        })

    return {
        "customer": {
            "id": customer.id,
            "user_id": customer.user_id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "opening_balance": customer.opening_balance,
            "notes": customer.notes,
            "current_balance": metrics["current_balance"],
            "total_credit": metrics["total_credit"],
            "total_received": metrics["total_received"],
            "created_at": customer.created_at,
            "updated_at": customer.updated_at
        },
        "ledger": ledger
    }

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.user_id == current_user.id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if customer_in.name is not None:
        customer.name = customer_in.name.strip()
    if customer_in.phone is not None:
        customer.phone = customer_in.phone.strip()
    if customer_in.address is not None:
        customer.address = customer_in.address.strip()
    if customer_in.notes is not None:
        customer.notes = customer_in.notes.strip()

    db.commit()
    db.refresh(customer)

    metrics = compute_customer_metrics(customer, db)
    return {
        "id": customer.id,
        "user_id": customer.user_id,
        "name": customer.name,
        "phone": customer.phone,
        "address": customer.address,
        "opening_balance": customer.opening_balance,
        "notes": customer.notes,
        "current_balance": metrics["current_balance"],
        "total_credit": metrics["total_credit"],
        "total_received": metrics["total_received"],
        "created_at": customer.created_at,
        "updated_at": customer.updated_at
    }

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.user_id == current_user.id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()
    return {"message": "Customer and associated ledger deleted successfully"}

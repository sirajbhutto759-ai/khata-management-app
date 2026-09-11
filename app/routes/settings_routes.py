from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Response
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
import os, json
from datetime import datetime, timezone
from app.config import DATABASE_URL, BASE_DIR, UPLOAD_DIR
from app.database import get_db
from app.models import User, Customer, Transaction, Expense, ExpenseCategory, Notification
from app.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/backup")
def export_database_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Export user's full data as JSON backup structure
    customers = db.query(Customer).filter(Customer.user_id == current_user.id).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    categories = db.query(ExpenseCategory).filter(ExpenseCategory.user_id == current_user.id).all()

    backup_data = {
        "version": "1.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "business": {
            "business_name": current_user.business_name,
            "owner_name": current_user.owner_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "currency": current_user.currency,
            "language": current_user.language
        },
        "customers": [{
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "address": c.address,
            "opening_balance": c.opening_balance,
            "notes": c.notes,
            "created_at": c.created_at.isoformat() if c.created_at else None
        } for c in customers],
        "categories": [{
            "id": cat.id,
            "name": cat.name,
            "icon": cat.icon
        } for cat in categories],
        "expenses": [{
            "id": e.id,
            "title": e.title,
            "category_name": e.category_name,
            "amount": e.amount,
            "date": e.date,
            "payment_method": e.payment_method,
            "description": e.description
        } for e in expenses],
        "transactions": [{
            "id": t.id,
            "customer_id": t.customer_id,
            "date": t.date,
            "type": t.type,
            "amount": t.amount,
            "description": t.description,
            "payment_method": t.payment_method,
            "running_balance": t.running_balance
        } for t in transactions]
    }

    content = json.dumps(backup_data, indent=2)
    filename = f"khata_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/restore")
async def restore_database_backup(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        backup_data = json.loads(content.decode("utf-8"))

        if "customers" not in backup_data or "transactions" not in backup_data:
            raise HTTPException(status_code=400, detail="Invalid Khata backup file format.")

        # Map old customer IDs to new customer IDs
        cust_id_map = {}

        for c_data in backup_data.get("customers", []):
            new_cust = Customer(
                user_id=current_user.id,
                name=c_data["name"],
                phone=c_data.get("phone"),
                address=c_data.get("address"),
                opening_balance=c_data.get("opening_balance", 0.0),
                notes=c_data.get("notes")
            )
            db.add(new_cust)
            db.commit()
            db.refresh(new_cust)
            cust_id_map[c_data["id"]] = new_cust.id

        # Restore Categories
        for cat_data in backup_data.get("categories", []):
            existing = db.query(ExpenseCategory).filter(
                ExpenseCategory.user_id == current_user.id,
                ExpenseCategory.name == cat_data["name"]
            ).first()
            if not existing:
                db.add(ExpenseCategory(
                    user_id=current_user.id,
                    name=cat_data["name"],
                    icon=cat_data.get("icon", "tag")
                ))
        db.commit()

        # Restore Expenses
        for exp_data in backup_data.get("expenses", []):
            db.add(Expense(
                user_id=current_user.id,
                title=exp_data["title"],
                category_name=exp_data.get("category_name", "Other"),
                amount=exp_data["amount"],
                date=exp_data["date"],
                payment_method=exp_data.get("payment_method", "Cash"),
                description=exp_data.get("description")
            ))
        db.commit()

        # Restore Transactions
        for tx_data in backup_data.get("transactions", []):
            old_cid = tx_data.get("customer_id")
            new_cid = cust_id_map.get(old_cid) if old_cid else None

            db.add(Transaction(
                user_id=current_user.id,
                customer_id=new_cid,
                date=tx_data["date"],
                type=tx_data["type"],
                amount=tx_data["amount"],
                description=tx_data.get("description"),
                payment_method=tx_data.get("payment_method", "Cash"),
                running_balance=tx_data.get("running_balance", 0.0)
            ))
        db.commit()

        # Add notification
        db.add(Notification(
            user_id=current_user.id,
            title="Database Restored",
            message=f"Successfully restored {len(backup_data.get('customers', []))} customers and {len(backup_data.get('transactions', []))} transactions.",
            type="success"
        ))
        db.commit()

        return {"message": "Data restored successfully!"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to restore backup: {str(e)}")

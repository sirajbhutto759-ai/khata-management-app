from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Expense, ExpenseCategory
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseCategoryResponse, ExpenseCategoryCreate
from app.auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("/categories", response_model=List[ExpenseCategoryResponse])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    categories = db.query(ExpenseCategory).filter(
        (ExpenseCategory.user_id == current_user.id) | (ExpenseCategory.user_id.is_(None))
    ).all()
    return categories

@router.post("/categories", response_model=ExpenseCategoryResponse)
def create_category(
    cat_in: ExpenseCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cat = ExpenseCategory(
        user_id=current_user.id,
        name=cat_in.name.strip(),
        icon=cat_in.icon or "tag"
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    category_name: Optional[str] = None,
    payment_method: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    if category_name and category_name != "all":
        query = query.filter(Expense.category_name == category_name)
    if payment_method and payment_method != "all":
        query = query.filter(Expense.payment_method == payment_method)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Expense.title.ilike(s)) | (Expense.description.ilike(s)) | (Expense.category_name.ilike(s))
        )

    expenses = query.order_by(Expense.date.desc(), Expense.id.desc()).all()
    return expenses

@router.post("", response_model=ExpenseResponse)
def create_expense(
    exp_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_expense = Expense(
        user_id=current_user.id,
        category_name=exp_in.category_name,
        title=exp_in.title.strip(),
        amount=abs(exp_in.amount),
        date=exp_in.date or datetime.now().strftime("%Y-%m-%d"),
        payment_method=exp_in.payment_method or "Cash",
        description=exp_in.description
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    exp_in: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    if exp_in.title is not None:
        exp.title = exp_in.title.strip()
    if exp_in.category_name is not None:
        exp.category_name = exp_in.category_name
    if exp_in.amount is not None:
        exp.amount = abs(exp_in.amount)
    if exp_in.date is not None:
        exp.date = exp_in.date
    if exp_in.payment_method is not None:
        exp.payment_method = exp_in.payment_method
    if exp_in.description is not None:
        exp.description = exp_in.description

    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted successfully"}

@router.get("/summary")
def get_expense_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.now().strftime("%Y-%m-%d")
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    month_start = datetime.now().strftime("%Y-%m-01")

    all_exp = db.query(Expense).filter(Expense.user_id == current_user.id).all()

    daily = sum(e.amount for e in all_exp if e.date == today)
    weekly = sum(e.amount for e in all_exp if e.date >= seven_days_ago)
    monthly = sum(e.amount for e in all_exp if e.date >= month_start)
    total = sum(e.amount for e in all_exp)

    # Category breakdown
    cat_breakdown = {}
    for e in all_exp:
        cat_breakdown[e.category_name] = cat_breakdown.get(e.category_name, 0.0) + e.amount

    return {
        "daily": daily,
        "weekly": weekly,
        "monthly": monthly,
        "total": total,
        "category_breakdown": cat_breakdown
    }

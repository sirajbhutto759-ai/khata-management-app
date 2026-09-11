from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import csv, io
from app.database import get_db
from app.models import User, Customer, Transaction, Expense
from app.auth import get_current_user
from app.routes.customer_routes import compute_customer_metrics

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/summary")
def get_reports_summary(
    report_type: str = "monthly", # daily, weekly, monthly, custom, profit_loss
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.now()
    if report_type == "daily":
        s_date = today.strftime("%Y-%m-%d")
        e_date = s_date
    elif report_type == "weekly":
        s_date = (today - timedelta(days=7)).strftime("%Y-%m-%d")
        e_date = today.strftime("%Y-%m-%d")
    elif report_type == "monthly":
        s_date = today.strftime("%Y-%m-01")
        e_date = today.strftime("%Y-%m-%d")
    else:
        s_date = start_date or "2020-01-01"
        e_date = end_date or today.strftime("%Y-%m-%d")

    # Fetch Transactions
    tx_query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= s_date,
        Transaction.date <= e_date
    )
    if customer_id:
        tx_query = tx_query.filter(Transaction.customer_id == customer_id)

    txs = tx_query.order_by(Transaction.date.asc()).all()

    # Fetch Expenses
    exp_query = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date >= s_date,
        Expense.date <= e_date
    )
    expenses = exp_query.order_by(Expense.date.asc()).all()

    # Pre-fetch Customer Info
    cust_ids = {t.customer_id for t in txs if t.customer_id}
    customers = {c.id: c.name for c in db.query(Customer).filter(Customer.id.in_(cust_ids)).all()} if cust_ids else {}

    total_income = sum(t.amount for t in txs if t.type == "debit")  # Payment Received
    total_credit_given = sum(t.amount for t in txs if t.type == "credit")  # Udhaar Given
    total_expense = sum(e.amount for e in expenses)
    net_profit = total_income - total_expense

    tx_list = [{
        "id": t.id,
        "date": t.date,
        "customer_name": customers.get(t.customer_id, "N/A"),
        "type": t.type,
        "amount": t.amount,
        "payment_method": t.payment_method,
        "description": t.description
    } for t in txs]

    exp_list = [{
        "id": e.id,
        "date": e.date,
        "title": e.title,
        "category_name": e.category_name,
        "amount": e.amount,
        "payment_method": e.payment_method,
        "description": e.description
    } for e in expenses]

    return {
        "report_type": report_type,
        "start_date": s_date,
        "end_date": e_date,
        "total_income": total_income,
        "total_credit_given": total_credit_given,
        "total_expense": total_expense,
        "net_profit": net_profit,
        "transactions_count": len(txs),
        "expenses_count": len(expenses),
        "transactions": tx_list,
        "expenses": exp_list
    }

@router.get("/receivables")
def get_receivable_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customers = db.query(Customer).filter(Customer.user_id == current_user.id).all()
    debtors = []
    total_receivable = 0.0

    for c in customers:
        metrics = compute_customer_metrics(c, db)
        bal = metrics["current_balance"]
        if bal > 0:
            total_receivable += bal
            debtors.append({
                "id": c.id,
                "name": c.name,
                "phone": c.phone,
                "address": c.address,
                "balance": bal,
                "total_credit": metrics["total_credit"],
                "total_received": metrics["total_received"]
            })

    debtors.sort(key=lambda x: x["balance"], reverse=True)
    return {
        "total_receivable": total_receivable,
        "debtors_count": len(debtors),
        "debtors": debtors
    }

@router.get("/payables")
def get_payable_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customers = db.query(Customer).filter(Customer.user_id == current_user.id).all()
    creditors = []
    total_payable = 0.0

    for c in customers:
        metrics = compute_customer_metrics(c, db)
        bal = metrics["current_balance"]
        if bal < 0:
            abs_bal = abs(bal)
            total_payable += abs_bal
            creditors.append({
                "id": c.id,
                "name": c.name,
                "phone": c.phone,
                "address": c.address,
                "balance": abs_bal,
                "total_credit": metrics["total_credit"],
                "total_received": metrics["total_received"]
            })

    creditors.sort(key=lambda x: x["balance"], reverse=True)
    return {
        "total_payable": total_payable,
        "creditors_count": len(creditors),
        "creditors": creditors
    }

@router.get("/export/csv")
def export_report_csv(
    report_type: str = "transactions", # transactions, expenses, customers, receivables, payables
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "transactions":
        writer.writerow(["ID", "Date", "Customer", "Type", "Amount (PKR)", "Payment Method", "Description"])
        query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
        if start_date: query = query.filter(Transaction.date >= start_date)
        if end_date: query = query.filter(Transaction.date <= end_date)
        txs = query.order_by(Transaction.date.asc()).all()

        cust_ids = {t.customer_id for t in txs if t.customer_id}
        cust_map = {c.id: c.name for c in db.query(Customer).filter(Customer.id.in_(cust_ids)).all()} if cust_ids else {}

        for t in txs:
            writer.writerow([
                t.id, t.date, cust_map.get(t.customer_id, "N/A"),
                t.type, f"{t.amount:.2f}", t.payment_method, t.description or ""
            ])

    elif report_type == "expenses":
        writer.writerow(["ID", "Date", "Title", "Category", "Amount (PKR)", "Payment Method", "Description"])
        query = db.query(Expense).filter(Expense.user_id == current_user.id)
        if start_date: query = query.filter(Expense.date >= start_date)
        if end_date: query = query.filter(Expense.date <= end_date)
        exps = query.order_by(Expense.date.asc()).all()

        for e in exps:
            writer.writerow([
                e.id, e.date, e.title, e.category_name,
                f"{e.amount:.2f}", e.payment_method, e.description or ""
            ])

    elif report_type in ["customers", "receivables", "payables"]:
        bal_header = "Current Balance (PKR)"
        if report_type == "receivables":
            bal_header = "Receivable Balance (PKR)"
        elif report_type == "payables":
            bal_header = "Payable Balance (PKR)"

        writer.writerow(["ID", "Customer Name", "Phone", "Address", "Opening Balance", bal_header])
        customers = db.query(Customer).filter(Customer.user_id == current_user.id).all()
        for c in customers:
            metrics = compute_customer_metrics(c, db)
            bal = metrics["current_balance"]
            if report_type == "receivables" and bal <= 0:
                continue
            if report_type == "payables" and bal >= 0:
                continue
            
            display_bal = abs(bal) if report_type == "payables" else bal
            writer.writerow([
                c.id, c.name, c.phone or "", c.address or "",
                f"{c.opening_balance:.2f}", f"{display_bal:.2f}"
            ])

    output.seek(0)
    filename = f"khata_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

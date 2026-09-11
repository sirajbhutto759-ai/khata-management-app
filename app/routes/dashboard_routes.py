from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Customer, Transaction, Expense
from app.auth import get_current_user
from app.routes.customer_routes import compute_customer_metrics

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Fetch Customers & calculate receivables/payables
    customers = db.query(Customer).filter(Customer.user_id == current_user.id).all()
    total_receivable = 0.0
    total_payable = 0.0
    top_debtors = []

    for c in customers:
        metrics = compute_customer_metrics(c, db)
        bal = metrics["current_balance"]
        if bal > 0:
            total_receivable += bal
            top_debtors.append({
                "id": c.id,
                "name": c.name,
                "phone": c.phone,
                "current_balance": bal
            })
        elif bal < 0:
            total_payable += abs(bal)

    top_debtors.sort(key=lambda x: x["current_balance"], reverse=True)
    top_debtors = top_debtors[:5]

    # Today's Income (Debit/Payment Received)
    todays_income = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date == today_str,
        Transaction.type == "debit"
    ).all()
    todays_income_sum = sum(t.amount for t in todays_income)

    # Today's Expenses
    todays_expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date == today_str
    ).all()
    todays_expenses_sum = sum(e.amount for e in todays_expenses)

    # Counts
    total_customers_count = len(customers)
    total_transactions_count = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()

    # Recent Transactions
    recent_txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc(), Transaction.id.desc()).limit(7).all()

    cust_ids = {t.customer_id for t in recent_txs if t.customer_id}
    cust_map = {c.id: c.name for c in db.query(Customer).filter(Customer.id.in_(cust_ids)).all()} if cust_ids else {}

    recent_tx_list = [{
        "id": t.id,
        "date": t.date,
        "customer_id": t.customer_id,
        "customer_name": cust_map.get(t.customer_id, "N/A"),
        "type": t.type,
        "amount": t.amount,
        "payment_method": t.payment_method,
        "description": t.description
    } for t in recent_txs]

    # Monthly income / expense chart data (Last 6 Months)
    monthly_labels = []
    monthly_income = []
    monthly_expenses = []

    now = datetime.now()
    for i in range(5, -1, -1):
        # Calculate month date target
        month_dt = now.replace(day=1) - timedelta(days=i*28)
        month_str = month_dt.strftime("%Y-%m")
        month_label = month_dt.strftime("%b %Y")
        monthly_labels.append(month_label)

        # Monthly Payments Received (Income)
        m_inc = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "debit",
            Transaction.date.like(f"{month_str}%")
        ).all()
        monthly_income.append(sum(t.amount for t in m_inc))

        # Monthly Expenses
        m_exp = db.query(Expense).filter(
            Expense.user_id == current_user.id,
            Expense.date.like(f"{month_str}%")
        ).all()
        monthly_expenses.append(sum(e.amount for e in m_exp))

    return {
        "total_receivable": total_receivable,
        "total_payable": total_payable,
        "todays_income": todays_income_sum,
        "todays_expenses": todays_expenses_sum,
        "total_customers": total_customers_count,
        "total_transactions": total_transactions_count,
        "recent_transactions": recent_tx_list,
        "top_debtors": top_debtors,
        "monthly_chart": {
            "labels": monthly_labels,
            "income": monthly_income,
            "expenses": monthly_expenses
        }
    }

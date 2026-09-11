"""
Demo Data Seeder Script for Khata Management Application
Run: python seed_demo.py
"""

from app.database import SessionLocal, engine, Base
from app.models import User, Customer, Transaction, Expense, ExpenseCategory, Notification
from app.auth import get_password_hash
from datetime import datetime, timedelta

def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if demo user exists
        existing = db.query(User).filter(User.email == "demo@khata.pk").first()
        if existing:
            print("Demo user already exists. Email: demo@khata.pk | Password: password123")
            return

        print("Seeding sample Pakistani shopkeeper data...")

        # 1. Create Demo User
        demo_user = User(
            business_name="Digital Khata Store",
            owner_name="Chaudhry Muhammad Siraj",
            email="demo@khata.pk",
            phone="03009876543",
            password_hash=get_password_hash("password123"),
            currency="PKR",
            language="en",
            theme="light"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # 2. Seed Default Expense Categories
        categories = [
            ExpenseCategory(user_id=demo_user.id, name="Rent", icon="home"),
            ExpenseCategory(user_id=demo_user.id, name="Electricity", icon="zap"),
            ExpenseCategory(user_id=demo_user.id, name="Salary", icon="users"),
            ExpenseCategory(user_id=demo_user.id, name="Transport", icon="truck"),
            ExpenseCategory(user_id=demo_user.id, name="Food", icon="coffee"),
            ExpenseCategory(user_id=demo_user.id, name="Internet", icon="wifi"),
            ExpenseCategory(user_id=demo_user.id, name="Purchases", icon="shopping-bag"),
            ExpenseCategory(user_id=demo_user.id, name="Other", icon="more-horizontal"),
        ]
        db.add_all(categories)
        db.commit()

        # 3. Seed Customers
        today = datetime.now()
        cust1 = Customer(user_id=demo_user.id, name="Tariq Auto Spares", phone="03125551122", address="Shop #14, Badami Bagh, Lahore", opening_balance=2500.0, notes="Regular wholesale customer")
        cust2 = Customer(user_id=demo_user.id, name="Prime Electronics", phone="03017778899", address="Hall Road, Lahore", opening_balance=0.0, notes="Pays via JazzCash")
        cust3 = Customer(user_id=demo_user.id, name="Al-Madina Medical Store", phone="03334445566", address="Main Bazaar, Rawalpindi", opening_balance=12000.0, notes="High credit limit")
        cust4 = Customer(user_id=demo_user.id, name="Ali Khan", phone="03451122334", address="Sector F-8, Islamabad", opening_balance=-1500.0, notes="We owe him refund for returned items")

        db.add_all([cust1, cust2, cust3, cust4])
        db.commit()
        db.refresh(cust1)
        db.refresh(cust2)
        db.refresh(cust3)

        # 4. Seed Transactions
        d_today = today.strftime("%Y-%m-%d")
        d_yesterday = (today - timedelta(days=1)).strftime("%Y-%m-%d")
        d_3days = (today - timedelta(days=3)).strftime("%Y-%m-%d")

        txs = [
            Transaction(user_id=demo_user.id, customer_id=cust1.id, date=d_3days, type="credit", amount=8500.0, payment_method="Cash", description="10 Cartons Oil & Fluids", running_balance=11000.0),
            Transaction(user_id=demo_user.id, customer_id=cust1.id, date=d_yesterday, type="debit", amount=5000.0, payment_method="JazzCash", description="Online transfer", running_balance=6000.0),
            Transaction(user_id=demo_user.id, customer_id=cust2.id, date=d_yesterday, type="credit", amount=14500.0, payment_method="Cash", description="LED Displays bulk purchase", running_balance=14500.0),
            Transaction(user_id=demo_user.id, customer_id=cust2.id, date=d_today, type="debit", amount=10000.0, payment_method="Easypaisa", description="Partial settlement", running_balance=4500.0),
            Transaction(user_id=demo_user.id, customer_id=cust3.id, date=d_today, type="credit", amount=18000.0, payment_method="Cash", description="Surgical supplies & medicines", running_balance=30000.0),
        ]
        db.add_all(txs)

        # 5. Seed Expenses
        exps = [
            Expense(user_id=demo_user.id, category_name="Rent", title="Monthly Shop Rent", amount=25000.0, date=d_3days, payment_method="Bank Transfer", description="Paid to landlord"),
            Expense(user_id=demo_user.id, category_name="Electricity", title="K-Electric Bill", amount=6800.0, date=d_yesterday, payment_method="Easypaisa", description="Shop commercial meter"),
            Expense(user_id=demo_user.id, category_name="Salary", title="Helper Staff Salary", amount=18000.0, date=d_today, payment_method="Cash", description="Monthly wages for Bilal"),
            Expense(user_id=demo_user.id, category_name="Food", title="Tea & Lunch for Customers", amount=750.0, date=d_today, payment_method="Cash", description="Daily refreshments")
        ]
        db.add_all(exps)

        # 6. Notifications
        notifs = [
            Notification(user_id=demo_user.id, title="Welcome to Digital Khata Book", message="Assalamu Alaikum! Your digital ledger is ready.", type="success"),
            Notification(user_id=demo_user.id, title="Payment Received", message="Received ₨10,000.00 from Bismillah Electronics via Easypaisa.", type="success"),
            Notification(user_id=demo_user.id, title="High Balance Alert", message="Al-Madina Medical Store has an outstanding balance of ₨30,000.00.", type="warning")
        ]
        db.add_all(notifs)

        db.commit()
        print("Demo data seeded successfully!")
        print("Login Credentials: Email: demo@khata.pk | Password: password123")

    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()

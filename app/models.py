from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    currency = Column(String(10), default="PKR")
    language = Column(String(10), default="en")
    theme = Column(String(10), default="light")
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    customers = relationship("Customer", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    expense_categories = relationship("ExpenseCategory", back_populates="user", cascade="all, delete-orphan")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), index=True, nullable=True)
    address = Column(String(500), nullable=True)
    opening_balance = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="customers")
    transactions = relationship("Transaction", back_populates="customer", cascade="all, delete-orphan")

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), default="tag")

    user = relationship("User", back_populates="expense_categories")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    category_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    payment_method = Column(String(50), default="Cash")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="expenses")
    category = relationship("ExpenseCategory")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True, nullable=True)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    type = Column(String(50), nullable=False)  # credit (udhaar given), debit (payment received), expense, adjustment
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    payment_method = Column(String(50), default="Cash")
    receipt_path = Column(String(500), nullable=True)
    running_balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="transactions")
    customer = relationship("Customer", back_populates="transactions")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")

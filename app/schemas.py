from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# Authentication Schemas
class UserRegister(BaseModel):
    business_name: str
    owner_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class UserProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    owner_name: Optional[str] = None
    phone: Optional[str] = None
    currency: Optional[str] = "PKR"
    language: Optional[str] = "en"
    theme: Optional[str] = "light"
    logo_url: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_name: str
    owner_name: str
    email: str
    phone: Optional[str] = None
    currency: str
    language: str
    theme: str
    logo_url: Optional[str] = None
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Customer Schemas
class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    opening_balance: Optional[float] = 0.0
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    opening_balance: float
    notes: Optional[str] = None
    current_balance: float = 0.0
    total_credit: float = 0.0
    total_received: float = 0.0
    created_at: datetime
    updated_at: datetime

# Transaction Schemas
class TransactionCreate(BaseModel):
    customer_id: Optional[int] = None
    date: str  # YYYY-MM-DD
    type: str  # credit, debit, expense, adjustment
    amount: float
    description: Optional[str] = None
    payment_method: Optional[str] = "Cash"
    receipt_path: Optional[str] = None

class TransactionUpdate(BaseModel):
    customer_id: Optional[int] = None
    date: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    receipt_path: Optional[str] = None

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    date: str
    type: str
    amount: float
    description: Optional[str] = None
    payment_method: str
    receipt_path: Optional[str] = None
    running_balance: float
    created_at: datetime

# Expense Schemas
class ExpenseCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "tag"

class ExpenseCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str

class ExpenseCreate(BaseModel):
    title: str
    category_name: str
    amount: float
    date: str  # YYYY-MM-DD
    payment_method: Optional[str] = "Cash"
    description: Optional[str] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category_name: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None

class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    category_id: Optional[int] = None
    category_name: str
    title: str
    amount: float
    date: str
    payment_method: str
    description: Optional[str] = None
    created_at: datetime

# Notification Schema
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

# Dashboard Summary Schema
class DashboardSummary(BaseModel):
    total_receivable: float
    total_payable: float
    todays_income: float
    todays_expenses: float
    total_customers: int
    total_transactions: int
    recent_transactions: List[TransactionResponse]
    top_debtors: List[CustomerResponse]
    monthly_chart: dict

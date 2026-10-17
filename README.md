# 📘 Digital Khata Book & Accounting Application

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![SQLite](https://img.shields.io/badge/SQLite-Zero--Config-003B57.svg?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Chart.js](https://img.shields.io/badge/Chart.js-Interactive-FF6384.svg?style=flat&logo=chartdotjs&logoColor=white)](https://www.chartjs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](LICENSE)

An enterprise-grade, lightweight, and modern **Digital Khata (Ledger) & Accounting Web Application** engineered for small-to-medium businesses, retail shopkeepers, wholesalers, and freelance traders. Designed to replace traditional paper-based bahi-khata books with a secure, automated, and bilingual (English & Urdu) digital accounting platform.

---

## 🌟 Key Features

### 👥 Customer & Ledger Management (Khata)
- **Customer Profiles**: Record customer names, phone numbers, shop/home addresses, opening balances, and notes.
- **Udhaar & Wasooli Tracking**: Instant recording of credit given (*Udhaar*) and payments received (*Wasooli*).
- **Dynamic Running Balance**: Automatically calculates outstanding balances with debit/credit indicators.
- **Statement & Ledger History**: Generate customer-specific ledger statements showing chronological transactions.
- **📲 Direct WhatsApp Reminders**: One-click integration that generates pre-composed, polite payment reminder messages in both English and Urdu with direct link to WhatsApp Web/App.

### 💳 Transaction Management & Receipts
- **Multi-Method Payments**: Support for Cash, Bank Transfer, JazzCash, EasyPaisa, and Cheque payments.
- **Receipt & Voucher Uploads**: Attach scanned bills, transaction slips, and photo receipts directly to any transaction entry.
- **Full Audit Trail**: Edit or remove entries with automatic recalculation of customer balances.

### 📉 Expense & Operational Overhead Tracking
- **Category-Based Tracking**: Log daily business overheads such as Rent, Electricity, Salaries, Transport, Inventory Purchases, Tea/Food, and Internet.
- **Custom Categories**: Add, update, and customize expense categories with distinct icons.
- **Net Balance Impact**: Expenses are factored directly into daily and monthly profit/loss reports.

### 📊 Executive Dashboard & Real-Time Analytics
- **Live KPI Metrics**: Real-time snapshot of Total Receivable, Total Payable, Today's Income, Today's Expenses, Total Customers, and Transaction count.
- **Cash Flow Visualizations**: Interactive monthly bar/line charts comparing Income vs. Expenses powered by **Chart.js**.
- **Top Debtors Leaderboard**: Instant list of highest outstanding customer balances requiring follow-up.
- **Recent Activity Feed**: Real-time log of the latest transactions and payments.

### 📑 Financial Reporting & CSV Data Export
- **Flexible Timeframes**: Generate financial summaries for Daily, Weekly, Monthly, or Custom date ranges.
- **Profit & Loss Calculation**: Automatically compute Net Profit (`Total Payments Received - Total Operational Expenses`).
- **One-Click CSV Exports**: Download structured CSV files for Microsoft Excel / Google Sheets covering:
  - Full Transactions Log
  - Expenses Breakdown
  - Receivables Report
  - Payables Report
  - Customer Balances Summary

### 🌐 Bilingual (English & Urdu) with Full RTL Support
- **Instant Language Switching**: Toggle between English and Urdu (اردو) with a single click.
- **True RTL Layout**: Automatic right-to-left layout adjustments and typography utilizing Google Fonts (`Noto Sans Arabic` & `Outfit`).

### 🌓 Premium UI & Dark / Light Modes
- **Responsive Modern Design**: Built with vanilla CSS variables, glassmorphic card aesthetics, and responsive grid layouts for smartphones, tablets, and desktops.
- **Dark & Light Themes**: Seamlessly toggle between eye-friendly dark mode and clean light mode.

### 🔒 Enterprise Multi-Tenancy & Security
- **JWT Authentication**: Stateless, encrypted JSON Web Tokens (7-day validity) with bcrypt password hashing.
- **Tenant Isolation**: Strict data segregation ensuring every user only accesses their own business ledger and customer data.
- **JSON Database Backup**: One-click download of the entire business database in standardized JSON format for offline backup and disaster recovery.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| **ASGI Server** | [Uvicorn](https://www.uvicorn.org/) |
| **Database ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) |
| **Database Engine** | [SQLite](https://www.sqlite.org/) (Default, zero configuration; PostgreSQL/MySQL ready) |
| **Authentication** | OAuth2 with JWT (`PyJWT`), Password hashing via `Passlib` & `Bcrypt` |
| **Validation** | [Pydantic v2](https://docs.pydantic.dev/) |
| **Frontend UI** | Single Page Application (Vanilla JavaScript ES6+, HTML5, Vanilla CSS3) |
| **Charts & Graphs** | [Chart.js](https://www.chartjs.org/) |
| **Typography** | Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit) & [Noto Sans Arabic](https://fonts.google.com/specimen/Noto+Sans+Arabic)) |
| **Data Export** | Python standard `csv`, `io`, and `openpyxl` |
| **Testing** | `pytest`, `requests`, `FastAPI TestClient` |

---

## 📁 Project Directory Structure

```text
Khata-management-app/
├── app/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py          # Registration, login, current user & password reset
│   │   ├── customer_routes.py      # Customer CRUD, balance calculation, statements
│   │   ├── dashboard_routes.py     # Summary statistics and cash flow metrics
│   │   ├── expense_routes.py       # Expense entries and category management
│   │   ├── notification_routes.py  # User alerts & notifications
│   │   ├── report_routes.py         # Profit/Loss calculations & CSV file exports
│   │   ├── settings_routes.py      # Business preferences & JSON backup/restore
│   │   └── transaction_routes.py   # Credit/Debit transactions & receipt uploads
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css           # Complete design system (Dark/Light themes, RTL)
│   │   ├── js/
│   │   │   ├── api.js              # Fetch client with Bearer auth handling
│   │   │   ├── app.js              # SPA navigation & view switching router
│   │   │   ├── auth.js             # Login, register & session storage handlers
│   │   │   ├── customers.js        # Customer tables, modals & WhatsApp reminder
│   │   │   ├── dashboard.js        # KPI cards & Chart.js rendering
│   │   │   ├── expenses.js         # Expense logging & category management
│   │   │   ├── i18n.js             # English & Urdu bilingual dictionary
│   │   │   ├── reports.js          # Report generation & CSV downloads
│   │   │   ├── settings.js         # Business profile, theme & JSON backup
│   │   │   └── transactions.js     # Transaction ledger & receipt upload modal
│   │   └── index.html              # Main Single Page Application shell
│   ├── auth.py                     # JWT token generation, verification & password hashing
│   ├── config.py                   # Environment configuration & directories setup
│   ├── database.py                 # SQLAlchemy engine and session factory
│   ├── main.py                     # FastAPI application entrypoint & static mounts
│   ├── models.py                   # SQLAlchemy database models & relationships
│   └── schemas.py                  # Pydantic request & response schemas
├── tests/
│   └── test_khata.py               # Comprehensive pytest test suite (Auth, Ledger, CRUD)
├── uploads/                        # Uploaded receipt vouchers & company logos
├── index.txt                       # Quick reference server address
├── requirements.txt                # Python package dependencies
├── run.py                          # Single-command server starter script
├── seed_demo.py                    # Pre-populates realistic sample Pakistani business data
└── verify_app.py                   # Automated live runtime HTTP endpoint verifier
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10** or higher installed on your machine.
- `pip` (Python package manager).

### 2. Installation & Setup

1. **Clone or navigate into the project directory:**
   ```bash
   cd Khata-management-app
   ```

2. **(Optional but recommended) Create and activate a virtual environment:**
   - **Windows:**
     ```powershell
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install the required packages:**
   ```bash
   pip install -r requirements.txt
   ```

---

### 3. Seed Demo Data (Optional)
To test the application immediately with realistic business data (sample Pakistani business with customers like Tariq Auto Spares, Prime Electronics, sample transactions, expenses, and expense categories):

```bash
python seed_demo.py
```

> **Default Demo Account Credentials:**
> - **Email:** `demo@khata.pk`
> - **Password:** `password123`

---

### 4. Running the Application Server

Start the Uvicorn ASGI server using the provided `run.py` helper:

```bash
python run.py
```

Or run via Uvicorn directly:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 5. Accessing the Application

Open your browser and navigate to:
- **Web User Interface:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive API Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative API Documentation (ReDoc):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Testing & Verification

### Live Endpoint Verifier
You can verify all core API endpoints against a running server with:
```bash
python verify_app.py
```
This script automatically executes:
- User login & JWT issuance
- Dashboard KPI retrieval
- Customer list & balance extraction
- Transaction history queries
- Expense breakdowns
- Profit & loss summary reports
- Full JSON database backup generation

### Unit & Integration Test Suite
To run the automated `pytest` test suite:
```bash
pytest
```
*(Runs isolated tests with an in-memory SQLite database, verifying customer balances, opening balances, payment receipts, expense calculations, and multi-tenant isolation).*

---

## 🔌 API Reference Overview

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/register` | `POST` | Register a new business owner account |
| `/api/auth/login` | `POST` | Authenticate and obtain JWT access token |
| `/api/auth/me` | `GET` | Get current logged-in business profile |
| `/api/dashboard/summary` | `GET` | Aggregate KPIs (receivables, payables, income, expenses) |
| `/api/dashboard/charts` | `GET` | Monthly cash flow breakdown for Chart.js |
| `/api/customers` | `GET` / `POST` | List all customers with balances / create a new customer |
| `/api/customers/{id}` | `GET` / `PUT` / `DELETE` | View customer ledger statement, update details, or delete |
| `/api/transactions` | `GET` / `POST` | Query filtered transactions / create credit or debit entry |
| `/api/expenses` | `GET` / `POST` | List operational expenses / log a new expense |
| `/api/expenses/categories` | `GET` / `POST` | Retrieve or create expense categories |
| `/api/reports/summary` | `GET` | Financial summary (income, expenses, net profit/loss) |
| `/api/reports/receivables` | `GET` | List of all customers with positive outstanding balance |
| `/api/reports/payables` | `GET` | List of all suppliers/customers with payable balance |
| `/api/reports/export/csv` | `GET` | Stream structured CSV export (`transactions`, `expenses`, `receivables`, `payables`) |
| `/api/settings/backup` | `GET` | Export complete database in standardized JSON format |
| `/api/settings/profile` | `PUT` | Update business name, currency, or default language |

---

## ⚙️ Configuration & Environment Variables

The application comes preconfigured with robust defaults in `app/config.py`. You can customize settings via environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./khata.db` | SQLAlchemy connection string (e.g., PostgreSQL / MySQL) |
| `SECRET_KEY` | `khata_pakistan_secret_jwt_key_...` | Cryptographic secret for signing JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | Validity duration for user sessions |

---

## 💡 Usage Highlights

1. **Recording Customer Credit (Udhaar Given):**
   - Click **Add Transaction** or **Give Udhaar**.
   - Select the customer, enter the amount, and add an optional note or bill picture.
   - The customer's balance updates instantly on the dashboard and ledger.

2. **Sending a WhatsApp Reminder:**
   - Open any customer's statement with an outstanding balance.
   - Click the green **Send WhatsApp Reminder** button.
   - A WhatsApp chat opens with a polite message including their name, business name, and exact balance owed.

3. **Bilingual Toggle:**
   - Click the language selector in the top bar to toggle between **English** and **Urdu (اردو)**.
   - All labels, numbers, and navigation switch instantly with RTL layout support.

4. **Downloading Reports:**
   - Navigate to the **Reports** tab.
   - Filter by date (e.g. This Month, Custom).
   - Click **Export CSV** to download ready-to-use spreadsheet files.

---

## 📄 License

This project is licensed under the **MIT License**. Free for commercial and personal use.

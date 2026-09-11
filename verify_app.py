"""
Live Web App Runtime Verification Script
Calls live running endpoints on http://127.0.0.1:8000
"""

import requests

BASE_URL = "http://127.0.0.1:8000"

def verify_live_app():
    print("Connecting to live server at:", BASE_URL)

    # 1. Login with demo credentials
    login_payload = {"email": "demo@khata.pk", "password": "password123"}
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    user = res.json()["user"]
    print(f"[SUCCESS] Auth Login: Welcome {user['owner_name']} ({user['business_name']})")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Dashboard Summary
    dash_res = requests.get(f"{BASE_URL}/api/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    print(f"[SUCCESS] Dashboard Summary API: Total Receivable = PKR {dash['total_receivable']:,.2f}, Total Payable = PKR {dash['total_payable']:,.2f}")

    # 3. Get Customers
    cust_res = requests.get(f"{BASE_URL}/api/customers", headers=headers)
    assert cust_res.status_code == 200
    customers = cust_res.json()
    print(f"[SUCCESS] Customers List API: {len(customers)} customers retrieved.")

    # 4. Get Transactions
    tx_res = requests.get(f"{BASE_URL}/api/transactions", headers=headers)
    assert tx_res.status_code == 200
    txs = tx_res.json()
    print(f"[SUCCESS] Transactions List API: {len(txs)} transactions retrieved.")

    # 5. Get Expenses
    exp_res = requests.get(f"{BASE_URL}/api/expenses", headers=headers)
    assert exp_res.status_code == 200
    exps = exp_res.json()
    print(f"[SUCCESS] Expenses List API: {len(exps)} expenses retrieved.")

    # 6. Get Reports
    rep_res = requests.get(f"{BASE_URL}/api/reports/summary?report_type=monthly", headers=headers)
    assert rep_res.status_code == 200
    report = rep_res.json()
    print(f"[SUCCESS] Reports API: Income = PKR {report['total_income']:,.2f}, Net Profit = PKR {report['net_profit']:,.2f}")

    # 7. Backup JSON
    backup_res = requests.get(f"{BASE_URL}/api/settings/backup", headers=headers)
    assert backup_res.status_code == 200
    print("[SUCCESS] Database JSON Backup API: Exported backup successfully.")

    print("\nALL LIVE API ENDPOINTS VERIFIED & WORKING PERFECTLY!")

if __name__ == "__main__":
    verify_live_app()

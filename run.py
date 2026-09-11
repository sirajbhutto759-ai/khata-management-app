import uvicorn
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("==========================================================")
    print("  Khata Management & Accounting Application Server Starting")
    print("  Access Web UI at: http://127.0.0.1:8000")
    print("==========================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

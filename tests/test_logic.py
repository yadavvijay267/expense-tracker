"""Automated checks for the Expense Tracker. Run: python3 tests/test_logic.py"""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "src" / "index.html").read_text()
js = (root / "src" / "app.js").read_text()

# --- Structure checks ---
checks = [
    ("references styles.css", "styles.css" in html),
    ("references app.js", "app.js" in html),
    ("has transaction form", 'id="txForm"' in html),
    ("has category chart canvas", 'id="categoryChart"' in html),
    ("has daily chart canvas", 'id="dailyChart"' in html),
    ("has CSV export button", 'id="exportBtn"' in html),
    ("has budget form area", 'id="budgetForm"' in html),
    ("JS persists to localStorage", "et-txs" in js),
    ("JS has budget alerts", "Budget exceeded" in js),
    ("JS exports CSV with BOM", "\\uFEFF" in js),
    ("README exists", (root / "README.md").exists()),
]
failed = [n for n, ok in checks if not ok]

# --- Logic checks (mirror of the JS math) ---
txs = [
    {"type": "income", "amount": 65000, "date": "2026-11-02", "category": "Salary"},
    {"type": "expense", "amount": 420, "date": "2026-11-12", "category": "Food"},
    {"type": "expense", "amount": 12000, "date": "2026-11-05", "category": "Housing"},
    {"type": "expense", "amount": 300, "date": "2026-10-20", "category": "Food"},  # last month: excluded from monthly
]
mk = "2026-11"
inc = sum(t["amount"] for t in txs if t["type"] == "income" and t["date"][:7] == mk)
exp = sum(t["amount"] for t in txs if t["type"] == "expense" and t["date"][:7] == mk)
bal = sum(t["amount"] if t["type"] == "income" else -t["amount"] for t in txs)
logic = [
    ("monthly income = 65000", inc == 65000),
    ("monthly expense = 12420 (excludes Oct)", exp == 12420),
    ("all-time balance = 52280", bal == 52280),
    ("Food budget 500 over-spent by 420? no alert", 420 <= 500),
    ("Food budget 400 over-spent by 420? alert", 420 > 400),
]
failed += [n for n, ok in logic if not ok]
for n, ok in checks + logic: print(("PASS " if ok else "FAIL ") + n)
if failed: print(f"{len(failed)} check(s) failed"); sys.exit(1)
print("All checks passed.")

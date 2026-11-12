# Testing

## Automated
Run: `python3 tests/test_logic.py` — checks the HTML structure and re-implements the summary / budget-alert math in Python against known inputs.

## Manual checklist
- [ ] Open `src/index.html` — empty state message shows; summary is ₹0.
- [ ] Click "Load sample data" — summary, donut chart and daily bars fill in; transactions list.
- [ ] Add an expense of ₹100 in Food — balance drops by ₹100, Food slice grows.
- [ ] Edit a transaction (✏️) — form switches to "Edit transaction"; saving updates the row.
- [ ] Delete a transaction (🗑️) — row disappears after confirming.
- [ ] Set Food budget to ₹100 — a red "Budget exceeded" alert appears (sample Food spend is over ₹100).
- [ ] Filter by category Food — only Food rows show; Reset restores all.
- [ ] Export CSV — downloads `expense-tracker-export.csv`; opens in Excel with Date/Type/Category/Note/Amount columns.
- [ ] Reload the page — all transactions and budgets are still there (localStorage).

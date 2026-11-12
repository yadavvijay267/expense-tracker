# Architecture

## Flow
`index.html` -> `styles.css` -> `app.js` (all logic, no framework, no server).

## Data model
One transaction: `{id, type: "income"|"expense", amount, category, date, note}`.
- Stored in `localStorage` under `et-txs`; budgets under `et-budgets` (per-category monthly limits in ₹).
- Nothing leaves the browser. There is no account and no backend.

## Features and how they work
- Add/edit/delete: the form doubles as the editor (editingId tracks the record being edited).
- Monthly summary: income, expenses and the running all-time balance, computed from the transaction list on every render.
- Category chart: a donut drawn on `<canvas>` (max/min are not needed here — the donut shows share of monthly spending), plus a per-category list with bars and percentages.
- Daily chart: a bar chart of expenses for the last 30 days, drawn on `<canvas>`.
- Filters: category, type, date range, and free-text search over notes — all client-side.
- Budget alerts: on every render, monthly spend per category is compared with its budget; over-limit shows a red alert, 80–100% shows a green "near limit" notice.
- CSV export: the currently filtered transactions are exported with a UTF-8 BOM (`\uFEFF`) so the file opens cleanly in Excel with ₹ amounts intact.

## Tests
`tests/test_logic.py` re-implements the summary/budget math in Python and checks it against known inputs, plus HTML structure checks. Manual checklist in `tests/TESTING.md`.

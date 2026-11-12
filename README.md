# Expense Tracker

A personal finance tracker: add income and expenses, categorise them, see monthly summaries and charts, get budget alerts, and export to CSV. All data stays in your browser.

## Features
- Add, edit, and delete transactions with categories (Food, Transport, Housing, Utilities, Entertainment, Shopping, Health, Education, and income categories).
- Monthly summary (income, expenses, running all-time balance) and transaction count.
- Category breakdown donut chart with per-category bars and percentages.
- Daily spending bar chart for the last 30 days.
- Filter by date range, category, type, or free-text search over notes.
- Budget alerts: set a monthly limit per category — a red alert fires when spending passes it, and a notice appears at 80%.
- Export the filtered view to CSV (with a UTF-8 BOM so it opens cleanly in Excel).
- Persistence in localStorage; a "Load sample data" button lets you explore instantly.

## Tech stack
HTML, CSS, vanilla JavaScript, localStorage. Charts are drawn on canvas — no library is bundled, so the page works fully offline.

## How to run
Open `src/index.html` in any modern browser. No build step, no server.
Or serve it locally: `python3 -m http.server --directory src 8000` then visit `http://localhost:8000`.

## Screenshots
See `screenshots/SCREENSHOTS.md` — add `dashboard.png`, `alert.png` and `mobile.png` there after running the app.

## Tests
`python3 tests/test_logic.py` — automated HTML checks plus summary/budget math checks. Manual checklist in `tests/TESTING.md`.

## License
MIT — see `LICENSE`. Built by Clamor.

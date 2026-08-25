# TESTING STRATEGY & TEST SUITE

## 1. Test Architecture

The testing suite uses PHPUnit / Pest for Laravel backend validation:

- **Unit Tests (`tests/Unit/`)**: Mathematical formulas, `bcmath` rounding helpers, schedule generation sequence.
- **Feature Tests (`tests/Feature/`)**: API endpoints, authentication flows, form validation, error responses.
- **Financial Invariant Tests (`tests/Feature/FinancialInvariantsTest.php`)**: Dedicated suite testing all 13 financial invariants (`FI-01` through `FI-13`).

---

## 2. Test Execution Command

```bash
php artisan test
```

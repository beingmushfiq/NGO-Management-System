# DEPLOYMENT & ENVIRONMENT CONFIGURATION

## 1. Production Requirements

- PHP 8.2 or 8.3+ with extensions: `bcmath`, `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `curl`
- MySQL 8.0+ / MariaDB 10.6+ with InnoDB engine
- Node.js 18+ & npm for frontend bundling
- Nginx / Apache with URL rewriting enabled

---

## 2. Local Development Startup

### Backend
```bash
cd ngo-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd ngo-frontend
npm install
npm run dev
```

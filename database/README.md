# NewsKrez Database Setup & Migration Guide

This directory contains database exports for **NewsKrez – Global News & Regulatory Intelligence Portal**.

## Files Included

- `newskrez_full_dump.sql` – Complete production-ready database dump including all tables, categories, sources, initial intelligence articles, news provider configurations, and settings.
- `newskrez_schema.sql` – Clean table structure and relations without article records.

## How to Import into Hostinger Business Web Hosting

### Option A: Using phpMyAdmin (Recommended for Hostinger)
1. Log into your **Hostinger hPanel**.
2. Go to **Databases** > **MySQL Databases**.
3. Create a new database (e.g., `u123456789_newskrez`) and a database user with full privileges.
4. Open **phpMyAdmin** for that database.
5. Click the **Import** tab.
6. Choose `database/newskrez_full_dump.sql` from your computer and click **Import**.
7. In your `.env` or Hostinger environment configuration, set your database credentials:
   ```dotenv
   DATABASE_URL="mysql://u123456789_news:YourPassword@localhost:3306/u123456789_newskrez"
   DB_HOST="localhost"
   DB_USER="u123456789_news"
   DB_PASSWORD="YourPassword"
   DB_NAME="u123456789_newskrez"
   ```

### Option B: Using SSH / Terminal
If you have SSH access enabled on your Hostinger account:
```bash
mysql -u u123456789_news -p u123456789_newskrez < database/newskrez_full_dump.sql
```

## Default Admin Credentials
- **Email:** `admin@newskrez.com`
- **Password:** `Admin@NewsKrez2026!`
*(Please change this password immediately after your initial production deployment)*

# NewsKrez – Hostinger Business Web Hosting Deployment Guide

This guide provides complete, step-by-step instructions to deploy **NewsKrez (Global News & Regulatory Intelligence Portal)** to **Hostinger Business Web Hosting** using Node.js without requiring a VPS, Docker, or Redis.

---

## 1. Prerequisites on Hostinger

1. **Hostinger Business Web Hosting** account (or Cloud Hosting) with **Node.js** support enabled in hPanel.
2. **Domain Name** pointed to Hostinger (with Free Let's Encrypt SSL active).
3. **MySQL Database** created in Hostinger hPanel.

---

## 2. Hostinger MySQL Database Setup

1. Log in to **Hostinger hPanel**.
2. Navigate to **Databases** → **Management**.
3. Create a new MySQL Database:
   - **Database Name:** `u123456789_newskrez`
   - **Username:** `u123456789_news`
   - **Password:** Generate a strong password (e.g. `KrezSecureDb2026!#`)
4. Note your database credentials. Hostinger MySQL runs on `localhost:3306`.
5. Open **phpMyAdmin** for your database, or use the Drizzle migration script to initialize the 22 production tables.

---

## 3. Node.js Environment Configuration in hPanel

1. In hPanel, navigate to **Advanced** → **Node.js**.
2. Click **Create Application**:
   - **Node.js Version:** Select **Node.js 20.x** (or Node.js 18.x LTS).
   - **Application Mode:** `Production`.
   - **Application Root:** `public_html` (or a subdirectory like `public_html/news`).
   - **Application Startup File:** `.next/standalone/server.js` (or `server.js`).
3. Click **Create**.

---

## 4. Environment Variables Configuration

In the hPanel Node.js application management page, add the following Environment Variables (or upload the `.env` file into the application root):

```ini
# Environment
NODE_ENV="production"
PORT=3000

# Next.js Application URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="NewsKrez"
NEXT_PUBLIC_SITE_TAGLINE="Global News. Healthcare. Technology. Regulatory Intelligence."

# Hostinger MySQL Database
DATABASE_URL="mysql://u123456789_news:KrezSecureDb2026!#@localhost:3306/u123456789_newskrez"
DB_HOST="localhost"
DB_PORT=3306
DB_USER="u123456789_news"
DB_PASSWORD="KrezSecureDb2026!#"
DB_NAME="u123456789_newskrez"

# Security & Sessions
AUTH_SECRET="your-64-character-random-hex-encryption-key-for-session-tokens"
NEXTAUTH_SECRET="your-64-character-random-hex-encryption-key-for-session-tokens"
NEXTAUTH_URL="https://yourdomain.com"

# Cron Security Secret (used to trigger automated ingestion)
CRON_SECRET="your-custom-cron-authorization-secret-token"

# Optional: openFDA API Key (leaves default public rate-limit if omitted)
OPENFDA_API_KEY=""

# Initial Admin Credentials
ADMIN_DEFAULT_EMAIL="admin@yourdomain.com"
ADMIN_DEFAULT_PASSWORD="YourStrongAdminPassword2026!"
```

---

## 5. Building & Uploading the Project

Next.js is configured with `output: "standalone"`, which produces an ultra-optimized bundle containing only the production files and minimal node dependencies.

### Option A: Via Git / GitHub Actions (Recommended)
1. Push your repository to GitHub.
2. In Hostinger hPanel, configure **Git Deployment** under **Advanced** → **Git**.
3. In SSH or the hPanel terminal, execute:
   ```bash
   npm install
   npx drizzle-kit push
   npx tsx src/db/seed.ts
   npm run build
   cp -r public .next/standalone/
   cp -r .next/static .next/standalone/.next/
   ```

### Option B: Local Build and File Manager Upload
1. On your local machine, run:
   ```bash
   npm run build
   ```
2. Copy the `public` folder and `.next/static` folder into `.next/standalone/`:
   ```bash
   cp -r public .next/standalone/
   cp -r .next/static .next/standalone/.next/
   ```
3. Archive the `.next/standalone` folder along with `.env` and `package.json`.
4. Upload via hPanel **File Manager** into `public_html/`.

---

## 6. Hostinger Scheduled API Fetching (Cron Job)

NewsKrez does not require persistent background workers or Redis. Automated ingestion is triggered via the protected `/api/cron/fetch` endpoint.

In Hostinger hPanel:
1. Go to **Advanced** → **Cron Jobs**.
2. Select **Custom** execution interval:
   - **Minute:** `0`
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   *(This executes once every 60 minutes)*
3. Set the **Command** to execute:
   ```bash
   curl -s -X POST -H "Authorization: Bearer your-custom-cron-authorization-secret-token" https://yourdomain.com/api/cron/fetch > /dev/null 2>&1
   ```
4. Click **Save**.

---

## 7. Production Testing & Verification Checklist

- [x] **Home Page:** Verify branding, live breaking news ticker, hero slider, and footer.
- [x] **Medical Devices Hub (`/medical-devices`):** Test 510(k), PMA, and recall search.
- [x] **Regulatory Recalls (`/alerts`):** Verify FDA Class I & II alert filters.
- [x] **CMS Portal (`/admin`):** Log in with default admin credentials (`admin@newskrez.com`).
- [x] **Manual Ingestion:** Click "Run All Feeds Now" in `/admin/sources` to test live openFDA and RSS ingestion.
- [x] **RSS Feed (`/api/rss`):** Validate RSS 2.0 XML output in browser.
- [x] **Sitemap (`/sitemap.xml`):** Validate XML sitemap for Google Search Console.
- [x] **Newsletter (`/newsletter`):** Test email subscription and verification.

---

## 8. Backup and Recovery

1. **Database Backup:**
   - In hPanel, navigate to **Databases** → Click **phpMyAdmin** → Select `u123456789_newskrez` → **Export** → **Quick** (SQL).
   - Alternatively via SSH:
     ```bash
     mysqldump -u u123456789_news -p u123456789_newskrez > backup_$(date +%Y%m%d).sql
     ```
2. **Database Recovery:**
   ```bash
   mysql -u u123456789_news -p u123456789_newskrez < backup_20261118.sql
   ```

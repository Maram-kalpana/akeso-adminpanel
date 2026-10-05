# Hospital CMS Admin Panel

Full-stack admin panel for managing hospital website content (doctors, specialities, services, locations, health library, stories, blogs, testimonials).

## Stack
- Frontend: React 18 (JavaScript) + Vite + React Router v6
- Backend: Node.js + Express (CommonJS)
- Database: MySQL via `mysql2/promise` and raw SQL
- Auth: JWT + bcrypt
- Uploads: local disk (`/uploads`), configured so S3 can be swapped in later

## 1. Create the database
Install MySQL if needed, then run:

```sql
CREATE DATABASE hospital_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

From a MySQL client (or `mysql` CLI):

```bash
mysql -u root -p hospital_cms < backend/schema.sql
```

On Windows PowerShell:

```powershell
Get-Content backend/schema.sql | mysql -u root -p hospital_cms
```

`schema.sql` already includes `CREATE DATABASE` / `USE hospital_cms`, so you can also run the file as-is.

## 2. Configure backend env
Copy `backend/.env.example` to `backend/.env` and set:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hospital_cms
JWT_SECRET=a-long-random-secret
PORT=5000
ADMIN_EMAIL=admin@hospital.local
ADMIN_PASSWORD=Admin@123
```

## 3. Install, seed, and run the API

```bash
cd backend
npm install
npm run seed
npm run dev
```

Seed creates:
- Superadmin `admin@hospital.local` / `Admin@123` (or values from `.env`)
- Sample hospitals (Gurugram, Lucknow, Patna, Indore, Ranchi, Noida)
- Sample specialities for doctor dropdowns

API: `http://localhost:5000`

Quick login test:

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@hospital.local\",\"password\":\"Admin@123\"}"
```

## 4. Run the admin UI

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`  
Vite proxies `/api` and `/uploads` to the backend.

## Modules
| UI path | API |
|---|---|
| `/dashboard` | `GET /api/dashboard/stats` |
| `/doctors` | `/api/doctors` |
| `/specialities` | `/api/specialities` |
| `/services` | `/api/services` |
| `/hospitals` | `/api/hospitals` |
| `/health-library` | `/api/health-library` |
| `/our-stories` | `/api/our-stories` |
| `/blogs` | `/api/blogs` |
| `/testimonials` | `/api/testimonials` |

All `/api/*` routes except `POST /api/auth/login` require `Authorization: Bearer <token>`.

Uploads are stored under `backend/uploads/...` and served at `http://localhost:5000/uploads/...`. Set `UPLOAD_STORAGE=s3` later and replace `backend/config/multer.js` with an S3 storage engine without changing controllers.

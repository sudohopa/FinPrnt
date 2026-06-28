# FinPrnt — HR Management System

Full-stack HR management platform with a **Next.js** frontend and **Node.js/Express** backend backed by **Prisma**.

## Structure

- `frontend/` — Next.js app (dashboard, login, employee views)
- `backend/` — Express API (auth, attendance, payroll, leave, training, analytics)

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # configure DATABASE_URL, JWT_SECRET, etc.
npm install
npm run setup
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Tech stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Express, Prisma, JWT auth

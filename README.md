# Finprnt — HR Management System
<img width="800" height="723" alt="image" src="https://github.com/user-attachments/assets/7eba5007-6b76-4d37-ab88-c231fcaee29b" />

Finprnt is a full-stack HR Management System designed for small and medium-sized enterprises (SMEs). It streamlines HR operations through employee, payroll, leave, and performance management while incorporating AI-powered analytics to provide actionable insights and support strategic decision-making.

## Structure

- `frontend/` — Next.js app (dashboard, login, employee views)
- `backend/` — Express API (auth, attendance, payroll, leave, training, analytics)

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, SEED_DEV_PASSWORD
npm install
npm run setup
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Tech stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Express, Prisma, JWT auth

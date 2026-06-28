# HR System — Backend

REST API server for the HR Management System built with **Express 5**, **Prisma ORM**, and **PostgreSQL**.

## Tech Stack

| Layer        | Technology            |
| ------------ | --------------------- |
| Runtime      | Node.js 18+           |
| Framework    | Express 5             |
| ORM          | Prisma 6              |
| Database     | PostgreSQL            |
| Auth         | JWT (jsonwebtoken)    |
| Validation   | Zod 4                 |
| Security     | Helmet, CORS          |

## Project Structure

```
backend/
├── prisma/            # Schema, migrations & seed
├── src/
│   ├── config/        # Environment & app config
│   ├── controllers/   # Route handlers
│   ├── middlewares/    # Auth, error handling, etc.
│   ├── routes/        # Express route definitions
│   ├── services/      # Business logic
│   ├── utils/         # Shared helpers
│   ├── validators/    # Zod request schemas
│   ├── app.js         # Express app setup
│   └── server.js      # Server entry point
└── package.json
```

## API Modules

| Route               | Description                |
| -------------------- | -------------------------- |
| `/api/auth`          | Login, register, JWT auth  |
| `/api/employees`     | Employee CRUD              |
| `/api/departments`   | Department management      |
| `/api/attendance`    | Clock in/out, records      |
| `/api/leave`         | Leave requests & approvals |
| `/api/payroll`       | Salary & payroll runs      |
| `/api/performance`   | Reviews & evaluations      |
| `/api/training`      | Programs & enrollments     |
| `/api/analytics`     | Dashboard statistics       |
| `/api/notifications` | User notifications         |

## Quickstart

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/hr_system?schema=public"
PORT=5000
JWT_SECRET="your-secret-key"
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push        # or: npx prisma migrate dev
npx prisma db seed        # seed demo data
```

### 4. Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

The server starts on `http://localhost:5000`. Health check: `GET /health`.

## Available Scripts

| Script              | Command                  |
| ------------------- | ------------------------ |
| `npm run dev`       | Start with hot-reload    |
| `npm start`         | Start in production mode |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate`  | Run migrations       |
| `npm run prisma:studio`   | Open Prisma Studio   |
| `npm run prisma:seed`     | Seed the database    |

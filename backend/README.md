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
├── prisma/            # Schema & seed
├── src/
│   ├── controllers/   # Route handlers
│   ├── middlewares/     # Auth, error handling
│   ├── routes/          # Express route definitions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env.example
└── package.json
```

## API Modules

| Route               | Description                |
| -------------------- | -------------------------- |
| `/auth`              | Login, register, JWT auth  |
| `/employees`         | Employee CRUD              |
| `/departments`       | Department management      |
| `/attendance`        | Clock in/out, records      |
| `/leave`             | Leave requests & approvals |
| `/payroll`           | Salary & payroll runs      |
| `/training`          | Programs & enrollments     |
| `/selfassessment`    | Self-assessment submissions |
| `/analytics`         | Dashboard statistics       |
| `/health`            | Health check               |

## Quickstart

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL, JWT secret, and a local-only `SEED_DEV_PASSWORD` for `npm run prisma:seed`.

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

The server starts on `http://localhost:5000`. Health check: `GET /health`.

## Available Scripts

| Script                    | Command                  |
| ------------------------- | ------------------------ |
| `npm run dev`             | Start with hot-reload    |
| `npm start`               | Start in production mode |
| `npm run prisma:generate` | Generate Prisma client   |
| `npm run prisma:push`     | Push schema to database  |
| `npm run prisma:studio`   | Open Prisma Studio       |
| `npm run prisma:seed`     | Seed the database        |

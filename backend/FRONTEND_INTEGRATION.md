# Frontend Integration Guide

This guide explains how to connect a frontend app (React, Next.js, Vue, etc.) to the HR System API.

## Base URL

- Local API base URL: `http://localhost:5000`

Example:

```ts
const API_BASE_URL = "http://localhost:5000";
```

## Authentication

Most endpoints are protected and require a JWT bearer token.

- Public endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /health`
- Protected endpoints:
  - Everything else under `/employees`, `/departments`, `/attendance`, `/leave`, `/payroll`, `/training`, `/analytics`

### Login flow

1. Call `POST /auth/login` with username/password.
2. Save `token` from response.
3. Send `Authorization: Bearer <token>` header on protected requests.

Example login request:

```json
{
  "username": "your-username",
  "password": "your-password"
}
```

Example login response:

```json
{
  "token": "<jwt-token>"
}
```

## Roles and Access

Roles used by the backend:

- `EMPLOYEE`
- `MANAGER`
- `HR`
- `ADMIN`

Authorization behavior:

- Missing/invalid token -> `401`
- Valid token but wrong role -> `403`

## Request/Response Conventions

- Content type: `application/json`
- Validation errors (Zod) return error JSON from backend error handler
- Generic error shape:

```json
{
  "message": "Error message",
  "stack": "..." 
}
```

`stack` is returned in non-production mode.

## Core Endpoints

### Health

- `GET /health`

Response:

```json
{
  "status": "ok"
}
```

### Auth

- `POST /auth/register`
  - Body:
    - `fullName` (string)
    - `email` (email string)
    - `gender` (`MALE | FEMALE | OTHER`)
    - `username` (string)
    - `password` (string, min 6)
    - `jobTitle` (string)
    - `role` (optional: `EMPLOYEE | MANAGER | HR | ADMIN`)
    - `departmentId` (optional number)
- `POST /auth/login`
  - Body:
    - `username` (string)
    - `password` (string)

### Employees (protected)

- `POST /employees` (`ADMIN`, `HR`)
- `PUT /employees/:id` (`ADMIN`, `HR`)
- `DELETE /employees/:id` (`ADMIN`)
- `GET /employees` (any authenticated user)
- `GET /employees/:id` (any authenticated user)

### Departments (protected)

- `POST /departments` (`ADMIN`, `HR`) body: `{ "name": "Engineering" }`
- `GET /departments`
- `PATCH /departments/:departmentId/assign/:employeeId` (`ADMIN`, `HR`)

### Attendance (protected)

- `POST /attendance/check-in`
- `POST /attendance/check-out`
- `GET /attendance/employee/:employeeId`
- `GET /attendance` (`HR`)

### leave (protected)

- `POST /leave` (`EMPLOYEE`, `MANAGER`, `HR`, `ADMIN`)
  - Body:
    - `leaveType` (string)
    - `startDate` (ISO datetime string)
    - `endDate` (ISO datetime string)
- `PATCH /leave/:id/review` (`MANAGER`) body: `{ "status": "APPROVED" | "REJECTED" }`
- `GET /leave/employee/:employeeId`
- `GET /leave` (`HR`)

### Payroll (protected)

- `POST /payroll` (`HR`, `ADMIN`)
  - Body:
    - `employeeId` (number)
    - `baseSalary` (number)
    - `payPeriod` (string)
- `PUT /payroll/:id` (`HR`, `ADMIN`)
- `GET /payroll/employee/:employeeId`

### Training (protected)

- `POST /training` (`HR`, `ADMIN`)
  - Body:
    - `courseName` (string)
    - `courseCode` (string)
    - `startDate` (ISO datetime string)
    - `endDate` (ISO datetime string)
    - `departmentId` (number)
- `POST /training/assign` (`HR`, `ADMIN`) body: `{ "employeeId": 1, "trainingId": 2 }`
- `GET /training/employee/:employeeId`
- `GET /training/department/:departmentId`

### Analytics (protected)

- `GET /analytics` (`HR`, `ADMIN`, `MANAGER`)

## Frontend Fetch Helper Example

```ts
type RequestOptions = RequestInit & { token?: string };

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const { token, headers, ...rest } = options;

  const response = await fetch(`http://localhost:5000${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(typeof data === "object" && data?.message ? data.message : "Request failed");
  }

  return data;
}
```

## Suggested Frontend App Flow

1. Build login/register screens.
2. Store token (memory or localStorage).
3. Create auth-aware fetch client.
4. Load dashboard data from `/analytics`.
5. Implement modules for employees, attendance, leave, payroll, and training.


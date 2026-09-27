# Hospital Management System

Full-stack hospital management system using React, Node.js/Express, MySQL and Sequelize.

## Features
- JWT authentication with Admin, Doctor and Patient roles
- Doctor/patient profiles
- Appointment booking, rescheduling and cancellation
- Doctor appointment status management
- QR-code medical reports
- Video consultation links generated per appointment
- Role-protected API routes

## Run locally

### 1. Database
Create a MySQL database:
```sql
CREATE DATABASE hospital_management;
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the Vite URL shown in the terminal.

## Default development settings
Set `JWT_SECRET` and MySQL credentials in `backend/.env`.

> For production, use HTTPS, a real video provider/WebRTC infrastructure, object storage for reports, validation/rate limiting, audit logging, and secure QR tokens. This starter keeps medical-report storage simple so the application is easy to extend.

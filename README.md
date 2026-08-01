# HireFlow AI — AI-Powered Recruitment Platform

> A full-stack recruitment management system where AI automatically scores CVs, generates interview questions, and ranks candidates — built with ASP.NET Core, React, PostgreSQL, and Groq AI.

🌐 **Live Demo:** https://hireflow-28ocr2t5q-tony-nasrs-projects.vercel.app  
🔗 **API:** https://hireflow-ai-backend-d42g.onrender.com

---

## What It Does

HireFlow AI solves the #1 problem in recruitment: manually reviewing hundreds of CVs. When a candidate applies, the AI instantly reads their CV, compares it to the job requirements, and returns a score from 0–100 with written feedback. HR sees candidates ranked by AI score on a Kanban board and can move them through the hiring pipeline with one click.

---

## Features

### For Candidates
- Browse open job positions
- Upload CV (PDF/text) and apply with one click
- View AI score and feedback on your application
- Track application status in real time

### For HR
- Post and manage job listings
- View all candidates ranked by AI score
- Kanban pipeline: Applied → Reviewed → Interview → Hired / Rejected
- Generate AI interview questions tailored to each candidate
- Dashboard showing all job postings

### For Admins
- Overview dashboard: total users, companies, jobs, applications
- Manage all users (view, delete)
- View all companies and job postings
- Toggle jobs active/inactive

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | ASP.NET Core 8, Entity Framework Core |
| Database | PostgreSQL (Npgsql) |
| AI | Groq API (llama-3.1-8b-instant) |
| Auth | JWT Bearer tokens with refresh token rotation |
| File Storage | Cloudinary (CV uploads) |
| Deployment | Vercel (frontend) + Render (backend + DB) |
| Containerization | Docker + Docker Compose |

---

## Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────────┐
│   React Frontend│ ─────────────► │  ASP.NET Core API    │
│   (Vercel)      │                │  (Render)            │
└─────────────────┘                └──────────┬───────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                    ┌─────────▼──┐  ┌────────▼───┐  ┌───────▼──────┐
                    │ PostgreSQL │  │  Groq AI   │  │  Cloudinary  │
                    │ (Render)   │  │  (CV Score)│  │  (CV Files)  │
                    └────────────┘  └────────────┘  └──────────────┘
```

---

## How the AI Works

1. Candidate uploads a CV file
2. Backend extracts text from the CV
3. Groq (llama-3.1-8b-instant) receives: CV text + job title + description + requirements
4. Returns a JSON score (0–100) and 2–3 sentence feedback
5. Score is saved to the database and shown to HR on the Kanban board

---

## Running Locally with Docker

```bash
git clone https://github.com/Tony-Nasr/hireflow-ai.git
cd hireflow-ai
```

Create a `.env` file in the root:

```env
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_KEY=your_jwt_secret_at_least_32_chars
```

Then run:

```bash
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5433

---

## Running Without Docker

### Backend
```bash
cd backend/HireFlowAI.Api
dotnet user-secrets set "Groq:ApiKey" "your_key"
dotnet user-secrets set "Jwt:Key" "your_secret"
dotnet run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Auth/register` | Register (role: 0=Admin, 1=HR, 2=Candidate) |
| POST | `/api/Auth/login` | Login, returns JWT |
| POST | `/api/Auth/refresh` | Refresh access token |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/Job` | Public | List all active jobs |
| POST | `/api/Job` | HR | Create a job |
| GET | `/api/Job/my-jobs` | HR | My company's jobs |
| PUT | `/api/Job/{id}` | HR | Update a job |
| DELETE | `/api/Job/{id}` | HR | Delete a job |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/Application/apply/{jobId}` | Candidate | Apply with CV upload |
| GET | `/api/Application/my-applications` | Candidate | My applications |
| GET | `/api/Application/job/{jobId}` | HR | All applications for a job |
| PATCH | `/api/Application/{id}/stage` | HR | Move candidate stage |
| POST | `/api/Application/{id}/generate-questions` | HR | AI interview questions |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/Admin/stats` | Admin | Platform statistics |
| GET | `/api/Admin/users` | Admin | All users |
| GET | `/api/Admin/companies` | Admin | All companies |
| GET | `/api/Admin/jobs` | Admin | All jobs |
| DELETE | `/api/Admin/users/{id}` | Admin | Delete a user |

---

## Database Schema

```
Users (ASP.NET Identity)
  └── Companies (one HR user → one company)
        └── Jobs
              └── Applications
                    ├── AiScore (int)
                    ├── AiFeedback (string)
                    ├── Stage (enum: Applied/Reviewed/Interview/Hired/Rejected)
                    └── InterviewQuestions
```

---

## Test Accounts (Production)

| Role | Email | Password |
|------|-------|----------|
| HR | tony.nasr@isae.edu.lb | (your password) |
| Candidate | (register at /register) | — |
| Admin | admin@hireflow.com | Test1234 |

---

## Project Structure

```
hireflow-ai/
├── backend/
│   └── HireFlowAI.Api/
│       ├── Controllers/        # Auth, Job, Application, Admin
│       ├── Models/             # EF Core entities
│       ├── DTOs/               # Request/response objects
│       ├── Services/           # GroqService, FileStorageService
│       ├── Data/               # AppDbContext
│       └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── auth/           # Login, Register
│       │   ├── candidate/      # Dashboard, JobListings
│       │   ├── hr/             # MyJobs, HRDashboard
│       │   └── admin/          # AdminDashboard
│       ├── components/         # ProtectedRoute, UI components
│       ├── api/                # Axios client
│       └── store/              # Zustand auth store
├── docker-compose.yml
└── README.md
```

---

## Why This Project

This project demonstrates the full professional stack companies look for:

✅ **Frontend** — React + TypeScript + Tailwind  
✅ **Backend** — ASP.NET Core REST API  
✅ **Authentication** — JWT with role-based access control  
✅ **AI Integration** — Real Groq API calls, not mock data  
✅ **Database** — PostgreSQL with EF Core migrations  
✅ **File Upload** — Cloudinary CV storage  
✅ **Security** — Auth guards, ownership checks, no exposed secrets  
✅ **Cloud Deployment** — Live on Vercel + Render  
✅ **Docker** — Full containerization with docker-compose  
✅ **Clean Architecture** — Separated concerns, DTOs, service layer  

---

## Author

**Tony Nasr**  
[LinkedIn](https://linkedin.com/in/tony-nasr) · [GitHub](https://github.com/Tony-Nasr)
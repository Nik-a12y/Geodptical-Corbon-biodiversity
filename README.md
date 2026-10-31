# Darukaa.Earth - Full Stack Starter

A runnable starter implementation for the Darukaa.Earth hackathon:
- React frontend
- FastAPI backend
- PostgreSQL/PostGIS-ready database
- JWT-style login flow
- Projects and sites
- Mapbox-ready map page
- Analytics charts
- Docker Compose option for PostgreSQL/PostGIS

## 1. Requirements
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+ with PostGIS OR Docker Desktop
- VS Code

## 2. Easiest database setup
Install Docker Desktop, open a terminal in this folder and run:

docker compose up -d db

This creates PostgreSQL + PostGIS automatically.

Database details:
Host: localhost
Port: 5432
Database: darukaa
User: postgres
Password: postgres

## 3. Backend
Open terminal:
cd backend
python -m venv venv
Windows: venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload

Backend: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

## 4. Frontend
Open another terminal:
cd frontend
npm install
copy .env.example .env
npm run dev

Frontend: http://localhost:5173

## 5. Mapbox
The app works without a Mapbox token using a simple map placeholder.
For the real interactive Mapbox map, create a public token and put it in:
frontend/.env
VITE_MAPBOX_TOKEN=your_token

## 6. Demo login
Register a new account from the UI. The backend stores users in PostgreSQL.

## 7. Main flow
Register -> Login -> Dashboard -> Create Project -> Add Site -> Analytics.

## 8. PostgreSQL without Docker
You can install PostgreSQL and PostGIS manually. Then create a database named `darukaa` and enable PostGIS:
CREATE DATABASE darukaa;
\c darukaa
CREATE EXTENSION IF NOT EXISTS postgis;
Then update backend/.env if your password/host differs.

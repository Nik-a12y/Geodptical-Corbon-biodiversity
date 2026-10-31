import os
import json
import socket
from urllib.parse import urlparse
from datetime import datetime, timedelta
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, ForeignKey, DateTime, func, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from geoalchemy2 import Geometry
from geoalchemy2.shape import from_shape
from shapely.geometry import shape

load_dotenv()
# A fresh clone should run even when PostgreSQL/Docker is not installed.  Set
# DATABASE_URL to a PostgreSQL URL when a PostGIS database is available.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./darukaa.db")
if DATABASE_URL.startswith("postgresql"):
    parsed_database_url = urlparse(DATABASE_URL)
    try:
        with socket.create_connection((parsed_database_url.hostname or "localhost", parsed_database_url.port or 5432), timeout=1):
            pass
    except OSError:
        # The starter's default .env points at localhost Postgres. Fall back
        # automatically when that optional service is not running.
        DATABASE_URL = "sqlite:///./darukaa.db"
USING_POSTGRES = DATABASE_URL.startswith("postgresql")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"

engine_options = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete")

class Site(Base):
    __tablename__ = "sites"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    latitude = Column(Float, default=0)
    longitude = Column(Float, default=0)
    area_hectares = Column(Float, default=0)
    # SQLite stores GeoJSON text for a zero-setup demo. PostgreSQL keeps the
    # original PostGIS polygon column when configured through DATABASE_URL.
    geometry = Column(Geometry("POLYGON", srid=4326) if USING_POSTGRES else Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="sites")

if USING_POSTGRES:
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
Base.metadata.create_all(bind=engine)
# create_all does not add new columns to an already-running student database.
if USING_POSTGRES:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE sites ADD COLUMN IF NOT EXISTS geometry geometry(POLYGON, 4326)"))

app = FastAPI(title="Darukaa.Earth API", version="1.0")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#deplyee k bad ka c ode
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProjectIn(BaseModel):
    name: str
    description: str = ""

class SiteIn(BaseModel):
    name: str
    latitude: float
    longitude: float
    area_hectares: float = 0
    geometry: dict[str, Any]

def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def make_token(user_id: int):
    return jwt.encode(
        {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(hours=8)},
        SECRET_KEY, algorithm=ALGORITHM
    )

def current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(401, "Invalid or expired token")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(401, "User not found")
    return user

@app.get("/")
def root():
    return {"message": "Darukaa.Earth API is running"}

@app.post("/auth/register")
def register(data: RegisterIn, session: Session = Depends(db)):
    if session.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, password=pwd.hash(data.password))
    session.add(user); session.commit(); session.refresh(user)
    return {"message": "Registration successful", "user_id": user.id}

@app.post("/auth/login")
def login(data: LoginIn, session: Session = Depends(db)):
    user = session.query(User).filter(User.email == data.email).first()
    if not user or not pwd.verify(data.password, user.password):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": make_token(user.id), "token_type": "bearer", "name": user.name}

@app.get("/projects")
def projects(user: User = Depends(current_user), session: Session = Depends(db)):
    rows = session.query(Project).filter(Project.owner_id == user.id).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "sites": len(p.sites)} for p in rows]

@app.post("/projects")
def create_project(data: ProjectIn, user: User = Depends(current_user), session: Session = Depends(db)):
    p = Project(name=data.name, description=data.description, owner_id=user.id)
    session.add(p); session.commit(); session.refresh(p)
    return {"id": p.id, "name": p.name, "description": p.description, "sites": 0}

@app.get("/projects/{project_id}")
def project_detail(project_id: int, user: User = Depends(current_user), session: Session = Depends(db)):
    p = session.get(Project, project_id)
    if not p or p.owner_id != user.id:
        raise HTTPException(404, "Project not found")
    if USING_POSTGRES:
        geometry_by_site = dict(session.query(Site.id, func.ST_AsGeoJSON(Site.geometry)).filter(Site.project_id == p.id).all())
    else:
        geometry_by_site = {site.id: site.geometry for site in p.sites}
    return {"id": p.id, "name": p.name, "description": p.description,
            "sites": [{"id": s.id, "name": s.name, "latitude": s.latitude,
                       "longitude": s.longitude, "area_hectares": s.area_hectares,
                       "geometry": geometry_by_site.get(s.id)} for s in p.sites]}

@app.post("/projects/{project_id}/sites")
def create_site(project_id: int, data: SiteIn, user: User = Depends(current_user), session: Session = Depends(db)):
    p = session.get(Project, project_id)
    if not p or p.owner_id != user.id:
        raise HTTPException(404, "Project not found")
    try:
        polygon = shape(data.geometry)
    except (TypeError, ValueError):
        raise HTTPException(422, "geometry must be a valid GeoJSON Polygon")
    if polygon.geom_type != "Polygon" or not polygon.is_valid:
        raise HTTPException(422, "geometry must be a valid GeoJSON Polygon")
    values = data.model_dump(exclude={"geometry"})
    geometry_value = from_shape(polygon, srid=4326) if USING_POSTGRES else json.dumps(data.geometry)
    s = Site(project_id=project_id, geometry=geometry_value, **values)
    session.add(s); session.commit(); session.refresh(s)
    return {"id": s.id, "name": s.name}

@app.get("/sites/{site_id}/analytics")
def analytics(site_id: int, user: User = Depends(current_user), session: Session = Depends(db)):
    s = session.get(Site, site_id)
    if not s or s.project.owner_id != user.id:
        raise HTTPException(404, "Site not found")
    # Demo/mock analytics data, permitted by the challenge.
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return {
        "site": {"id": s.id, "name": s.name, "area_hectares": s.area_hectares},
        "months": months,
        "carbon": [42, 50, 57, 65, 73, 81],
        "biodiversity": [55, 59, 63, 68, 72, 78],
        "performance": 78,
        "performance_over_time": [56, 61, 65, 69, 74, 78]
    }


    

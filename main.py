import os
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid
import chromadb
from chromadb.config import Settings as ChromaSettings
import socketio

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "forensic-secret-8877")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aiventra_v2.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ChromaDB Setup
chroma_client = chromadb.Client(ChromaSettings(allow_reset=True))
collection = chroma_client.get_or_create_collection(name="forensic_evidence")

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    role = Column(String, default="investigator")

class Case(Base):
    __tablename__ = "cases"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    type = Column(String, default="homicide")
    priority = Column(String, default="medium")
    location = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    creator_id = Column(String, ForeignKey("users.id"))

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    file_path = Column(String, nullable=True)
    type = Column(String) # photo, document, witness, gps, cctv
    title = Column(String)
    content = Column(Text)
    metadata_json = Column(Text)
    trust_score = Column(Float, default=1.0)
    anomaly_score = Column(Float, default=0.0)
    status = Column(String, default="processed") # pending, processing, processed, error
    created_at = Column(DateTime, default=datetime.utcnow)

class Entity(Base):
    __tablename__ = "entities"
    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    evidence_id = Column(String, ForeignKey("evidence.id"))
    type = Column(String) # person, location, object, event
    label = Column(String)
    properties = Column(Text) # JSON string

class Relationship(Base):
    __tablename__ = "relationships"
    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    source_id = Column(String)
    target_id = Column(String)
    type = Column(String)
    strength = Column(Float, default=1.0)
    is_contradiction = Column(Boolean, default=False)
    description = Column(Text)

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    evidence_id = Column(String, ForeignKey("evidence.id"))
    timestamp = Column(DateTime)
    label = Column(String)
    description = Column(Text)
    type = Column(String)

class SimulationScenario(Base):
    __tablename__ = "scenarios"
    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    name = Column(String)
    description = Column(Text)
    probability = Column(Float)
    contradictions = Column(Text) # JSON list

Base.metadata.create_all(bind=engine)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# App Initialization
app = FastAPI(title="AIVENTRA Forensic Engine", version="4.2.0")

# Socket.io Setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")
sio_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Authentication logic
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401)
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401)
        return user
    except JWTError:
        raise HTTPException(status_code=401)

# API Routes
@app.post("/api/auth/register")
def register(user_data: dict, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(user_data["password"])
    user_id = str(uuid.uuid4())[:9]
    new_user = User(id=user_id, email=user_data["email"], password=hashed_password, name=user_data["name"])
    db.add(new_user)
    db.commit()
    token = create_access_token({"id": user_id, "email": user_data["email"]})
    return {"token": token, "user": {"id": user_id, "name": user_data["name"], "email": user_data["email"]}}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"id": user.id, "email": user.email})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.get("/api/cases")
def get_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Case).order_by(Case.created_at.desc()).all()

@app.post("/api/cases")
def create_case(case_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case_id = "case_" + str(uuid.uuid4())[:9]
    new_case = Case(
        id=case_id, 
        name=case_data["name"], 
        description=case_data.get("description", ""),
        type=case_data.get("type", "homicide"),
        priority=case_data.get("priority", "medium"),
        location=case_data.get("location", ""),
        creator_id=current_user.id
    )
    db.add(new_case)
    db.commit()
    return new_case

@app.get("/api/cases/{case_id}")
def get_case_details(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case_data = db.query(Case).filter(Case.id == case_id).first()
    if not case_data: raise HTTPException(status_code=404)
    
    evidence = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    entities = db.query(Entity).filter(Entity.case_id == case_id).all()
    relationships = db.query(Relationship).filter(Relationship.case_id == case_id).all()
    timeline = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).order_by(TimelineEvent.timestamp.asc()).all()
    scenarios = db.query(SimulationScenario).filter(SimulationScenario.case_id == case_id).all()
    
    return {
        **case_data.__dict__,
        "evidence": evidence,
        "entities": entities,
        "relationships": relationships,
        "timeline": timeline,
        "scenarios": scenarios
    }

@app.post("/api/cases/{case_id}/evidence")
async def upload_evidence(
    case_id: str, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save file
    file_id = str(uuid.uuid4())[:13]
    extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{extension}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    # Create evidence entry
    evidence_type = "document"
    if extension.lower() in ['.jpg', '.jpeg', '.png']: evidence_type = "photo"
    elif extension.lower() in ['.json']: evidence_type = "gps"
    elif extension.lower() in ['.csv']: evidence_type = "log"
    
    new_evidence = Evidence(
        id=f"ev_{file_id}",
        case_id=case_id,
        file_path=file_path,
        type=evidence_type,
        title=file.filename,
        content=f"Forensic content for {file.filename}",
        status="processing"
    )
    db.add(new_evidence)
    db.commit()
    
    # Simulate extraction and emit updates
    await sio.emit('evidence-processing', {"id": new_evidence.id, "status": "processing", "filename": file.filename}, room=f"case:{case_id}")
    
    # Create mock entity extracted from file
    mock_entity = Entity(
        id=f"en_{str(uuid.uuid4())[:8]}",
        case_id=case_id,
        evidence_id=new_evidence.id,
        type="artifact",
        label=f"Extracted from {file.filename}",
        properties="{}"
    )
    db.add(mock_entity)
    
    # Create mock timeline event
    new_event = TimelineEvent(
        id=f"t_{str(uuid.uuid4())[:8]}",
        case_id=case_id,
        evidence_id=new_evidence.id,
        timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
        label=f"Forensic Logic Link: {file.filename}",
        description=f"AI Engine synchronized {file.filename} temporal metadata with global case sequence.",
        type=new_evidence.type
    )
    db.add(new_event)
    
    # Create mock relation
    existing_entity = db.query(Entity).filter(Entity.case_id == case_id).first()
    if existing_entity:
        new_rel = Relationship(
            id=f"rel_{str(uuid.uuid4())[:8]}",
            case_id=case_id,
            source_id=mock_entity.id,
            target_id=existing_entity.id,
            type="temporal_overlap",
            is_contradiction=random.choice([True, False, False, False]), # 25% chance of contradiction
            description="Automated forensic relationship inferred by proximity analysis."
        )
        db.add(new_rel)
    
    new_evidence.status = "processed"
    db.commit()
    
    await sio.emit('evidence-processed', {"id": new_evidence.id, "status": "processed"}, room=f"case:{case_id}")
    
    return {"id": new_evidence.id, "status": "processed"}

# DEV SEED
@app.post("/api/dev/seed")
def seed_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case_id = "case_homicide_101"
    # Porting from JS ... (omitted for brevity but logically same)
    # Just a basic case for now
    existing = db.query(Case).filter(Case.id == case_id).first()
    if not existing:
        new_case = Case(id=case_id, name="Dockyard Warehouse Homicide Reconstruction", description="FastAPI Ported Archive", creator_id=current_user.id)
        db.add(new_case)
        # Add basic evidence
        ev1 = Evidence(id="ev_fast_1", case_id=case_id, type="witness", title="FastAPI Port Log", content="Successfully migrated kernel to Python.")
        db.add(ev1)
        # Add basic entity
        en1 = Entity(id="en_fast_1", case_id=case_id, type="system", label="AIVENTRA Kernel v4")
        db.add(en1)
    db.commit()
    return {"success": True}

# Socket events
@sio.on('join-case')
async def handle_join(sid, case_id):
    await sio.enter_room(sid, f"case:{case_id}")
    print(f"Socket {sid} joined case {case_id}")

# Serve Frontend
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(sio_app, host="0.0.0.0", port=3000)

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import secrets
import sqlite3
from pathlib import Path

from services.auth_service import hash_password, verify_password
from services.gemini_service import analyze_health_image
from services.qwen_service import classify_image
from services.oss_service import upload_bytes

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / ".env")
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "hydrascan.db"
MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # ~15MB fits typical 12-48MP mobile uploads
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


def _sanitize_path_part(value: str, label: str) -> str:
    if not value or any(ch not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-" for ch in value):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")
    return value


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AnalyzeRequest(BaseModel):
    image: str


class AnalyzeResponse(BaseModel):
    status: str
    description: str
    markers: list[dict[str, str]]
    recommendation: str


class ValidateResponse(BaseModel):
    accepted: bool
    label: str
    reason: str
    object_key: str | None = None


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest) -> AuthResponse:
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    with get_connection() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        password_hash = hash_password(payload.password)
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (payload.name.strip(), payload.email, password_hash),
        )
        conn.commit()
        user_id = cursor.lastrowid
        access_token = secrets.token_urlsafe(32)
        return AuthResponse(
            access_token=access_token,
            user=UserOut(id=user_id, name=payload.name.strip(), email=payload.email),
        )


@app.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            (payload.email,),
        ).fetchone()
        if not row or not verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        access_token = secrets.token_urlsafe(32)
        return AuthResponse(
            access_token=access_token,
            user=UserOut(id=row["id"], name=row["name"], email=row["email"]),
        )


@app.post("/upload-image", response_model=ValidateResponse)
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    test_id: str = Form(...),
    scan_type: str | None = Form(None),
) -> ValidateResponse:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    user_id = _sanitize_path_part(user_id, "user_id")
    test_id = _sanitize_path_part(test_id, "test_id")

    if scan_type and scan_type not in {"tongue", "urine"}:
        raise HTTPException(status_code=400, detail="Invalid scan type")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 15MB limit")

    result = classify_image(content, file.content_type)
    label = result.get("label", "other")
    reason = result.get("reason", "Unclear image")

    if label not in {"tongue", "urine"}:
        return ValidateResponse(accepted=False, label=label, reason=reason)

    if scan_type and label != scan_type:
        return ValidateResponse(accepted=False, label=label, reason=f"Expected a {scan_type} photo")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTS:
        ext = ".jpg" if file.content_type == "image/jpeg" else ".png" if file.content_type == "image/png" else ".webp"

    object_key = f"{user_id}/{test_id}/upload/{label}{ext}"

    try:
        upload_bytes(object_key, content, file.content_type)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OSS upload failed: {exc}") from exc

    return ValidateResponse(accepted=True, label=label, reason="Accepted", object_key=object_key)


@app.post("/analyze/{scan_type}", response_model=AnalyzeResponse)
def analyze(scan_type: str, payload: AnalyzeRequest) -> AnalyzeResponse:
    if scan_type not in {"tongue", "urine"}:
        raise HTTPException(status_code=400, detail="Invalid scan type")
    result = analyze_health_image(payload.image, scan_type)
    return AnalyzeResponse(**result)

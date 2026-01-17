from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import secrets
import sqlite3
import json
from pathlib import Path

from services.auth_service import hash_password, verify_password
from services.qwen_service import classify_image
from services.oss_service import upload_bytes, download_bytes, list_report_objects
from services.report_service import create_report_payload
from services.color_correction_service import correct_image_bytes

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


def _sanitize_object_key(value: str) -> str:
    if not value or value.startswith("/") or ".." in value:
        raise HTTPException(status_code=400, detail="Invalid object key")
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


class ValidateResponse(BaseModel):
    accepted: bool
    label: str
    reason: str
    object_key: str | None = None
    corrected_key: str | None = None


class GenerateReportRequest(BaseModel):
    user_id: str
    test_id: str
    age: int | None = None
    gender: str | None = None
    height_cm: int | None = None
    weight_kg: int | None = None


class GenerateReportResponse(BaseModel):
    object_key: str


class ReportListItem(BaseModel):
    object_key: str
    last_modified: str


class ReportListResponse(BaseModel):
    items: list[ReportListItem]


class ColorCorrectRequest(BaseModel):
    object_key: str


class ColorCorrectResponse(BaseModel):
    corrected_key: str
    content_type: str


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

    corrected_key = None
    if label == "urine":
        try:
            corrected_bytes, corrected_content_type, ext = correct_image_bytes(
                content,
                object_key=object_key,
                content_type=file.content_type,
            )
            obj_path = Path(object_key)
            corrected_key = str(obj_path.parent / f"{obj_path.stem}_corrected{ext}")
            upload_bytes(corrected_key, corrected_bytes, corrected_content_type)
        except Exception:
            corrected_key = object_key

    return ValidateResponse(
        accepted=True,
        label=label,
        reason="Accepted",
        object_key=object_key,
        corrected_key=corrected_key,
    )


@app.post("/generate-report", response_model=GenerateReportResponse)
def generate_report(payload: GenerateReportRequest) -> GenerateReportResponse:
    user_id = _sanitize_path_part(payload.user_id, "user_id")
    test_id = _sanitize_path_part(payload.test_id, "test_id")

    urine_bytes = None
    candidates = [
        "urine_corrected.jpg",
        "urine_corrected.jpeg",
        "urine_corrected.png",
        "urine_corrected.webp",
        "urine.jpg",
        "urine.jpeg",
        "urine.png",
        "urine.webp",
    ]
    for name in candidates:
        object_key = f"{user_id}/{test_id}/upload/{name}"
        try:
            urine_bytes, _ = download_bytes(object_key)
            if urine_bytes:
                break
        except Exception:
            continue

    tongue_bytes = None
    tongue_candidates = [
        "tongue_corrected.jpg",
        "tongue_corrected.jpeg",
        "tongue_corrected.png",
        "tongue_corrected.webp",
        "tongue.jpg",
        "tongue.jpeg",
        "tongue.png",
        "tongue.webp",
    ]
    for name in tongue_candidates:
        object_key = f"{user_id}/{test_id}/upload/{name}"
        try:
            tongue_bytes, _ = download_bytes(object_key)
            if tongue_bytes:
                break
        except Exception:
            continue

    profile = {
        "age": payload.age,
        "gender": payload.gender,
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
    }
    report = create_report_payload(
        urine_bytes=urine_bytes,
        tongue_bytes=tongue_bytes,
        user_profile=profile,
    )
    content = json.dumps(report, ensure_ascii=False).encode("utf-8")
    object_key = f"{user_id}/{test_id}/report/report.json"

    try:
        upload_bytes(object_key, content, "application/json")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OSS upload failed: {exc}") from exc

    return GenerateReportResponse(object_key=object_key)


@app.get("/reports/{user_id}", response_model=ReportListResponse)
def list_reports(user_id: str) -> ReportListResponse:
    user_id = _sanitize_path_part(user_id, "user_id")
    try:
        items = list_report_objects(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OSS list failed: {exc}") from exc
    return ReportListResponse(items=[ReportListItem(**item) for item in items])


@app.post("/correct-urine-color", response_model=ColorCorrectResponse)
def correct_urine_color(payload: ColorCorrectRequest) -> ColorCorrectResponse:
    object_key = _sanitize_object_key(payload.object_key.strip())
    try:
        content, content_type = download_bytes(object_key)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OSS download failed: {exc}") from exc

    try:
        corrected_bytes, out_content_type, ext = correct_image_bytes(
            content,
            object_key=object_key,
            content_type=content_type,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Color correction failed: {exc}") from exc

    obj_path = Path(object_key)
    corrected_key = str(obj_path.parent / f"{obj_path.stem}_corrected{ext}")
    try:
        upload_bytes(corrected_key, corrected_bytes, out_content_type)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OSS upload failed: {exc}") from exc

    return ColorCorrectResponse(corrected_key=corrected_key, content_type=out_content_type)


@app.get("/overview")
def get_overview():
    file_path = DATA_DIR / "overview.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Overview data not found")
    with open(file_path, "r") as f:
        return json.load(f)


@app.get("/report")
def get_report():
    raise HTTPException(status_code=400, detail="Missing object_key")


@app.get("/report/{object_key:path}")
def get_report_from_oss(object_key: str):
    object_key = _sanitize_object_key(object_key)
    try:
        content, _ = download_bytes(object_key)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OSS download failed: {exc}") from exc
    try:
        return json.loads(content.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail="Report JSON invalid") from exc

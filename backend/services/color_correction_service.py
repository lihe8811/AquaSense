from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np


def automatic_white_balance(image: np.ndarray) -> np.ndarray:
    result = image.astype(float)

    avg_b = np.mean(result[:, :, 0])
    avg_g = np.mean(result[:, :, 1])
    avg_r = np.mean(result[:, :, 2])
    avg_gray = (avg_b + avg_g + avg_r) / 3.0

    if avg_b == 0:
        avg_b = 1.0
    if avg_g == 0:
        avg_g = 1.0
    if avg_r == 0:
        avg_r = 1.0

    result[:, :, 0] *= avg_gray / avg_b
    result[:, :, 1] *= avg_gray / avg_g
    result[:, :, 2] *= avg_gray / avg_r

    result = np.clip(result, 0, 255)
    return result.astype(np.uint8)


def _guess_ext(object_key: str, content_type: str | None) -> str:
    ext = Path(object_key).suffix.lower()
    if ext in {".jpg", ".jpeg", ".png", ".webp"}:
        return ext
    if content_type == "image/png":
        return ".png"
    if content_type == "image/webp":
        return ".webp"
    return ".jpg"


def _content_type_for_ext(ext: str) -> str:
    if ext == ".png":
        return "image/png"
    if ext == ".webp":
        return "image/webp"
    return "image/jpeg"


def correct_image_bytes(
    image_bytes: bytes,
    object_key: str,
    content_type: str | None,
) -> tuple[bytes, str, str]:
    data = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image bytes")

    corrected = automatic_white_balance(image)

    ext = _guess_ext(object_key, content_type)
    success, encoded = cv2.imencode(ext, corrected)
    if not success:
        raise ValueError("Failed to encode corrected image")

    out_content_type = _content_type_for_ext(ext)
    return encoded.tobytes(), out_content_type, ext

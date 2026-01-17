from __future__ import annotations

import cv2
import numpy as np

from services.color_correction_service import automatic_white_balance


def _decode_image(image_bytes: bytes) -> np.ndarray:
    data = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image bytes")
    return image


def analyze_urine_hydration_bytes(image_bytes: bytes) -> dict[str, dict[str, object]]:
    img = _decode_image(image_bytes)
    corrected = automatic_white_balance(img)

    h, w, _ = corrected.shape
    center_y, center_x = h // 2, w // 2
    crop_h, crop_w = h // 5, w // 5
    roi = corrected[center_y - crop_h:center_y + crop_h, center_x - crop_w:center_x + crop_w]
    if roi.size == 0:
        raise ValueError("Urine ROI crop failed")

    roi_blur = cv2.GaussianBlur(roi, (5, 5), 0)
    lab_image = cv2.cvtColor(roi_blur, cv2.COLOR_BGR2Lab)

    l_cv, a_cv, b_cv = cv2.mean(lab_image)[:3]
    l_std = (l_cv * 100.0) / 255.0
    a_std = a_cv - 128.0
    b_std = b_cv - 128.0

    if b_std < 20:
        status = "Well Hydrated"
        risk_level = "Low"
    elif b_std < 30:
        status = "Mild Dehydration"
        risk_level = "Moderate"
    elif b_std < 45:
        status = "Significant Dehydration"
        risk_level = "High"
    else:
        status = "Severe Dehydration"
        risk_level = "Critical"

    usg_prediction = "< 1.020" if b_std < 22.6 else ">= 1.020"

    if b_std < 10:
        armstrong_grade = 1
    elif b_std < 15:
        armstrong_grade = 2
    elif b_std < 20:
        armstrong_grade = 3
    elif b_std < 30:
        armstrong_grade = 4
    elif b_std < 40:
        armstrong_grade = 5
    elif b_std < 50:
        armstrong_grade = 6
    else:
        armstrong_grade = 7

    return {
        "metrics": {
            "L_star": round(l_std, 2),
            "a_star": round(a_std, 2),
            "b_star": round(b_std, 2),
        },
        "analysis": {
            "hydration_status": status,
            "risk_level": risk_level,
            "estimated_armstrong_grade": armstrong_grade,
            "predicted_usg_threshold": usg_prediction,
        },
    }

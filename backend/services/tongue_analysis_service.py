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


def analyze_tongue_health_bytes(image_bytes: bytes) -> dict[str, object]:
    img = _decode_image(image_bytes)
    corrected = automatic_white_balance(img)

    hsv = cv2.cvtColor(corrected, cv2.COLOR_BGR2HSV)
    lower_red1 = np.array([0, 50, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 50, 50])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    tongue_mask = mask1 + mask2

    value = hsv[:, :, 2]
    value_mask = cv2.inRange(value, 40, 255)
    tongue_mask = cv2.bitwise_and(tongue_mask, value_mask)

    kernel = np.ones((5, 5), np.uint8)
    tongue_mask = cv2.morphologyEx(tongue_mask, cv2.MORPH_OPEN, kernel)
    tongue_mask = cv2.morphologyEx(tongue_mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(tongue_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        tongue_mask = np.zeros_like(tongue_mask)
        cv2.drawContours(tongue_mask, [largest], -1, 255, -1)

    total_tongue_pixels = cv2.countNonZero(tongue_mask)
    if total_tongue_pixels == 0:
        raise ValueError("No tongue detected. Check lighting/focus.")

    saturation = hsv[:, :, 1]
    tongue_sat = cv2.bitwise_and(saturation, saturation, mask=tongue_mask)
    _, coating_mask = cv2.threshold(tongue_sat, 60, 255, cv2.THRESH_BINARY_INV)
    coating_mask = cv2.bitwise_and(coating_mask, tongue_mask)

    coating_pixels = cv2.countNonZero(coating_mask)
    coating_ratio = (coating_pixels / total_tongue_pixels) * 100

    body_mask = cv2.bitwise_and(tongue_mask, cv2.bitwise_not(coating_mask))
    if cv2.countNonZero(body_mask) == 0:
        body_mask = tongue_mask

    lab_img = cv2.cvtColor(corrected, cv2.COLOR_BGR2Lab)
    mean_val = cv2.mean(lab_img, mask=body_mask)
    l_cv, a_cv, b_cv = mean_val[:3]

    l_std = (l_cv * 100.0) / 255.0
    a_std = a_cv - 128.0
    b_std = b_cv - 128.0

    l_channel = lab_img[:, :, 0]
    _, std_dev_l = cv2.meanStdDev(l_channel, mask=tongue_mask)
    moisture_score = std_dev_l[0][0]

    diagnosis = []
    if a_std > 35:
        diagnosis.append("High Heat / Dehydration (Red Body)")
    elif a_std < 20:
        diagnosis.append("Cold / Dampness (Pale Body)")
    else:
        diagnosis.append("Normal Color")

    if coating_ratio > 50:
        diagnosis.append("Thick Coating (Potential Dampness)")
    elif coating_ratio < 10:
        diagnosis.append("Peeled/No Coating (Yin Deficiency/Dry)")

    return {
        "metrics": {
            "body_redness_a": round(a_std, 2),
            "body_lightness_L": round(l_std, 2),
            "body_yellow_b": round(b_std, 2),
            "coating_percentage": round(coating_ratio, 1),
            "moisture_score": round(moisture_score, 2),
        },
        "diagnosis": diagnosis,
    }

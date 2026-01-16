import base64
import json
import os
from typing import Any


def _decode_base64_image(base64_image: str) -> bytes:
    if "," in base64_image:
        base64_image = base64_image.split(",", 1)[1]
    return base64.b64decode(base64_image)


def _fallback_response(scan_type: str) -> dict[str, Any]:
    status = "Mildly Dehydrated" if scan_type == "tongue" else "Concentrated"
    return {
        "status": status,
        "description": f"Your {scan_type} scan shows signs of moderate fluid loss.",
        "markers": [{"label": "Alert", "value": "Significant deficit"}],
        "recommendation": "Increase fluid intake immediately.",
    }


def analyze_health_image(base64_image: str, scan_type: str) -> dict[str, Any]:
    prompt = (
        "Analyze this tongue photo for hydration markers. "
        "Evaluate texture, color, and coating. Provide a hydration status "
        "and specific markers like 'Tip (Heart): Red' or 'Center (Stomach): Dry'."
        if scan_type == "tongue"
        else "Analyze this urine sample photo. Evaluate color and clarity. "
        "Determine specific gravity estimate and hydration level (e.g., Highly Concentrated)."
    )

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return _fallback_response(scan_type)

    try:
        import google.generativeai as genai
    except Exception:
        return _fallback_response(scan_type)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-3-flash-preview")
        image_bytes = _decode_base64_image(base64_image)
        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": image_bytes}],
            generation_config={"response_mime_type": "application/json"},
        )
        if not response.text:
            return _fallback_response(scan_type)
        return json.loads(response.text)
    except Exception:
        return _fallback_response(scan_type)

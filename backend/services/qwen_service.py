import base64
import json
import os
from typing import Any

from openai import OpenAI

PROMPT = (
    "Determine if the image shows (A) a close-up human tongue or "
    "(B) urine in a toilet bowl. Reply ONLY with JSON: "
    '{"label":"tongue|urine|other","reason":"short reason"}.'
)

REPORT_PROMPT = (
    "You are a hydration analysis assistant. Given report inputs as JSON, "
    "generate short, clinically cautious text. Use urineAnalysis.metrics and "
    "urineAnalysis.analysisData to write urineInsight, urineStatus, and urineColorLevel. "
    "Use tongueAnalysis.metrics and tongueAnalysis.diagnosis to write tongueInsight and tongueStatus. "
    "Choose the best drink from report.recommendedDrinks and return drinkId and drinkReason. "
    "Use userProfile "
    "(age, gender, height_cm, weight_kg) to personalize the tone and advice. "
    "Reply ONLY with JSON containing keys: "
    '"hydrationSummaryLevel", "hydrationSummaryStatus", "hydrationSummaryWellnessTip", '
    '"urineInsight", "urineStatus", "urineColorLevel", '
    '"tongueInsight", "tongueStatus", "drinkId", "drinkReason". '
    "The urineInsight should be a very detailed, clinically cautious text. "
    "Explain what each metric means and how it affects the insight. "
    "Write the insights in markdown format for readability. The tongueInsight must be markdown."
)


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found")
    return json.loads(text[start : end + 1])


def classify_image(image_bytes: bytes, mime_type: str) -> dict[str, str]:
    api_key = os.getenv("DASHSCOPE_API_KEY", "").strip()
    if not api_key:
        return {"label": "other", "reason": "DASHSCOPE_API_KEY not set"}

    client = OpenAI(
        api_key=api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

    data_url = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"
    completion = client.chat.completions.create(
        model="qwen-vl-plus",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text", "text": PROMPT},
                ],
            }
        ],
        temperature=0,
    )

    content = completion.choices[0].message.content or ""
    try:
        parsed = _extract_json(content)
    except Exception:
        return {"label": "other", "reason": "Model response was not valid JSON"}

    label = str(parsed.get("label", "other")).lower()
    reason = str(parsed.get("reason", "Unclear image"))
    if label not in {"tongue", "urine", "other"}:
        label = "other"
    return {"label": label, "reason": reason}


def generate_report_text(report_data: dict[str, Any]) -> dict[str, str] | None:
    api_key = os.getenv("DASHSCOPE_API_KEY", "").strip()
    if not api_key:
        return None

    client = OpenAI(
        api_key=api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {
                "role": "user",
                "content": f"{REPORT_PROMPT}\n\nINPUT_JSON:\n{json.dumps(report_data)}",
            }
        ],
        temperature=0.2,
    )

    content = completion.choices[0].message.content or ""
    try:
        parsed = _extract_json(content)
    except Exception:
        return None

    return {
        "hydrationSummaryLevel": parsed.get("hydrationSummaryLevel"),
        "hydrationSummaryStatus": str(parsed.get("hydrationSummaryStatus", "")),
        "hydrationSummaryWellnessTip": str(parsed.get("hydrationSummaryWellnessTip", "")),
        "urineInsight": str(parsed.get("urineInsight", "")),
        "urineStatus": str(parsed.get("urineStatus", "")),
        "urineColorLevel": str(parsed.get("urineColorLevel", "")),
        "tongueInsight": str(parsed.get("tongueInsight", "")),
        "tongueStatus": str(parsed.get("tongueStatus", "")),
        "drinkId": str(parsed.get("drinkId", "")),
        "drinkReason": str(parsed.get("drinkReason", "")),
    }

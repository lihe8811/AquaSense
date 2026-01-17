from __future__ import annotations

from datetime import datetime
import os
from typing import Any

from services.qwen_service import generate_report_text
from services.urine_analysis_service import analyze_urine_hydration_bytes
from services.tongue_analysis_service import analyze_tongue_health_bytes
from services.oss_service import get_object_url


def _today_label() -> str:
    return datetime.now().strftime("%b %d, %Y")


def _color_level_from_b_star(b_star: float) -> str:
    if b_star < 10:
        return "Very Pale"
    if b_star < 20:
        return "Pale Yellow"
    if b_star < 30:
        return "Light Yellow"
    if b_star < 40:
        return "Yellow"
    if b_star < 50:
        return "Dark Yellow"
    return "Amber"


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _compute_hydration_summary(report: dict[str, Any]) -> None:
    urine_metrics = report.get("urineAnalysis", {}).get("metrics") or {}
    tongue_metrics = report.get("tongueAnalysis", {}).get("metrics") or {}

    b_star = urine_metrics.get("b_star")
    moisture = tongue_metrics.get("moisture_score")
    coating = tongue_metrics.get("coating_percentage")
    redness = tongue_metrics.get("body_redness_a")

    if b_star is None or moisture is None or coating is None or redness is None:
        return

    urine_score = _clamp((b_star - 5) / 45)
    moisture_score = _clamp((12 - moisture) / 8)
    coating_score = _clamp((20 - coating) / 30)
    redness_score = _clamp((redness - 20) / 20)

    dehydration = (
        0.55 * urine_score
        + 0.25 * moisture_score
        + 0.12 * coating_score
        + 0.08 * redness_score
    )
    level = round(100 * (1 - dehydration))

    if level >= 80:
        status = "Well Hydrated"
    elif level >= 60:
        status = "Mildly Dehydrated"
    elif level >= 40:
        status = "Moderately Dehydrated"
    else:
        status = "Severely Dehydrated"

    dominant = max(
        [
            ("urine", urine_score),
            ("moisture", moisture_score),
            ("coating", coating_score),
            ("redness", redness_score),
        ],
        key=lambda item: item[1],
    )[0]

    if dehydration < 0.2:
        tip = "Hydration looks good—maintain your current intake and spread fluids evenly."
    elif dominant == "urine":
        tip = "Urine color looks concentrated—sip 250-500ml of water over the next hour."
    elif dominant in {"moisture", "coating"}:
        tip = "Tongue signs suggest dryness—sip fluids regularly and avoid long gaps."
    else:
        tip = "Tongue redness suggests heat—prefer cool fluids and lighter meals today."

    report["hydrationSummary"]["level"] = level
    report["hydrationSummary"]["status"] = status
    report["hydrationSummary"]["wellnessTip"] = tip


def _build_drink_url(filename: str) -> str:
    object_key = f"drinks/{filename}"
    try:
        return get_object_url(object_key)
    except Exception:
        bucket = os.getenv("OSS_BUCKET_NAME", "").strip()
        endpoint = os.getenv("OSS_ENDPOINT", "").strip()
        if bucket and endpoint:
            return f"https://{bucket}.{endpoint}/{object_key}"
        return f"/{object_key}"


def build_base_report(test_date: str | None = None) -> dict[str, Any]:
    date_label = test_date or _today_label()
    return {
        "testDate": date_label,
        "userProfile": {
            "age": None,
            "gender": None,
            "height_cm": None,
            "weight_kg": None,
        },
        "hydrationSummary": {
            "level": None,
            "status": "",
            "wellnessTip": "",
        },
        "urineAnalysis": {
            "status": "",
            "colorLevel": "",
            "insight": "",
            "analysis": "",
            "metrics": {},
            "analysisData": {},
        },
        "tongueAnalysis": {
            "status": "",
            "insight": "",
            "metrics": {},
            "diagnosis": [],
        },
        "recommendedDrinks": [
            {
                "id": "regular",
                "name": "Mizone Regular",
                "desc": "Balanced hydration for daily use.",
                "benefit": "Balanced",
                "img": _build_drink_url("regular.png"),
                "isBest": False,
                "reason": "",
            },
            {
                "id": "zero",
                "name": "Mizone Zero",
                "desc": "Zero carbohydrates with light hydration.",
                "benefit": "No Carbohydrate",
                "img": _build_drink_url("zero.png"),
                "isBest": False,
                "reason": "",
            },
            {
                "id": "electrolyte",
                "name": "Mizone Electrolyte",
                "desc": "Added electrolytes for recovery.",
                "benefit": "Electrolytes",
                "img": _build_drink_url("electrolyte.png"),
                "isBest": False,
                "reason": "",
            },
        ],
    }


def _apply_urine_analysis(report: dict[str, Any], urine_bytes: bytes) -> None:
    results = analyze_urine_hydration_bytes(urine_bytes)
    metrics = results["metrics"]
    analysis = results["analysis"]

    report["urineAnalysis"]["status"] = analysis["hydration_status"]
    report["urineAnalysis"]["colorLevel"] = _color_level_from_b_star(metrics["b_star"])
    report["urineAnalysis"]["insight"] = f"Armstrong Grade {analysis['estimated_armstrong_grade']}"
    report["urineAnalysis"]["metrics"] = metrics
    report["urineAnalysis"]["analysisData"] = {
        "hydration_status": analysis["hydration_status"],
        "risk_level": analysis["risk_level"],
        "estimated_armstrong_grade": analysis["estimated_armstrong_grade"],
    }
    report["urineAnalysis"]["analysis"] = (
        f"L* {metrics['L_star']}, a* {metrics['a_star']}, b* {metrics['b_star']} "
        f"indicate {analysis['risk_level'].lower()} dehydration risk."
    )


def create_report_payload(
    test_date: str | None = None,
    urine_bytes: bytes | None = None,
    tongue_bytes: bytes | None = None,
    user_profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    report = build_base_report(test_date=test_date)
    if user_profile:
        report["userProfile"].update(user_profile)
    if urine_bytes:
        try:
            _apply_urine_analysis(report, urine_bytes)
        except Exception:
            pass
    if tongue_bytes:
        try:
            results = analyze_tongue_health_bytes(tongue_bytes)
            report["tongueAnalysis"]["metrics"] = results.get("metrics", {})
            report["tongueAnalysis"]["diagnosis"] = results.get("diagnosis", [])
        except Exception:
            pass
    _compute_hydration_summary(report)
    generated = generate_report_text(report)
    if generated:
        level = generated.get("hydrationSummaryLevel", report["hydrationSummary"]["level"])
        status = generated.get("hydrationSummaryStatus", report["hydrationSummary"]["status"])
        tip = generated.get("hydrationSummaryWellnessTip", report["hydrationSummary"]["wellnessTip"])
        if level is not None:
            report["hydrationSummary"]["level"] = level
        if status:
            report["hydrationSummary"]["status"] = status
        if tip:
            report["hydrationSummary"]["wellnessTip"] = tip
        report["urineAnalysis"]["insight"] = generated.get(
            "urineInsight", report["urineAnalysis"]["insight"]
        )
        report["urineAnalysis"]["status"] = generated.get(
            "urineStatus", report["urineAnalysis"]["status"]
        )
        report["urineAnalysis"]["colorLevel"] = generated.get(
            "urineColorLevel", report["urineAnalysis"]["colorLevel"]
        )
        if report["urineAnalysis"]["analysis"] and report["urineAnalysis"]["analysis"] not in report["urineAnalysis"]["insight"]:
            report["urineAnalysis"]["insight"] = (
                f"{report['urineAnalysis']['insight']} {report['urineAnalysis']['analysis']}".strip()
            )
        report["urineAnalysis"]["analysis"] = ""
        report["tongueAnalysis"]["insight"] = generated.get(
            "tongueInsight", report["tongueAnalysis"]["insight"]
        )
        report["tongueAnalysis"]["status"] = generated.get(
            "tongueStatus", report["tongueAnalysis"]["status"]
        )
        selected_id = generated.get("drinkId", "")
        reason = generated.get("drinkReason", "")
        if selected_id:
            for drink in report["recommendedDrinks"]:
                is_best = drink["id"] == selected_id
                drink["isBest"] = is_best
                if is_best:
                    drink["reason"] = reason or drink.get("reason", "")
        if not any(drink.get("isBest") for drink in report["recommendedDrinks"]):
            report["recommendedDrinks"][0]["isBest"] = True
        report["recommendedDrinks"] = [drink for drink in report["recommendedDrinks"] if drink.get("isBest")]
    return report

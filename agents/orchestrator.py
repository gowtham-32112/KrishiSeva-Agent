"""
Root Orchestrator for KrishiSeva Agent.
Coordinates the multi-agent pipeline:
  Step 1: Weather Tool   → fetch real-time microclimate data
  Step 2: Diagnosis Agent → Gemini Vision crop disease identification
  Step 3: Advisory Agent  → climate-proof farming recommendations

This module is the ADK-compliant entry point for the KrishiSeva system.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from agents.diagnosis_agent import diagnose_crop_disease
from tools.weather_tool import get_weather_context
from agents.advisory_agent import generate_farming_advice


def run_krishiseva_pipeline(image_path: str, crop_name: str, location: str) -> dict:
    """
    Root Agent Orchestrator (krishiseva_orchestrator).

    Coordinates:
        Step 1: Weather context retrieval (Weather Tool / MCP)
        Step 2: Leaf disease identification (Diagnosis Agent / Gemini Vision)
        Step 3: Climate-aware advisory compilation (Advisory Agent / Rule Engine)

    Args:
        image_path: Path to the uploaded leaf image file
        crop_name: Name of the crop (e.g., Tomato, Rice, Wheat, Cotton)
        location: Farmer's district/city for weather lookup (e.g., Vijayawada)

    Returns:
        dict: {crop, location, weather, diagnosis, advisory} or {error: str}
    """
    try:
        print(f"[Orchestrator] ▶ Starting pipeline: {crop_name} @ {location}")

        # ── Step 1: Weather Context ─────────────────────────────────────────
        print(f"[Orchestrator] Step 1: Fetching weather for {location}...")
        weather_res = get_weather_context(location, crop_name)

        if weather_res.get("error") and not weather_res.get("temperature_celsius"):
            print(f"[Orchestrator] ⚠ Weather tool failed: {weather_res['error']}. Using defaults.")
            weather_res = {
                "temperature_celsius": 30,
                "humidity_percent": 65,
                "rain_expected": False,
                "condition": "Cloudy",
                "wind_speed_kmh": 10,
                "farming_advisory": "Weather API offline. Using safe-zone defaults.",
                "source": "Default Fallback"
            }

        print(f"[Orchestrator] Step 1 complete: {weather_res['temperature_celsius']}°C, "
              f"{weather_res['humidity_percent']}% humidity")

        # ── Step 2: Disease Diagnosis ────────────────────────────────────────
        print(f"[Orchestrator] Step 2: Running vision diagnosis for {crop_name}...")
        diagnosis_res = diagnose_crop_disease(image_path, crop_name)

        if diagnosis_res.get("error"):
            print(f"[Orchestrator] ✗ Diagnosis agent failed: {diagnosis_res['error']}")
            return {"error": f"Diagnosis failed: {diagnosis_res['error']}"}

        print(f"[Orchestrator] Step 2 complete: {diagnosis_res['disease_name']} "
              f"({diagnosis_res['confidence_percent']}% confidence)")

        # ── Step 3: Advisory Compilation ────────────────────────────────────
        print(f"[Orchestrator] Step 3: Generating weather-aware advisory...")
        advisory_res = generate_farming_advice(crop_name, location, diagnosis_res, weather_res)

        if advisory_res.get("error"):
            print(f"[Orchestrator] ✗ Advisory agent failed: {advisory_res['error']}")
            return {"error": f"Advisory compilation failed: {advisory_res['error']}"}

        print(f"[Orchestrator] ✓ Pipeline complete. Urgency: {advisory_res['urgency']}")

        return {
            "crop": crop_name,
            "location": location,
            "weather": weather_res,
            "diagnosis": diagnosis_res,
            "advisory": advisory_res
        }

    except Exception as e:
        print(f"[Orchestrator] ✗ Fatal pipeline crash: {e}")
        return {"error": f"Pipeline execution failed: {str(e)}"}


# ADK-compliant root agent reference
root_agent = run_krishiseva_pipeline

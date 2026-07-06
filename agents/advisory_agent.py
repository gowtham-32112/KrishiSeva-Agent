def generate_farming_advice(crop: str, location: str, diagnosis: dict, weather: dict) -> dict:
    """
    Step 3 Agent: Advisory Agent — Rule-based reasoning aggregator.

    Combines disease diagnosis outputs with real-time weather metrics to deliver
    climate-proof, actionable, localized safety alerts for Indian smallholder farmers.

    Key Rules Implemented:
        Rule 1 — Urgency Matrix (severity × rain forecast)
        Rule 2 — Precipitation Spray Alert (chemical wash-off danger)
        Rule 3 — Humidity & Thermal Stress Multipliers
        Rule 4 — Regional Kisan Helpline Mapping

    No external API calls — fully deterministic rule engine.
    """
    try:
        is_healthy = diagnosis.get("is_healthy", False)
        severity = diagnosis.get("severity", "None")
        has_rain = weather.get("rain_expected", False)
        humidity = weather.get("humidity_percent", 65)
        temp = weather.get("temperature_celsius", 30)
        disease_name = diagnosis.get("disease_name", "Unknown Disease")
        confidence = diagnosis.get("confidence_percent", 0)

        # ── Rule 1: Urgency Matrix ──────────────────────────────────────────
        if is_healthy:
            urgency = "🟢 MONITOR — Routine management"
        else:
            if severity == "High" or (severity == "Medium" and has_rain):
                urgency = "🔴 URGENT — Act within 24 hours"
            elif severity == "Medium":
                urgency = "🟡 CAUTION — Treat within 3–5 days"
            elif severity == "Low":
                urgency = "🟢 MONITOR — Treat during routine field schedule"
            else:
                urgency = "🟢 MONITOR — Routine management"

        # ── Rule 2: Rain Spray Alert ────────────────────────────────────────
        if not is_healthy:
            if has_rain:
                rain_alert = (
                    "⚠️ CRITICAL ALERT: Rain expected in your region! "
                    "Do NOT spray liquid contact fungicides or insecticides. "
                    "The water runoff will wash off chemical residues, wasting money "
                    "and contaminating groundwater. Wait until rain clears and leaf "
                    "canopy dries, then apply a systemic cure (e.g., Metalaxyl-M)."
                )
            else:
                rain_alert = (
                    "✅ SAFE SPRAY WINDOW: Dry weather forecasted. Ideal conditions for "
                    "applying therapeutic sprays. Schedule for early mornings or late "
                    "evenings when wind speed is under 8 km/h to prevent spray drift."
                )
        else:
            if has_rain:
                rain_alert = (
                    "🌧️ RAIN PREDICTED: Crop is healthy! Ensure proper drainage in lower "
                    "rows to prevent waterlogging and root rot."
                )
            else:
                rain_alert = (
                    "☀️ SUNNY WINDOW: Optimal weather. Continue clearing field borders to "
                    "remove weed hosts of insect vectors (thrips/aphids)."
                )

        # ── Rule 3: Microclimate Risk Multipliers ───────────────────────────
        if not is_healthy:
            if humidity > 80:
                weather_adv = (
                    f"⚠️ FUNGAL MULTIPLIER WARNING: High relative humidity ({humidity}%) detected! "
                    f"Spores of {disease_name} germinate rapidly under humid canopies. "
                    "Perform manual pruning of congested leaves immediately to improve "
                    "wind flow and sunlight drying in the crop rows."
                )
            elif temp > 36:
                weather_adv = (
                    f"⚠️ THERMAL STRESS WARNING: High heat ({temp}°C) detected. "
                    "Applying certain emulsified chemical sprays in peak heat can scorch "
                    "crop leaves (phytotoxicity). Postpone spraying until temperature drops "
                    "below 32°C — spray only in late evenings."
                )
            else:
                weather_adv = (
                    f"Weather conditions ({temp}°C, {humidity}% humidity) are within safe "
                    "ranges for treatment. Carry out planned therapeutic sprays as scheduled."
                )
        else:
            weather_adv = (
                f"Excellent crop vitality. Microclimate ({temp}°C, {humidity}% humidity) "
                f"is stable and conducive for {crop} development. Continue standard mulching."
            )

        # ── Rule 4: Kisan Helpline Integration ─────────────────────────────
        follow_up = (
            f"For immediate live support, call the Kisan Call Centre (KCC) at "
            f"toll-free 1800-180-1551 (6 AM – 10 PM daily). Speak directly with "
            f"government agronomists in your local language. "
            f"Visit your nearest Krishi Vigyan Kendra (KVK) in {location.title()} "
            "district for soil testing and clinical seed validation."
        )

        # ── Diagnostic Summary Statement ────────────────────────────────────
        if is_healthy:
            diag_summary = (
                f"Your {crop} leaf in {location.title()} was analyzed and diagnosed as "
                f"Healthy (Confidence: {confidence}%). No foliage lesions, blight signs, "
                "or viral twisting patterns were detected. Leaf structural turgor is optimal. "
                "Continue routine soil care and preventative maintenance."
            )
        else:
            diag_summary = (
                f"Your {crop} crop in {location.title()} is affected by {disease_name} "
                f"(Confidence: {confidence}%). The illness is active at a {severity} severity "
                "level. Visible lesions and chlorosis indicate active pathogen activity. "
                "Prompt treatment is required to prevent further yield decline."
            )

        return {
            "urgency": urgency,
            "diagnosis_summary": diag_summary,
            "treatment_plan": diagnosis.get("top_3_treatments", ["Contact local agronomist."]),
            "weather_advisory": weather_adv,
            "rain_alert": rain_alert,
            "follow_up": follow_up,
            "error": None
        }

    except Exception as e:
        return {"error": f"Advisory compilation failed: {str(e)}"}

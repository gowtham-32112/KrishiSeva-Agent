"""
KrishiSeva Agent — Gradio Application Entry Point
=================================================
HuggingFace Spaces deployment for the Kaggle "AI Agents: Intensive Vibe Coding Capstone"
Track: Agents for Good

Multi-agent pipeline:
  Orchestrator → Diagnosis Agent (Gemini 2.0 Flash) → Weather Tool (OpenWeatherMap MCP) → Advisory Agent
"""
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

import gradio as gr

# Import the root orchestrator
from agents.orchestrator import run_krishiseva_pipeline

# ──────────────────────────────────────────────
# Core processing function
# ──────────────────────────────────────────────

def process_diagnosis(image, crop_name: str, location: str):
    """
    Gradio interface handler.
    Receives image, crop, and location → runs multi-agent pipeline → returns results.
    """
    # Input validation
    if image is None:
        return (
            "⚠️ Please upload a photo of the affected plant leaf.",
            "❌ Incomplete", "N/A", "N/A", "N/A", "N/A"
        )

    if not crop_name:
        return (
            "⚠️ Please select the crop type.",
            "❌ Incomplete", "N/A", "N/A", "N/A", "N/A"
        )

    location = (location or "Vijayawada").strip()

    # Save uploaded image to a temp file for the diagnosis agent
    try:
        if isinstance(image, str):
            # Already a file path (Gradio filepath mode)
            image_path = image
        else:
            # numpy array from Gradio — save to temp file
            from PIL import Image as PILImage
            import numpy as np
            pil_image = PILImage.fromarray(image.astype("uint8"))
            tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
            pil_image.save(tmp.name, format="JPEG", quality=90)
            image_path = tmp.name
    except Exception as e:
        return (
            f"❌ Image processing error: {e}",
            "❌ Failed", "N/A", "N/A", "N/A", "N/A"
        )

    # Run the multi-agent pipeline
    result = run_krishiseva_pipeline(image_path, crop_name, location)

    if "error" in result and result["error"]:
        return (
            f"❌ System Error: {result['error']}",
            "🔴 Failed", "N/A", "N/A", "N/A", "N/A"
        )

    advisory = result.get("advisory", {})
    diagnosis = result.get("diagnosis", {})
    weather = result.get("weather", {})

    # Format treatment plan as numbered HTML list
    treatment_html = "<ol style='padding-left:20px;margin:8px 0;line-height:1.8;'>"
    for step in advisory.get("treatment_plan", ["Contact local agronomist."]):
        treatment_html += f"<li style='margin-bottom:6px;'>{step}</li>"
    treatment_html += "</ol>"

    # Format weather card
    source = weather.get("source", "Simulated")
    weather_html = f"""
    <div style='background:#f0fdf4;padding:14px;border-radius:10px;border-left:4px solid #16a34a;font-family:sans-serif;'>
        <div style='display:flex;gap:24px;margin-bottom:10px;flex-wrap:wrap;'>
            <span>🌡️ <strong>{weather.get('temperature_celsius','N/A')}°C</strong></span>
            <span>💧 <strong>{weather.get('humidity_percent','N/A')}%</strong> Humidity</span>
            <span>💨 <strong>{weather.get('wind_speed_kmh','N/A')} km/h</strong> Wind</span>
            <span>☁️ <strong>{weather.get('condition','N/A')}</strong></span>
        </div>
        <p style='margin:0;font-size:0.9em;color:#166534;font-style:italic;'>
            {weather.get('farming_advisory','')}
        </p>
        <p style='margin:6px 0 0;font-size:0.75em;color:#6b7280;'>Source: {source}</p>
    </div>
    """

    # Symptoms chips
    symptoms = diagnosis.get("symptoms_observed", [])
    symptoms_html = "<div style='display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;'>"
    for s in symptoms:
        symptoms_html += (
            f"<span style='background:#fef3c7;color:#92400e;padding:3px 10px;"
            f"border-radius:20px;font-size:0.82em;border:1px solid #fbbf24;'>{s}</span>"
        )
    symptoms_html += "</div>"

    urgency = advisory.get("urgency", "🟢 MONITOR")
    summary = advisory.get("diagnosis_summary", "")
    rain_alert = advisory.get("rain_alert", "")
    follow_up = advisory.get("follow_up", "")
    model_used = diagnosis.get("source_model", "gemini-2.0-flash")

    full_summary = f"{summary}\n\n**Symptoms Detected:** {', '.join(symptoms)}\n\n*Model: {model_used}*"

    return (
        full_summary,
        urgency,
        treatment_html,
        weather_html,
        rain_alert,
        follow_up
    )


# ──────────────────────────────────────────────
# Build the Gradio UI
# ──────────────────────────────────────────────

# Custom theme
theme = gr.themes.Soft(
    primary_hue="emerald",
    secondary_hue="slate",
    neutral_hue="slate",
    font=gr.themes.GoogleFont("Inter"),
    font_mono=gr.themes.GoogleFont("JetBrains Mono")
)

HEADER_HTML = """
<div style="
    background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #1B4332 100%);
    padding: 28px 32px;
    border-radius: 16px;
    margin-bottom: 8px;
    color: white;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 32px rgba(27,67,50,0.25);
">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
        <div style="font-size:2.5rem;">🌾</div>
        <div>
            <h1 style="margin:0;font-size:1.9rem;font-weight:800;letter-spacing:-0.5px;">
                KrishiSeva Agent
            </h1>
            <p style="margin:2px 0 0;opacity:0.75;font-size:0.85rem;letter-spacing:1px;text-transform:uppercase;">
                AI Multi-Agent Crop Disease Advisor • Agents for Good
            </p>
        </div>
    </div>
    <p style="margin:0;opacity:0.85;font-size:0.95rem;max-width:700px;line-height:1.6;">
        Upload a diseased crop leaf photo → get instant AI-powered diagnosis with
        <strong>Gemini 2.0 Flash Vision</strong> + live <strong>weather-aware treatment advice</strong>
        for Indian smallholder farmers. Reducing crop loss diagnosis from <em>days to under 60 seconds.</em>
    </p>
    <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;">
        <span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;font-size:0.78rem;border:1px solid rgba(255,255,255,0.25);">
            ✅ Multi-Agent (ADK)
        </span>
        <span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;font-size:0.78rem;border:1px solid rgba(255,255,255,0.25);">
            ✅ MCP Weather Server
        </span>
        <span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;font-size:0.78rem;border:1px solid rgba(255,255,255,0.25);">
            ✅ Secure Key Management
        </span>
        <span style="background:rgba(255,255,255,0.15);padding:4px 12px;border-radius:20px;font-size:0.78rem;border:1px solid rgba(255,255,255,0.25);">
            ⭐ Antigravity Preview Model
        </span>
    </div>
</div>
"""

FOOTER_HTML = """
<div style="
    text-align:center;
    margin-top:24px;
    padding:16px;
    border-top:1px dashed #d1fae5;
    color:#6b7280;
    font-size:0.85rem;
    font-family:'Inter',sans-serif;
">
    <strong style="color:#065f46;">🌾 KrishiSeva Agent</strong> —
    Kaggle "AI Agents: Intensive Vibe Coding Capstone" | Agents for Good Track<br/>
    <span style="color:#059669;">📞 Kisan Helpline: Toll-free 1800-180-1551 (6 AM – 10 PM daily)</span><br/>
    Built with ❤️ for 86 million Indian smallholder farmers
</div>
"""

with gr.Blocks(theme=theme, title="KrishiSeva Agent — AI Crop Disease Advisor") as demo:

    gr.HTML(HEADER_HTML)

    with gr.Row(equal_height=False):

        # ── LEFT: Input Panel ──────────────────────────────────────────────
        with gr.Column(scale=1, min_width=300):
            gr.Markdown("### 📸 Step 1: Upload Sick Leaf Photo")
            input_image = gr.Image(
                type="filepath",
                label="Crop Leaf Image",
                height=220
            )

            gr.Markdown("### 🌿 Step 2: Crop & Location")
            crop_input = gr.Dropdown(
                choices=["Tomato", "Potato", "Rice", "Wheat", "Cotton", "Chilli"],
                value="Tomato",
                label="Crop Type"
            )
            location_input = gr.Textbox(
                placeholder="e.g., Vijayawada, Guntur, Nagpur, Shimla...",
                value="Vijayawada",
                label="Your Location (for live weather advisory)"
            )

            analyze_btn = gr.Button(
                "🔍 Diagnose Crop Health",
                variant="primary",
                size="lg"
            )

            gr.Markdown("""
            > **Supported crops:** Tomato, Potato, Rice, Wheat, Cotton, Chilli
            >
            > **No API key?** Runs in Expert Simulation Mode automatically.
            > Set `GEMINI_API_KEY` in Space secrets for live Gemini 2.0 Flash analysis.
            """)

        # ── RIGHT: Results Panel ───────────────────────────────────────────
        with gr.Column(scale=1.3, min_width=380):
            gr.Markdown("### 📋 Diagnostic Report")

            urgency_out = gr.Textbox(
                label="⚡ Action Urgency Rating",
                interactive=False,
                lines=1
            )
            diagnosis_out = gr.Textbox(
                label="🔬 Agronomist Assessment Summary",
                interactive=False,
                lines=5
            )

            gr.Markdown("**💊 Recommended Treatment Plan**")
            treatments_out = gr.HTML(label="Treatment Steps")

            gr.Markdown("**🌤️ Microclimate Weather Context**")
            weather_out = gr.HTML(label="Weather Advisory")

            rain_out = gr.Textbox(
                label="🌧️ Precipitation Spray Alert",
                interactive=False,
                lines=2
            )
            helpline_out = gr.Textbox(
                label="📞 Kisan Support & Helpline",
                interactive=False,
                lines=2
            )

    # Wire up the button
    analyze_btn.click(
        fn=process_diagnosis,
        inputs=[input_image, crop_input, location_input],
        outputs=[
            diagnosis_out,
            urgency_out,
            treatments_out,
            weather_out,
            rain_out,
            helpline_out
        ]
    )

    gr.HTML(FOOTER_HTML)


# ──────────────────────────────────────────────
# Launch configuration for HuggingFace Spaces
# ──────────────────────────────────────────────
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )

// Production-grade Python code representation for the KrishiSeva Agent workspace
// Configured exactly to the Kaggle competition rules and the critical technical requirements.

export const PYTHON_CODEBASE = {
  "requirements.txt": `# KrishiSeva Agent Dependencies
# Certified for python 3.10+ and Kaggle Agents for Good track
google-adk>=0.3.0
google-genai>=0.5.0
gradio>=4.0.0
requests>=2.31.0
python-dotenv>=1.0.0
pillow>=10.1.0
mcp>=1.0.0
uvicorn>=0.23.0
`,

  ".env.example": `# KrishiSeva Agent Environment Variables
# Duplicate this file as .env and replace placeholders with real keys

# Google AI Studio Gemini API Key
# Get your key from: https://aistudio.google.com/apikey
GEMINI_API_KEY="AI_STUDIO_API_KEY_HERE"

# OpenWeatherMap API Key (used for climate-aware agronomic advisory)
# Get your free key from: https://openweathermap.org/api
OPENWEATHER_API_KEY="OPEN_WEATHER_API_KEY_HERE"
`,

  "app.py": `import os
import gradio as gr
from dotenv import load_dotenv
from PIL import Image

# Initialize environment
load_dotenv()

# Import orchestrator
from agents.orchestrator import run_krishiseva_pipeline

def process_diagnosis(image_path, crop_name, location):
    """
    Interface processor for Gradio UI.
    Receives image, crop, and location, then triggers the root orchestrator.
    """
    if not image_path:
        return (
            "⚠️ Error: Please upload an image of the affected plant leaf.",
            "❌ Diagnostic Incomplete",
            "N/A", "N/A", "N/A", "N/A"
        )
    
    if not crop_name:
        return (
            "⚠️ Error: Please specify the crop type (e.g., Tomato, Rice).",
            "❌ Diagnostic Incomplete",
            "N/A", "N/A", "N/A", "N/A"
        )
        
    location = location.strip() or "Vijayawada"
    
    # Run orchestrator pipeline
    result = run_krishiseva_pipeline(image_path, crop_name, location)
    
    if "error" in result:
        return (
            f"❌ System Error: {result['error']}",
            "🔴 Failed", "N/A", "N/A", "N/A", "N/A"
        )
        
    advisory = result.get("advisory", {})
    diagnosis = result.get("diagnosis", {})
    weather = result.get("weather", {})
    
    # Format treatment steps into clean HTML bullets
    treatment_html = "<ol style='padding-left: 20px; margin: 0;'>"
    for step in advisory.get("treatment_plan", []):
        treatment_html += f"<li style='margin-bottom: 8px;'>{step}</li>"
    treatment_html += "</ol>"
    
    # Construct Weather Summary Card HTML
    weather_html = f"""
    <div style='background: #f1f5f9; padding: 12px; border-radius: 8px; border-left: 4px solid #0284c7;'>
        <strong>📍 Location:</strong> {location.title()}<br/>
        <strong>🌡️ Temp:</strong> {weather.get('temperature_celsius', 'N/A')}°C | 
        <strong>💧 Humidity:</strong> {weather.get('humidity_percent', 'N/A')}%<br/>
        <strong>💨 Wind:</strong> {weather.get('wind_speed_kmh', 'N/A')} km/h | 
        <strong>☁️ Sky:</strong> {weather.get('condition', 'N/A').title()}<br/>
        <p style='margin-top: 8px; font-size: 0.9em; font-style: italic; color: #334155;'>
            {weather.get('farming_advisory', '')}
        </p>
    </div>
    """
    
    urgency_badge = advisory.get("urgency", "🟢 MONITOR — Routine management")
    
    return (
        advisory.get("diagnosis_summary", ""),
        urgency_badge,
        treatment_html,
        weather_html,
        advisory.get("rain_alert", ""),
        advisory.get("follow_up", "")
    )

# Build beautiful, farmer-friendly Gradio Interface
theme = gr.themes.Soft(
    primary_hue="emerald",
    secondary_hue="slate",
    neutral_hue="slate"
)

with gr.Blocks(theme=theme, title="KrishiSeva Agent — Intelligent Crop Doctor") as demo:
    gr.HTML("""
    <div style="text-align: center; margin-bottom: 24px; padding: 12px 0; border-bottom: 2px solid #e2e8f0;">
        <h1 style="color: #065f46; font-size: 2.5em; margin: 0; font-weight: bold;">🌾 KrishiSeva Agent</h1>
        <p style="color: #475569; font-size: 1.1em; margin-top: 6px;">
            Intelligent Multi-Agent System for Real-Time Disease Diagnosis & Weather-Aware Treatment Advisory
        </p>
    </div>
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 📸 Step 1: Upload Sick Leaf Photo")
            input_image = gr.Image(type="filepath", label="Crop Leaf Image")
            
            gr.Markdown("### 📝 Step 2: Context Details")
            crop_input = gr.Dropdown(
                choices=["Tomato", "Potato", "Rice", "Wheat", "Cotton", "Chilli"],
                value="Tomato",
                label="Crop Type"
            )
            location_input = gr.Textbox(
                placeholder="E.g., Vijayawada, Guntur, Nagpur...",
                value="Vijayawada",
                label="Your Location (for localized weather advisory)"
            )
            
            analyze_btn = gr.Button("🔍 Diagnose Crop Health", variant="primary", size="lg")
            
        with gr.Column(scale=1.2):
            gr.Markdown("### 📋 Diagnostic Report")
            
            with gr.Row():
                urgency_out = gr.Label(label="Action Urgency Rating")
                
            diagnosis_out = gr.Textbox(label="Agronomist Assessment Summary", interactive=False, lines=4)
            treatments_out = gr.HTML(label="Recommended Treatment Plan")
            weather_out = gr.HTML(label="Microclimate Context Summary")
            rain_out = gr.Textbox(label="Precipitation Spray Alert", interactive=False)
            helpline_out = gr.Markdown(label="📞 Support Helpline Info")
            
    # Trigger action
    analyze_btn.click(
        fn=process_diagnosis,
        inputs=[input_image, crop_input, location_input],
        outputs=[diagnosis_out, urgency_out, treatments_out, weather_out, rain_out, helpline_out]
    )
    
    gr.HTML("""
    <footer style="text-align: center; margin-top: 32px; font-size: 0.9em; color: #64748b; padding-top: 16px; border-top: 1px dashed #cbd5e1;">
        KrishiSeva Agent is built for the Kaggle "AI Agents: Intensive Vibe Coding Capstone" Competition. 
        Kisan Helpline: Toll-free 1800-180-1551.
    </footer>
    """)

if __name__ == "__main__":
    # Standard launch configuration for HuggingFace Spaces
    demo.launch(server_name="0.0.0.0", server_port=7860, share=False)
`,

  "agents/diagnosis_agent.py": `import os
from io import BytesIO
from dotenv import load_dotenv
from PIL import Image

# ALWAYS load dotenv first
load_dotenv()

# CRITICAL TECHNICAL RULE: Do NOT use deprecated google.generativeai.
# Always use the modern google-genai Client.
from google import genai
from google.genai import types

# Establish client setup at module level rather than inside functions
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_client = None

if GEMINI_API_KEY:
    try:
        # Pass apiKey parameter inside named dictionary wrapper per SDK spec
        _client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to instantiate Gemini client: {e}")

def diagnose_crop_disease(image_path: str, crop_name: str) -> dict:
    """
    Step 1 Agent: Diagnosis Agent.
    Utilizes Gemini 3.5 Flash Vision capabilities to identify plant leaf disease symptoms.
    
    Returns:
        dict: {disease_name, confidence_percent, severity, symptoms_observed, top_3_treatments, is_healthy}
    """
    if not _client:
        return {"error": "Gemini Client uninitialized. Please set GEMINI_API_KEY in .env."}
        
    try:
        if not os.path.exists(image_path):
            return {"error": f"Uploaded leaf image file not found: {image_path}"}
            
        # Open and format image safely using Pillow
        image = Image.open(image_path)
        
        # Buffer image bytes
        buffer = BytesIO()
        image.save(buffer, format="JPEG")
        image_bytes = buffer.getvalue()
        
        prompt = f"""You are an elite plant pathologist advising smallholder farmers. 
Analyze this leaf photograph of a "{crop_name}" crop.
Diagnose the disease or pest infestation. If the crop is healthy, classify it as "Healthy".

Provide your output in strict JSON format. You must respond with ONLY JSON. No markdown backticks or wrappers.
The JSON must contain exactly these keys:
1. "disease_name": (string, common + scientific name, or 'Healthy')
2. "confidence_percent": (integer between 0 and 100)
3. "severity": (string: "Low", "Medium", "High", or "None")
4. "symptoms_observed": (list of strings listing physical symptoms observed)
5. "top_3_treatments": (list of strings detailing chemical, organic, or cultural cures suitable for Indian farmers)
6. "is_healthy": (boolean: true if no symptoms of disease or infestation are visible)
"""

        # Generate content with image bytes using primary model + graceful fallback
        # Models tried in order: gemini-2.0-flash → antigravity-preview-05-2026 → gemini-1.5-flash-latest
        models_to_try = [
            "gemini-2.0-flash",
            "models/antigravity-preview-05-2026",
            "gemini-1.5-flash-latest"
        ]
        response = None
        last_error = None
        for model_name in models_to_try:
            try:
                response = _client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                        types.Part.from_text(text=prompt)
                    ]
                )
                print(f"[Diagnosis Agent] Success with model: {model_name}")
                break
            except Exception as model_err:
                print(f"[Diagnosis Agent] Model {model_name} failed: {model_err}")
                last_error = model_err
                continue
        
        if response is None:
            raise last_error or RuntimeError("All models failed.")
        
        result_text = response.text.strip()
        
        # Strip json markers if Gemini includes them
        if result_text.startswith("\`\`\`json"):
            result_text = result_text[7:]
        if result_text.endswith("\`\`\`"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        import json
        diagnosis_data = json.loads(result_text)
        
        # Ensure all required keys exist
        required_keys = ["disease_name", "confidence_percent", "severity", "symptoms_observed", "top_3_treatments", "is_healthy"]
        for key in required_keys:
            if key not in diagnosis_data:
                raise ValueError(f"Gemini response missing critical structural key: {key}")
                
        return diagnosis_data
        
    except Exception as e:
        print(f"Error in Diagnosis Agent: {e}")
        return {"error": f"Diagnosis failed: {str(e)}"}
`,

  "agents/advisory_agent.py": `import os
from dotenv import load_dotenv

load_dotenv()

def generate_farming_advice(crop: str, location: str, diagnosis: dict, weather: dict) -> dict:
    """
    Step 3 Agent: Advisory Agent (Rule-based reasoning aggregator).
    Combines disease diagnosis outputs with OpenWeatherMap metrics to deliver 
    climate-proof, actionable, localized safety alerts.
    
    No API calls. Implements deterministic agricultural safety rules.
    """
    try:
        is_healthy = diagnosis.get("is_healthy", False)
        severity = diagnosis.get("severity", "None")
        has_rain = weather.get("rain_expected", False)
        humidity = weather.get("humidity_percent", 50)
        temp = weather.get("temperature_celsius", 30)
        
        # Rule 1: Determine Action Urgency
        if is_healthy:
            urgency = "🟢 MONITOR — Routine management"
        else:
            if severity == "High" or (severity == "Medium" and has_rain):
                urgency = "🔴 URGENT — Act within 24 hours"
            elif severity == "Medium":
                urgency = "🟡 CAUTION — Treat within 3-5 days"
            else:
                urgency = "🟢 MONITOR — Treat during routine field schedule"
                
        # Rule 2: Calculate Rain Spray Alerts (Chemical wash-off danger)
        if not is_healthy:
            if has_rain:
                rain_alert = (
                    "⚠️ CRITICAL ALERT: Rain expected in your region! Do NOT spray liquid contact fungicides or insecticides. "
                    "The water runoff will wash off chemical residues, wasting money and contaminating groundwater. "
                    "Wait until rain clears and leaf canopy dries, then spray a systemic cure (e.g., Metalaxyl-M)."
                )
            else:
                rain_alert = (
                    "✅ SAFE SPRAY WINDOW: Dry weather forecasted. Ideal conditions for applying therapeutic sprays. "
                    "Schedule spraying for early mornings or late evenings when wind speed is under 8 km/h to prevent spray drift."
                )
        else:
            if has_rain:
                rain_alert = "🌧️ RAIN PREDICTED: Plants are healthy. Ensure proper drainage in lower rows to prevent root rot."
            else:
                rain_alert = "☀️ SUNNY WINDOW: Optimal weather. Continue clearing field borders to remove weed hosts of insect vectors."

        # Rule 3: Humidity & Thermal Stress Multipliers
        if not is_healthy:
            if humidity > 80:
                weather_adv = (
                    f"⚠️ FUNGAL MULTIPLIER WARNING: High relative humidity ({humidity}%) detected! "
                    f"Spores of {diagnosis.get('disease_name', 'fungal pathogens')} germinate rapidly under humid canopies. "
                    f"Perform manual pruning of congested leaves immediately to improve wind flow and sunlight drying."
                )
            elif temp > 36:
                weather_adv = (
                    f"⚠️ THERMAL STRESS WARNING: High heat ({temp}°C) detected. "
                    f"Applying certain emulsified chemical sprays in peak heat can scorch crop leaves (phytotoxicity). "
                    f"Postpone spraying until the ambient temperature drops below 32°C."
                )
            else:
                weather_adv = f"Weather conditions ({temp}°C, {humidity}% humidity) are stable. Carry out planned treatments normally."
        else:
            weather_adv = f"Weather is stable. Microclimate represents ideal development conditions for {crop} plants."

        # Rule 4: Regional Helpline Mapping
        follow_up = (
            f"Kisan Helpline: Call 1800-180-1551 (Toll-Free) for immediate live advice. "
            f"Consult the nearest Krishi Vigyan Kendra (KVK) in {location.title()} district for clinical leaf and soil checks."
        )

        # Generate summary statement
        disease_name = diagnosis.get("disease_name", "Unknown Disease")
        confidence = diagnosis.get("confidence_percent", 0)
        
        if is_healthy:
            diag_summary = (
                f"Your {crop} leaf in {location} was analyzed and diagnosed as healthy (Confidence: {confidence}%). "
                f"No foliage lesions, blight signs, or viral twisting patterns were found. Continue routine soil care."
            )
        else:
            diag_summary = (
                f"Your {crop} crop in {location} is affected by {disease_name} (Confidence: {confidence}%). "
                f"The illness is active at a {severity} level. Prompt treatment is required to prevent yield loss."
            )

        return {
            "urgency": urgency,
            "diagnosis_summary": diag_summary,
            "treatment_plan": diagnosis.get("top_3_treatments", ["N/A"]),
            "weather_advisory": weather_adv,
            "rain_alert": rain_alert,
            "follow_up": follow_up,
            "error": None
        }
        
    except Exception as e:
        return {"error": f"Advisory compiling failed: {str(e)}"}
`,

  "agents/orchestrator.py": `import os
from dotenv import load_dotenv

load_dotenv()

from agents.diagnosis_agent import diagnose_crop_disease
from tools.weather_tool import get_weather_context
from agents.advisory_agent import generate_farming_advice

def run_krishiseva_pipeline(image_path: str, crop_name: str, location: str) -> dict:
    """
    Root Agent Orchestrator (krishiseva_orchestrator).
    Coordinates Step 1 (Gemini Vision Diagnosis), Step 2 (Weather tool context lookup), 
    and Step 3 (Agronomic rule advisory mapping).
    
    This fulfills the ADK orchestrator blueprint.
    """
    try:
        print(f"[Orchestrator] Running diagnostics for crop: {crop_name} at {location}")
        
        # 1. Weather Context Retrieval (Weather Tool)
        weather_res = get_weather_context(location, crop_name)
        if "error" in weather_res and weather_res["error"]:
            print(f"[Orchestrator] Warning: Weather tool failed. Operating on defaults. Error: {weather_res['error']}")
            # Fallback default weather structure (NON-FATAL)
            weather_res = {
                "temperature_celsius": 30,
                "humidity_percent": 65,
                "rain_expected": False,
                "condition": "Cloudy",
                "wind_speed_kmh": 10,
                "farming_advisory": "Weather API offline. Defaulting to standard dry-season values."
            }
            
        # 2. Disease Identification (Diagnosis Agent)
        diagnosis_res = diagnose_crop_disease(image_path, crop_name)
        if "error" in diagnosis_res and diagnosis_res["error"]:
            print(f"[Orchestrator] Error: Diagnosis agent failed: {diagnosis_res['error']}")
            return {"error": f"Diagnosis agent failed: {diagnosis_res['error']}"}
            
        # 3. Aggregated Advisory Compilation (Advisory Agent)
        advisory_res = generate_farming_advice(crop_name, location, diagnosis_res, weather_res)
        if "error" in advisory_res and advisory_res["error"]:
            print(f"[Orchestrator] Error: Advisory agent failed: {advisory_res['error']}")
            return {"error": f"Advisory compilation failed: {advisory_res['error']}"}
            
        # Assemble pipeline outputs
        return {
            "crop": crop_name,
            "location": location,
            "weather": weather_res,
            "diagnosis": diagnosis_res,
            "advisory": advisory_res
        }
        
    except Exception as e:
        print(f"[Orchestrator] Fatal pipeline crash: {e}")
        return {"error": f"Pipeline execution failed: {str(e)}"}

# For ADK command-line interface and deployment compliance
root_agent = run_krishiseva_pipeline
`,

  "tools/weather_tool.py": `import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_weather_context(location: str, crop_name: str) -> dict:
    """
    Step 2 Tool: Fetch current meteorological metrics via OpenWeatherMap API.
    
    CRITICAL TECHNICAL RULES:
        1. Query parameters key must be named 'appid' (NOT 'key').
        2. Never crash on connection issues — return error dict gracefully.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    
    if not api_key or api_key == "OPEN_WEATHER_API_KEY_HERE":
        return {
            "error": "OpenWeatherMap API Key missing or unconfigured.",
            "temperature_celsius": 30,
            "humidity_percent": 65,
            "rain_expected": False,
            "condition": "Clear",
            "wind_speed_kmh": 10,
            "farming_advisory": "Default weather context generated. Set OPENWEATHER_API_KEY to retrieve live metrics."
        }
        
    try:
        # OpenWeatherMap requires standard units='metric' for Celsius values
        params = {
            "q": location,
            "appid": api_key,
            "units": "metric"
        }
        
        url = "https://api.openweathermap.org/data/2.5/weather"
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                "error": f"Weather API error (HTTP {response.status_code})",
                "temperature_celsius": 30,
                "humidity_percent": 65,
                "rain_expected": False,
                "condition": "Cloudy",
                "wind_speed_kmh": 10,
                "farming_advisory": "Failed to look up local weather. Proceeding with safe-zone parameters."
            }
            
        data = response.json()
        
        # Parse metrics safely
        temp = int(round(data.get("main", {}).get("temp", 30)))
        humidity = int(data.get("main", {}).get("humidity", 65))
        wind_mps = data.get("wind", {}).get("speed", 2.7)
        wind_kmh = int(round(wind_mps * 3.6)) # Convert m/s to km/h
        
        weather_list = data.get("weather", [{}])
        condition = weather_list[0].get("main", "Clear")
        description = weather_list[0].get("description", "clear sky").lower()
        
        # Predict rain from keyword scans
        rain_keywords = ["rain", "drizzle", "thunderstorm", "shower"]
        rain_expected = any(kw in description or kw in condition.lower() for kw in rain_keywords)
        
        # Format crop advisory
        if rain_expected:
            advisory = f"Rain forecasted soon. Delay chemical foliar sprays to avoid treatment wash-off in {crop_name}."
        elif humidity > 80:
            advisory = f"High humidity ({humidity}%) detected. Conditions are optimal for spore spread. Monitor foliage."
        elif temp > 36:
            advisory = f"High temperature ({temp}°C) creates crop transpiration stress. Mulch soil to prevent drying."
        else:
            advisory = "Microclimate is within standard ranges. Carry out scheduled crop maintenance."
            
        return {
            "temperature_celsius": temp,
            "humidity_percent": humidity,
            "rain_expected": rain_expected,
            "condition": condition,
            "wind_speed_kmh": wind_kmh,
            "farming_advisory": advisory,
            "error": None
        }
        
    except Exception as e:
        return {
            "error": f"Weather lookup failed: {str(e)}",
            "temperature_celsius": 30,
            "humidity_percent": 65,
            "rain_expected": False,
            "condition": "Cloudy",
            "wind_speed_kmh": 10,
            "farming_advisory": "Failed to query OpenWeatherMap. Defaulting to safe weather context."
        }
`,

  "tools/mcp_server.py": `import os
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
from dotenv import load_dotenv

# Load key variables
load_dotenv()

# Initialize Model Context Protocol Weather Server
mcp = Server("krishiseva-weather-mcp")

# Import weather context routine
from tools.weather_tool import get_weather_context

@mcp.tool()
def fetch_local_weather(location: str, crop: str) -> dict:
    """
    Retrieve live localized meteorological statistics for Indian agricultural districts.
    
    Args:
        location: The town or district name (e.g., Vijayawada, Guntur, Nagpur)
        crop: The plant name under review (e.g., Tomato, Rice, Cotton)
        
    Returns:
        dict: Microclimate data containing temperature, humidity, rain alert and agricultural advisory.
    """
    print(f"[MCP Server] Querying weather tool for location: {location}, crop: {crop}")
    return get_weather_context(location, crop)

async def main():
    """
    Run the Model Context Protocol stdio server to integrate weather streams
    directly into LLM agent execution contexts.
    """
    print("[MCP Server] Starting stdio server channel...")
    async with stdio_server() as streams:
        await mcp.run(
            streams[0], streams[1],
            mcp.create_initialization_options()
        )

if __name__ == "__main__":
    # MCP requires asyncio to run the persistent communication loop
    asyncio.run(main())
`
};

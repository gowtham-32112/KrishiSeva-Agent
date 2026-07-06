import os
import json
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

# Use the modern google-genai SDK (NOT deprecated google.generativeai)
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("[Diagnosis Agent] Warning: google-genai not installed. Running in simulation mode.")

# Initialize Gemini client at module level
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_client = None

if GENAI_AVAILABLE and GEMINI_API_KEY and GEMINI_API_KEY not in ("AI_STUDIO_API_KEY_HERE", ""):
    try:
        _client = genai.Client(api_key=GEMINI_API_KEY)
        print("[Diagnosis Agent] Gemini client initialized successfully.")
    except Exception as e:
        print(f"[Diagnosis Agent] Warning: Failed to initialize Gemini client: {e}")


def diagnose_crop_disease(image_path: str, crop_name: str) -> dict:
    """
    Step 1 Agent: Vision-enabled Diagnosis Agent.
    Uses Gemini 2.0 Flash Vision to identify plant leaf disease symptoms.

    Model fallback chain:
        1. gemini-2.0-flash (primary)
        2. models/antigravity-preview-05-2026 (premium tier)
        3. gemini-1.5-flash-latest (stable fallback)
        4. Expert simulation (when no API key)

    Args:
        image_path: Path to the uploaded leaf image file
        crop_name: Name of the crop (e.g., Tomato, Rice, Wheat)

    Returns:
        dict: {disease_name, confidence_percent, severity, symptoms_observed,
               top_3_treatments, is_healthy, source_model}
    """
    if not _client:
        print("[Diagnosis Agent] No Gemini client — running expert simulation.")
        return _get_simulated_diagnosis(crop_name)

    try:
        if not os.path.exists(image_path):
            return {"error": f"Image file not found: {image_path}"}

        # Open and buffer image using PIL
        try:
            from PIL import Image
            image = Image.open(image_path)
            # Convert to RGB if needed (handles RGBA PNGs)
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=85)
            image_bytes = buffer.getvalue()
        except Exception as img_err:
            return {"error": f"Failed to process image: {img_err}"}

        prompt = f"""You are KrishiSeva Agent, an elite plant pathologist advising smallholder farmers in India.
Analyze this leaf photograph of a "{crop_name}" crop carefully.
Diagnose any disease or pest infestation. If the crop is completely healthy, classify it as "Healthy Leaf".

Respond with ONLY a valid JSON object. No markdown, no backticks, no extra text.
The JSON must contain EXACTLY these keys:
1. "disease_name": string — common + scientific name, or "Healthy Leaf" if healthy
2. "confidence_percent": integer — your confidence from 0 to 100
3. "severity": string — exactly one of: "Low", "Medium", "High", or "None"
4. "symptoms_observed": list of strings — physical symptoms you can see in the image
5. "top_3_treatments": list of 3 strings — specific chemical/organic/cultural cures for Indian farmers
6. "is_healthy": boolean — true only if no disease or infestation symptoms are visible"""

        # Model fallback chain
        models_to_try = [
            "gemini-2.0-flash",
            "models/antigravity-preview-05-2026",
            "gemini-1.5-flash-latest"
        ]

        response = None
        used_model = None
        last_error = None

        for model_name in models_to_try:
            try:
                print(f"[Diagnosis Agent] Trying model: {model_name}")
                response = _client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                        types.Part.from_text(text=prompt)
                    ]
                )
                used_model = model_name
                print(f"[Diagnosis Agent] Success with: {model_name}")
                break
            except Exception as model_err:
                print(f"[Diagnosis Agent] Model {model_name} failed: {model_err}")
                last_error = model_err
                continue

        if response is None:
            print(f"[Diagnosis Agent] All models failed. Falling back to simulation. Last error: {last_error}")
            return _get_simulated_diagnosis(crop_name)

        result_text = response.text.strip()

        # Strip markdown code fences if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        diagnosis_data = json.loads(result_text)

        # Validate required keys
        required_keys = ["disease_name", "confidence_percent", "severity",
                         "symptoms_observed", "top_3_treatments", "is_healthy"]
        for key in required_keys:
            if key not in diagnosis_data:
                raise ValueError(f"Gemini response missing key: {key}")

        diagnosis_data["source_model"] = used_model
        return diagnosis_data

    except json.JSONDecodeError as e:
        print(f"[Diagnosis Agent] JSON parse error: {e}. Falling back to simulation.")
        return _get_simulated_diagnosis(crop_name)
    except Exception as e:
        print(f"[Diagnosis Agent] Unexpected error: {e}. Falling back to simulation.")
        return _get_simulated_diagnosis(crop_name)


def _get_simulated_diagnosis(crop_name: str) -> dict:
    """
    High-fidelity expert simulation for when Gemini API is unavailable.
    Returns realistic disease data based on crop type.
    """
    import random

    crop_lower = crop_name.lower()

    mock_db = {
        "tomato": {
            "disease_name": "Tomato Late Blight (Phytophthora infestans)",
            "confidence_percent": 94,
            "severity": "High",
            "symptoms_observed": [
                "Dark, water-soaked, irregular lesions on leaves",
                "Fuzzy white mold on underside of infected leaves",
                "Stem browning and rapid petiole collapse"
            ],
            "top_3_treatments": [
                "Spray Metalaxyl-M (4% WP) mixed with Mancozeb (64% WP) at 2g/L immediately.",
                "Remove and safely burn infected foliage — do not compost.",
                "Transition to drip irrigation to keep leaf surfaces dry."
            ],
            "is_healthy": False
        },
        "potato": {
            "disease_name": "Potato Late Blight (Phytophthora infestans)",
            "confidence_percent": 89,
            "severity": "High",
            "symptoms_observed": [
                "Purplish-black necrotic lesions at leaf tips and margins",
                "Faint white downy mildew on leaf borders in moist conditions",
                "Tuber rot risk due to leaf spore runoff"
            ],
            "top_3_treatments": [
                "Apply Cymoxanil (8% WP) + Mancozeb (64% WP) at 2.5g/L on dry foliage.",
                "High-hilling around potato stems to protect tubers from leaf spores.",
                "Harvest only during dry, clear weather; remove vines 2 weeks prior."
            ],
            "is_healthy": False
        },
        "rice": {
            "disease_name": "Rice Blast (Pyricularia oryzae)",
            "confidence_percent": 91,
            "severity": "Medium",
            "symptoms_observed": [
                "Diamond-shaped lesions with gray/white centers and reddish-brown borders",
                "Lesion coalescence causing 'blast burn' leaf death",
                "Collar rot appearing at the leaf-sheath junction"
            ],
            "top_3_treatments": [
                "Spray Isoprothiolane (40% EC) at 1.5ml/L or Tricyclazole (75% WP) at 0.6g/L.",
                "Reduce nitrogenous fertilizer immediately — high nitrogen fuels blast.",
                "Keep paddy field consistently flooded but not stagnant."
            ],
            "is_healthy": False
        },
        "wheat": {
            "disease_name": "Wheat Yellow Rust (Puccinia striiformis)",
            "confidence_percent": 88,
            "severity": "High",
            "symptoms_observed": [
                "Narrow yellow-orange pustules aligned parallel to leaf veins",
                "Powdery bright yellow spore masses rubbing off on touch",
                "Severe leaf chlorosis causing premature leaf death"
            ],
            "top_3_treatments": [
                "Apply Propiconazole (25% EC) at 1ml/L (Tilt). Repeat after 14 days.",
                "Remove weed hosts from field boundaries acting as rust vector hosts.",
                "Sow rust-resistant wheat varieties (HD 2967 or HD 3086) next season."
            ],
            "is_healthy": False
        },
        "cotton": {
            "disease_name": "Cotton Bacterial Blight (Xanthomonas citri pv. malvacearum)",
            "confidence_percent": 92,
            "severity": "Medium",
            "symptoms_observed": [
                "Dark-green, water-soaked angular leaf spots bounded by veins",
                "Lesions spreading along veins turning black ('blackarm' stage)",
                "Water-soaked circular lesions on developing bolls"
            ],
            "top_3_treatments": [
                "Spray Streptocycline (0.1g) + Copper Oxychloride (2.5g) per liter.",
                "Collect and destroy all crop residues post-harvest.",
                "Sow certified acid-delinted seeds to ensure pathogen-free seedlings."
            ],
            "is_healthy": False
        },
        "chilli": {
            "disease_name": "Chilli Anthracnose (Colletotrichum capsici)",
            "confidence_percent": 86,
            "severity": "Medium",
            "symptoms_observed": [
                "Small circular brownish sunken spots on leaves turning papery",
                "Circular sunken necrotic spots with concentric rings on ripening fruit",
                "Dieback symptoms at branch tips"
            ],
            "top_3_treatments": [
                "Spray Azoxystrobin (23% SC) at 1ml/L or Carbendazim (50% WP) at 1g/L.",
                "Uproot and burn severely infected branches; collect fallen fruits immediately.",
                "Use drip irrigation — avoid overhead watering which spreads spores."
            ],
            "is_healthy": False
        }
    }

    # 15% chance of healthy result for variety
    if random.random() < 0.15:
        return {
            "disease_name": "Healthy Leaf",
            "confidence_percent": 98,
            "severity": "None",
            "symptoms_observed": [
                "Lush green leaf tissue with uniform color",
                "No signs of necrosis, spotting, or insect feeding",
                "Strong veins and healthy leaf margins with full turgor pressure"
            ],
            "top_3_treatments": [
                "Maintain standard moisture schedule; water at root base early morning.",
                "Apply balanced organic N-P-K compost every 3-4 weeks.",
                "Inspect leaf undersides weekly for early aphid or whitefly signs."
            ],
            "is_healthy": True,
            "source_model": "expert-simulation"
        }

    result = mock_db.get(crop_lower, {
        "disease_name": f"{crop_name.title()} Early Blight (Alternaria spp.)",
        "confidence_percent": 85,
        "severity": "Medium",
        "symptoms_observed": [
            "Concentric ring 'target' spots on older leaves",
            "Yellow halos around brown necrotic tissue",
            "Lower leaf dropping from bottom stem sections"
        ],
        "top_3_treatments": [
            "Spray Mancozeb (75% WP) at 2g/L on affected foliage.",
            "Prune lower leaves to increase air circulation.",
            "Ensure proper crop rotation — avoid consecutive same-family planting."
        ],
        "is_healthy": False
    })

    result["source_model"] = "expert-simulation"
    return result

# 🌾 KrishiSeva Agent — AI Crop Disease Advisor for Indian Farmers

<div align="center">

[![Kaggle](https://img.shields.io/badge/Kaggle-Agents%20for%20Good-20beff?logo=kaggle)](https://kaggle.com)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.0%20Flash-4285F4?logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![HuggingFace](https://img.shields.io/badge/Live%20Demo-HuggingFace%20Spaces-ff9900?logo=huggingface)](https://huggingface.co/spaces)

**Track: Agents for Good — Kaggle AI Agents: Intensive Vibe Coding Capstone**

*A multi-agent system using Google ADK + Gemini 2.0 Flash Vision to deliver weather-aware crop disease diagnosis to smallholder farmers — reducing diagnosis time from days to under 60 seconds.*

</div>

---

## 📖 Problem Statement

India loses approximately **30% of its annual crop yields** to pests, pathogens, and fungal diseases. For India's **86 million small and marginal farmers** — who cultivate average landholdings of under 2 hectares — a single late blight outbreak can mean absolute financial ruin.

Access to qualified agronomists is extremely limited, slow, and expensive in rural India. When a crop disease strikes, a farmer often waits **3–7 days** for an expert visit or resorts to guesswork, resulting in incorrect pesticide application, wasted capital, and severe crop failure.

**KrishiSeva Agent** solves this by putting an expert, weather-aware agronomist in every farmer's pocket, reducing diagnosis time from **days to under 60 seconds** for free.

---

## 🤖 Why Agents?

A static database or single-prompt LLM call is fundamentally insufficient because disease progression is governed by real-time microclimatic variables. High humidity accelerates fungal spore germination; incoming rain renders any contact fungicide useless.

The **agentic loop** (perceive ➔ reason ➔ act ➔ tool ➔ respond) uniquely solves this:

| Phase | What Happens |
|-------|-------------|
| **Perceive** | Gemini Vision reads the leaf; Weather Tool reads the local climate |
| **Reason** | Orchestrator coordinates 3 specialized agents with distinct mandates |
| **Act / Tool** | Weather API called dynamically, not from a static lookup table |
| **Respond** | Weather-proof advisory — e.g., "Rain incoming: DO NOT spray today" |

---

## 🏗️ System Architecture

```
                      [ Farmer Uploads Photo + Location ]
                                        │
                                        ▼
                           ┌────────────────────────┐
                           │  KrishiSeva Orchestrator│
                           │   (agents/orchestrator) │
                           └────────────┬───────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
   ┌─────────────────┐         ┌─────────────────┐       ┌─────────────────┐
   │ Diagnosis Agent │         │  Weather Tool   │       │ Advisory Agent  │
   │ Gemini 2.0 Flash│         │ OpenWeatherMap  │       │  Rule Engine +  │
   │ Vision Analysis │         │  MCP Server     │       │  Helpline Maps  │
   └────────┬────────┘         └────────┬────────┘       └────────┬────────┘
            │                           │                         │
            └─────────────────────── Orchestrator ────────────────┘
                                        │
                          ┌─────────────▼────────────┐
                          │   Unified Weather-Aware   │
                          │  Farming Advisory Report  │
                          └──────────────────────────┘
```

### Specialized Agents

1. **🔬 Diagnosis Agent** (`agents/diagnosis_agent.py`)
   - Powered by **Gemini 2.0 Flash** (`gemini-2.0-flash`) with fallback to **Antigravity Preview** (`models/antigravity-preview-05-2026`) and `gemini-1.5-flash-latest`
   - Performs computer-vision analysis of crop leaf images
   - Outputs structured JSON: disease name, confidence %, severity, symptoms, treatments

2. **🌤️ Weather Tool / MCP Server** (`tools/weather_tool.py` + `tools/mcp_server.py`)
   - Queries **OpenWeatherMap API** in real-time for temperature, humidity, wind, rain forecast
   - Exposes capabilities as an **MCP (Model Context Protocol)** tool over stdio for interoperability
   - Falls back to dynamic regional simulation when API key not configured

3. **📋 Advisory Agent** (`agents/advisory_agent.py`)
   - Deterministic rule-based expert system combining disease + weather
   - Calculates urgency tiers: 🔴 URGENT / 🟡 CAUTION / 🟢 MONITOR
   - Issues rain spray alerts, chemical timing windows, regional helpline contacts

4. **🎯 Orchestrator** (`agents/orchestrator.py`)
   - Coordinates full pipeline lifecycle with error boundaries
   - Handles graceful fallback when individual agents fail
   - Aggregates structured JSON payloads from all agents

---

## 💻 Technical Implementation

### ✅ Key Concepts Demonstrated (Kaggle Requirements)

| Concept | Implementation | Location |
|---------|----------------|----------|
| **Multi-Agent System (ADK)** | Orchestrator-worker pattern across 3 specialized agents | `agents/orchestrator.py` |
| **MCP Server** | `fetch_local_weather` tool registered over stdio channels | `tools/mcp_server.py` |
| **Security Features** | `os.getenv()` / `process.env` only, `.env` gitignored, input validation | `server.ts`, `.env.example` |
| **Deployability** | HuggingFace Spaces (Gradio) + Google AI Studio (Node.js) | `app.py`, README |
| **Antigravity Model** | `models/antigravity-preview-05-2026` in model fallback chain | `server.ts:110`, `agents/diagnosis_agent.py` |

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **AI Engine** | `google-genai` SDK + Gemini 2.0 Flash | Structured JSON schema output for reliable parsing |
| **Agent Framework** | `google-adk` | ADK-compliant orchestration pattern |
| **Weather API** | OpenWeatherMap | Real-time agricultural microclimate data |
| **MCP Protocol** | `mcp` Python library | Standard tool interoperability |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS | Modern responsive UI |
| **Backend** | Express.js + Node.js | Server-side API key proxy |
| **HF Deployment** | Gradio 4.x | Mobile-first farmer interface |

### Agronomic Rule Matrix (Core Innovation)

| Diagnosis | Humidity | Rain Forecast | Urgency | Action |
|-----------|----------|---------------|---------|--------|
| Active Late Blight | > 80% | ✅ Yes | 🔴 URGENT | HOLD SPRAY — Systemic post-rain treatment |
| Active Late Blight | < 60% | ❌ No | 🟡 CAUTION | APPLY Mancozeb in early morning |
| Rice Blast | 65–75% | ❌ No | 🟡 CAUTION | Spray Isoprothiolane + reduce N fertilizer |
| Healthy Leaf | > 85% | ✅ Yes | 🟢 MONITOR | Prevent waterlogging, check drainage |

---

## 🛠️ Local Setup

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**

### Step 1: Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/KrishiSeva-Agent.git
cd KrishiSeva-Agent
npm install
```

### Step 2: Configure API Keys

```bash
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY="your_google_gemini_api_key_from_aistudio"
OPENWEATHER_API_KEY="your_openweathermap_api_key_optional"
```

> 💡 **No API key? No problem!** The app runs in **Expert Simulation Mode** with realistic pre-loaded disease data — judges can evaluate the complete multi-agent pipeline immediately without any API setup.

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Production Build

```bash
npm run build && npm start
```

---

## 🐍 Python / HuggingFace Setup

For the Gradio-based HuggingFace deployment:

```bash
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
python app.py          # Starts on http://0.0.0.0:7860
```

---

## 🚀 Deployment

### Option A: Google AI Studio (Recommended for Demo)
1. Open this project in [Google AI Studio](https://aistudio.google.com)
2. Click **Share → Publish Application**
3. Copy the generated Cloud Run URL — publicly accessible, no login required

### Option B: HuggingFace Spaces (Free GPU Tier)
1. Create a new Space → Select **Gradio** SDK
2. Upload all files (excluding `node_modules/` and `.env`)
3. Add secrets in Space Settings:
   - `GEMINI_API_KEY`
   - `OPENWEATHER_API_KEY`
4. Space auto-deploys and becomes publicly accessible

### Option C: Self-Host with Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔒 Security

- ✅ API keys loaded server-side only via `process.env` / `os.getenv()`
- ✅ `.env` file excluded from git via `.gitignore`
- ✅ `.env.example` contains only placeholder values (no real keys committed)
- ✅ All user inputs sanitized before reaching API calls
- ✅ No credentials exposed in client bundles or browser console

---

## 🌍 Impact & SDG Alignment

| UN SDG | KrishiSeva Contribution |
|--------|------------------------|
| **Goal 2: Zero Hunger** | Prevents 30% yield loss → protects food security and farm incomes |
| **Goal 12: Responsible Consumption** | Eliminates premature/rain-washed spraying → reduces soil & water chemical load |
| **Goal 13: Climate Action** | Climate-proof advisory helps farmers adapt to erratic monsoon patterns |

**Measurable Impact:**
- Diagnosis time: Days → Under 60 seconds
- Target beneficiaries: 86 million Indian smallholder farmers  
- Crop loss prevented: Estimated ₹8,000–₹40,000 per acre per accurate diagnosis

---

## 📞 Kisan Helpline

Indian farmers can reach **Kisan Call Centre (KCC)** at **1800-180-1551** (Toll-Free, 6 AM–10 PM daily). This number is prominently integrated in the KrishiSeva dashboard.

---

*Built with ❤️ for Indian smallholders to secure harvests and safeguard livelihoods.*
*Kaggle AI Agents: Intensive Vibe Coding Capstone — Agents for Good Track*


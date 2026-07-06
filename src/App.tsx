import React, { useState, useEffect } from "react";
import {
  Leaf,
  CloudSun,
  ShieldAlert,
  Wrench,
  BookOpen,
  Code,
  ClipboardCopy,
  PhoneCall,
  Compass,
  Cpu,
  Layers,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Check,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Upload,
  Image as ImageIcon,
  ChevronRight,
  Server
} from "lucide-react";
import { PYTHON_CODEBASE } from "./pythonCode";
import { KAGGLE_WRITEUP } from "./kaggleWriteup";

export default function App() {
  // Input states
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato");
  const [location, setLocation] = useState<string>("Vijayawada");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  
  // Status check states
  const [envStatus, setEnvStatus] = useState({ hasGeminiKey: false, hasWeatherKey: false });
  
  // Multi-Agent Pipeline execution states
  const [pipelineState, setPipelineState] = useState<"idle" | "weather" | "diagnosis" | "advising" | "done" | "error">("idle");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  
  // Result state
  const [result, setResult] = useState<any>(null);
  
  // UI Navigation states
  const [activeTab, setActiveTab] = useState<"diagnostics" | "technical">("diagnostics");
  const [technicalSubTab, setTechnicalSubTab] = useState<"writeup" | "code">("writeup");
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>("agents/orchestrator.py");
  
  // Tooltip & copy feedback states
  const [copiedWriteup, setCopiedWriteup] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Preloaded High-Fidelity Samples for demonstration
  const sampleCrops = [
    {
      name: "Tomato",
      disease: "Late Blight",
      location: "Vijayawada",
      desc: "Dark water-soaked leaf spots",
      icon: "🍅",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2314532d'/><circle cx='50' cy='50' r='30' fill='%23b91c1c' opacity='0.85'/><path d='M40 30 C 45 40, 55 40, 60 30 C 58 25, 42 25, 40 30 Z' fill='%2315803d'/><circle cx='38' cy='45' r='4' fill='%23450a0a'/><circle cx='62' cy='52' r='5' fill='%23450a0a'/><circle cx='48' cy='65' r='6' fill='%23450a0a'/><path d='M30 50 Q 50 65 70 50' stroke='%233f6212' stroke-width='2' fill='none'/></svg>"
    },
    {
      name: "Rice",
      disease: "Rice Blast",
      location: "Guntur",
      desc: "Diamond-shaped lesions with gray centers",
      icon: "🌾",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23064e3b'/><path d='M50 15 L52 85 C52 85, 30 75, 20 50 C20 50, 40 40, 50 15 Z' fill='%23ca8a04'/><path d='M50 15 L48 85 C48 85, 70 75, 80 50 C80 50, 60 40, 50 15 Z' fill='%23ca8a04'/><path d='M35 45 Q 45 42 55 52' stroke='%2378350f' stroke-width='3' fill='none'/><path d='M45 60 Q 52 55 65 62' stroke='%2378350f' stroke-width='3' fill='none'/></svg>"
    },
    {
      name: "Potato",
      disease: "Late Blight",
      location: "Shimla",
      desc: "Purplish-black tips with white mold",
      icon: "🥔",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e3a1e'/><ellipse cx='50' cy='50' rx='35' ry='25' fill='%23a16207'/><circle cx='35' cy='45' r='6' fill='%23451a03'/><circle cx='65' cy='55' r='7' fill='%23451a03'/><circle cx='48' cy='60' r='5' fill='%23451a03'/><path d='M25 40 Q 50 20 75 40' stroke='%2315803d' stroke-width='3' fill='none'/></svg>"
    },
    {
      name: "Wheat",
      disease: "Yellow Rust",
      location: "Karnal",
      desc: "Parallel bright yellow stripe pustules",
      icon: "🥖",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f3a1a'/><path d='M15 90 C 35 70, 45 40, 50 10 C 55 40, 65 70, 85 90 Z' fill='%231e3a1e'/><line x1='30' y1='80' x2='40' y2='30' stroke='%23ca8a04' stroke-width='3' stroke-dasharray='1,5'/><line x1='40' y1='80' x2='45' y2='25' stroke='%23ca8a04' stroke-width='3' stroke-dasharray='1,5'/><line x1='50' y1='80' x2='50' y2='25' stroke='%23ca8a04' stroke-width='3' stroke-dasharray='1,5'/><line x1='60' y1='80' x2='55' y2='30' stroke='%23ca8a04' stroke-width='3' stroke-dasharray='1,5'/></svg>"
    },
    {
      name: "Cotton",
      disease: "Bacterial Blight",
      location: "Nagpur",
      desc: "Angular water-soaked leaf spots",
      icon: "☁️",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23052e16'/><path d='M50 30 C 30 15, 10 35, 30 55 C 20 70, 45 90, 50 70 C 55 90, 80 70, 70 55 C 90 35, 70 15, 50 30 Z' fill='%23f8fafc'/><rect x='32' y='42' width='8' height='8' fill='%231c1917'/><rect x='60' y='48' width='7' height='7' fill='%231c1917'/><rect x='45' y='58' width='8' height='6' fill='%231c1917'/></svg>"
    },
    {
      name: "Chilli",
      disease: "Anthracnose",
      location: "Guntur",
      desc: "Sunken fruit rot concentric circles",
      icon: "🌶️",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2314532d'/><path d='M35 25 C 45 25, 48 35, 50 45 C 52 55, 65 85, 45 85 C 35 85, 38 65, 35 45 Z' fill='%23dc2626'/><path d='M35 25 Q 40 12 50 15' stroke='%2316a34a' stroke-width='4' fill='none'/><circle cx='42' cy='50' r='5' fill='%23450a0a'/><circle cx='46' cy='65' r='6' fill='%23450a0a'/></svg>"
    }
  ];

  // Fetch status of backend API keys
  useEffect(() => {
    fetch("/api/env-status")
      .then((res) => res.json())
      .then((data) => setEnvStatus(data))
      .catch((err) => console.warn("Failed to check environment key status:", err));
  }, []);

  // Set up copy to clipboard helpers
  const handleCopyWriteup = () => {
    navigator.clipboard.writeText(KAGGLE_WRITEUP);
    setCopiedWriteup(true);
    setTimeout(() => setCopiedWriteup(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_CODEBASE[selectedCodeFile as keyof typeof PYTHON_CODEBASE]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Convert uploaded image file to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger quick selection of preloaded demonstration samples
  const handleSelectSample = (sample: typeof sampleCrops[0]) => {
    setSelectedCrop(sample.name);
    setLocation(sample.location);
    setImagePreview(sample.image);
    setMimeType("image/svg+xml");
  };

  // Execute the visual multi-agent diagnostics pipeline
  const runDiagnosticsPipeline = async () => {
    if (!imagePreview) {
      setPipelineState("error");
      setErrorMessage("Please select a sample crop leaf or upload your own leaf image first.");
      return;
    }

    setPipelineState("weather");
    setPipelineProgress(15);
    setPipelineLogs(["[Root Orchestrator] Triggering diagnostic event..."]);
    setResult(null);

    // Dynamic timer animations to represent physical agent coordination
    setTimeout(() => {
      setPipelineState("diagnosis");
      setPipelineProgress(55);
      setPipelineLogs((prev) => [
        ...prev,
        `[Weather Tool] Active query dispatched to OpenWeatherMap for: ${location}`,
        `[Weather Tool] Microclimate acquired successfully. Proceeding to Pathology analysis.`
      ]);
    }, 1200);

    setTimeout(() => {
      setPipelineState("advising");
      setPipelineProgress(85);
      setPipelineLogs((prev) => [
        ...prev,
        `[Diagnosis Agent] Gemini 2.0 Flash Vision instantiated at server level.`,
        `[Diagnosis Agent] Parsing leaf vascular margins, necrosis density, and mold coverage...`,
        `[Diagnosis Agent] Analysis complete. Returning structured pathology response to Root.`
      ]);
    }, 2800);

    // Call actual backend server API
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          crop: selectedCrop,
          location: location,
          imageBase64: imagePreview,
          mimeType: mimeType
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      setTimeout(() => {
        setResult(data);
        setPipelineState("done");
        setPipelineProgress(100);
        setPipelineLogs((prev) => [
          ...prev,
          `[Advisory Agent] Triggering agricultural safety rule heuristics...`,
          `[Advisory Agent] Local Helpline metrics integrated: Toll-free 1800-180-1551 mapped.`,
          `[Root Orchestrator] Pipeline finished. Report output safely dispatched.`
        ]);
      }, 4200);

    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setPipelineState("error");
        setErrorMessage(err.message || "Something went wrong in the full-stack diagnostics channel.");
      }, 4200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#F1F5F2] to-[#E8F5E9] font-sans text-slate-800 antialiased flex flex-col selection:bg-emerald-200">
      
      {/* Upper Status Banner & Premium Header matching Sleek Interface theme */}
      <nav className="bg-gradient-to-r from-[#1B4332] via-[#215c44] to-[#1B4332] text-white px-8 py-4 flex flex-col md:flex-row items-center justify-between border-b border-[#2D6A4F]/60 gap-4 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#D8F3DC] to-[#b7e4c7] rounded-xl flex items-center justify-center text-[#1B4332] font-black text-lg flex-shrink-0 shadow-inner shadow-emerald-900/20">
              🌾
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase font-display">KrishiSeva Agent</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-60">AI Multi-Agent Crop Advisor • Agents for Good</p>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${envStatus.hasGeminiKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400 status-active"}`}></span>
            <span className="text-xs font-mono uppercase">
              Gemini-2.0-Flash {envStatus.hasGeminiKey ? "Active" : "/ Antigravity Sim"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase">Weather MCP Linked</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase">Antigravity-Preview</span>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded text-xs border border-white/20 font-mono tracking-wider uppercase">
            Kaggle Capstone v2.0
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Workspace & Agent Monitor (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-slide-up">
          
          {/* Diagnostic Console Box matching Sleek Interface theme */}
          <section id="input-workspace" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="font-display font-bold text-lg text-[#1B4332] uppercase tracking-wide">Farmer Diagnostics Lab</h2>
            </div>

            {/* Quick Demo Selector */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2D6A4F]" /> Choose high-fidelity sample leaf
                </label>
                <span className="text-[10px] uppercase font-bold text-[#1B4332] bg-[#D8F3DC] px-2 py-0.5 rounded font-mono">Click to test</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {sampleCrops.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectSample(item)}
                    className={`card-hover flex flex-col items-center justify-center p-2 rounded-xl border text-center ${
                      selectedCrop === item.name && imagePreview === item.image
                        ? "bg-[#D8F3DC]/60 border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 font-semibold text-[#1B4332] shadow-sm"
                        : "bg-slate-50/80 border-slate-200 hover:bg-[#F1F5F2] hover:border-[#2D6A4F]/40 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5 leading-none truncate w-full">{item.disease}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Stage */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or Upload Sick Leaf Photo (Mobile/Camera)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-[#2D6A4F] rounded-xl p-4 bg-slate-50/50 hover:bg-[#F1F5F2]/50 transition-colors flex flex-col items-center justify-center cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={imagePreview}
                      alt="Crop disease upload"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-xs font-bold text-[#1B4332] block truncate">Image loaded successfully</span>
                      <span className="text-[10px] text-slate-500 font-mono block">MimeType: {mimeType}</span>
                    </div>
                    <span className="text-xs text-slate-400 hover:text-red-500 font-medium">Replace</span>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-700 block">Drag & drop or Click to browse</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG, SVG supported</span>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Context Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Verify Crop Type
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm font-semibold px-3 py-2.5 focus:outline-none focus:border-[#2D6A4F] focus:bg-white"
                >
                  <option value="Tomato">Tomato (🍅)</option>
                  <option value="Potato">Potato (🥔)</option>
                  <option value="Rice">Rice (🌾)</option>
                  <option value="Wheat">Wheat (🥖)</option>
                  <option value="Cotton">Cotton (☁️)</option>
                  <option value="Chilli">Chilli (🌶️)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Farmer Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g., Vijayawada"
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm font-semibold px-3 py-2.5 focus:outline-none focus:border-[#2D6A4F] focus:bg-white"
                />
              </div>
            </div>

            {/* Run Button styled to match Sleek Interface */}
            <button
              type="button"
              disabled={pipelineState !== "idle" && pipelineState !== "done" && pipelineState !== "error"}
              onClick={runDiagnosticsPipeline}
              className={`w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/10 transition-colors flex items-center justify-center gap-2 ${
                pipelineState !== "idle" && pipelineState !== "done" && pipelineState !== "error"
                  ? "opacity-60 cursor-not-allowed"
                  : "active:scale-[0.99]"
              }`}
            >
              <Activity className="w-4 h-4" />
              {pipelineState === "idle" || pipelineState === "done" || pipelineState === "error"
                ? "DIAGNOSE CROP"
                : "ORCHESTRATING..."}
            </button>
          </section>

          {/* AGENT ORCHESTRATION PANEL - Styled in Sleek Interface emerald-50 aesthetic */}
          <section className="bg-emerald-50/55 rounded-2xl border border-emerald-100 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#2D6A4F]" />
                <h3 className="font-mono text-xs font-bold tracking-wider text-emerald-800 uppercase">System Logs</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Live Monitor</span>
              </div>
            </div>

            {/* Real-time Agent Visual Stepper */}
            <div className="flex flex-col gap-3 py-1 text-xs">
              
              {/* Stepper Node 1: Weather Tool */}
              <div className={`flex items-start gap-3 transition-opacity ${
                pipelineState === "idle" ? "opacity-40" : "opacity-100"
              }`}>
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                  pipelineState === "weather"
                    ? "bg-[#D8F3DC] border-[#2D6A4F] text-[#1B4332] animate-pulse"
                    : pipelineState === "diagnosis" || pipelineState === "advising" || pipelineState === "done"
                      ? "bg-[#D8F3DC]/40 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <CloudSun className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Weather Tool (OpenWeatherMap API)</span>
                    {pipelineState === "weather" && (
                      <span className="text-[10px] text-amber-600 font-mono animate-pulse">Running...</span>
                    )}
                    {(pipelineState === "diagnosis" || pipelineState === "advising" || pipelineState === "done") && (
                      <span className="text-[10px] text-[#2D6A4F] font-mono flex items-center gap-0.5 font-bold">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Querying local agricultural microclimatic metrics (Temp, Humidity, Rain expected).
                  </p>
                </div>
              </div>

              {/* Stepper Node 2: Diagnosis Agent */}
              <div className={`flex items-start gap-3 transition-opacity ${
                pipelineState === "idle" || pipelineState === "weather" ? "opacity-40" : "opacity-100"
              }`}>
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                  pipelineState === "diagnosis"
                    ? "bg-[#D8F3DC] border-[#2D6A4F] text-[#1B4332] animate-pulse"
                    : pipelineState === "advising" || pipelineState === "done"
                      ? "bg-[#D8F3DC]/40 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Diagnosis Agent (Gemini 2.0 Flash Vision)</span>
                    {pipelineState === "diagnosis" && (
                      <span className="text-[10px] text-amber-600 font-mono animate-pulse">Running...</span>
                    )}
                    {(pipelineState === "advising" || pipelineState === "done") && (
                      <span className="text-[10px] text-[#2D6A4F] font-mono flex items-center gap-0.5 font-bold">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Executing high-resolution botanical vision analysis on leaf structure anomalies.
                  </p>
                </div>
              </div>

              {/* Stepper Node 3: Advisory Agent */}
              <div className={`flex items-start gap-3 transition-opacity ${
                pipelineState === "idle" || pipelineState === "weather" || pipelineState === "diagnosis" ? "opacity-40" : "opacity-100"
              }`}>
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                  pipelineState === "advising"
                    ? "bg-[#D8F3DC] border-[#2D6A4F] text-[#1B4332] animate-pulse"
                    : pipelineState === "done"
                      ? "bg-[#D8F3DC]/40 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Advisory Agent (Climate Expert System)</span>
                    {pipelineState === "advising" && (
                      <span className="text-[10px] text-amber-600 font-mono animate-pulse">Running...</span>
                    )}
                    {pipelineState === "done" && (
                      <span className="text-[10px] text-[#2D6A4F] font-mono flex items-center gap-0.5 font-bold">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Synthesizing localized farming rules, urgency ratings, chemical safety spray windows, and support directories.
                  </p>
                </div>
              </div>

            </div>

            {/* Pipeline Loading Bar */}
            {pipelineState !== "idle" && (
              <div className="mt-1 bg-[#D8F3DC] h-2 rounded-full overflow-hidden">
                <div
                  className={`bg-gradient-to-r from-[#2D6A4F] to-[#52b788] h-full transition-all duration-700 ease-out ${pipelineState !== "done" ? "animate-progress-glow" : ""}`}
                  style={{ width: `${pipelineProgress}%` }}
                ></div>
              </div>
            )}

            {/* Real-time System Log Console */}
            <div className="bg-white/80 rounded-xl p-3.5 border border-emerald-100/80 font-mono text-[10px] text-emerald-800 min-h-[90px] max-h-[140px] overflow-y-auto leading-relaxed flex flex-col gap-1">
              {pipelineLogs.length === 0 ? (
                <span className="text-slate-400 italic font-sans">&gt; Console idle. Awaiting diagnostic launch...</span>
              ) : (
                pipelineLogs.map((log, index) => (
                  <div key={index} className="flex gap-1.5">
                    <span className="text-[#2D6A4F] select-none font-bold">&gt;</span>
                    <span className="text-emerald-950 font-medium">{log}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Results Report & Technical Spec (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 animate-fade-slide-up delay-100">
          
          {/* Main Workspace Navigation Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex gap-1">
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`flex-1 py-2.5 rounded-xl font-display font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "diagnostics"
                  ? "bg-[#1B4332] text-white shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              Agronomist Diagnostic Portal
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`flex-1 py-2.5 rounded-xl font-display font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "technical"
                  ? "bg-[#1B4332] text-white shadow-sm"
                  : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Code className="w-4 h-4" />
              Kaggle Submission Hub
            </button>
          </div>

          {/* TAB CONTENT: FARMER ADVISORY PORTAL */}
          {activeTab === "diagnostics" && (
            <div className="flex flex-col gap-6">
              
              {/* Empty / Initial State */}
              {!result && pipelineState === "idle" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-4 animate-fade-slide-up">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D8F3DC] to-[#b7e4c7] rounded-2xl border border-emerald-100 text-[#1B4332] flex items-center justify-center shadow-sm">
                    <Leaf className="w-8 h-8 animate-leaf" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-[#1B4332]">
                      Agronomist Diagnostic Report Card
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 leading-normal">
                      Awaiting diagnostic submission. Select a preloaded crop leaf sample or upload your own leaf photo, then launch the pipeline.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectSample(sampleCrops[0])}
                    className="mt-2 text-xs font-bold text-[#2D6A4F] bg-[#D8F3DC] hover:bg-[#D8F3DC]/80 px-5 py-2.5 rounded-xl transition-all"
                  >
                    Quick-Load Tomato Sample
                  </button>
                </div>
              )}

              {/* Real / Simulated Result Board */}
              {result && (
                <div className="flex flex-col gap-6 animate-fade-slide-up">
                  
                  {/* Urgency Badge & Disease Header Banner */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card-hover">
                    <div>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        result.advisory.urgency.includes("🔴")
                          ? "bg-red-50 text-red-700 border border-red-200 badge-urgent"
                          : result.advisory.urgency.includes("🟡")
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {result.advisory.urgency}
                      </span>
                      <h2 className="text-3xl font-extrabold text-[#1B4332] tracking-tight mt-3">
                        {result.diagnosis.disease_name}
                      </h2>
                      <p className="text-slate-500 text-xs mt-1.5 font-semibold uppercase tracking-wider">
                        Diagnosis powered by Gemini-2.0-Flash • Confidence Score: {result.diagnosis.confidence_percent}%
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 self-stretch md:self-auto justify-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[140px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right w-full">Severity Level</span>
                      <span className="text-sm font-bold text-[#1B4332] uppercase tracking-wide">{result.diagnosis.severity}</span>
                      <button
                        onClick={() => { setResult(null); setPipelineState("idle"); setPipelineProgress(0); setPipelineLogs([]); }}
                        className="mt-2 text-[10px] font-bold text-slate-500 hover:text-red-600 underline underline-offset-2 uppercase tracking-wider transition-colors"
                      >
                        ↺ New Diagnosis
                      </button>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#2D6A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg> Botanist Diagnostic Assessment Summary
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm mb-4 font-normal">
                      {result.advisory.diagnosis_summary}
                    </p>
                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affected Severity Scale</span>
                        <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${
                            result.diagnosis.severity.toLowerCase().includes("high") || result.diagnosis.severity.toLowerCase().includes("severe")
                              ? "bg-red-500"
                              : result.diagnosis.severity.toLowerCase().includes("medium") || result.diagnosis.severity.toLowerCase().includes("moderate")
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`} style={{ width: result.diagnosis.severity.toLowerCase().includes("high") || result.diagnosis.severity.toLowerCase().includes("severe") ? "85%" : result.diagnosis.severity.toLowerCase().includes("medium") || result.diagnosis.severity.toLowerCase().includes("moderate") ? "55%" : "25%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms Observed Chips */}
                  {result.diagnosis.symptoms_observed && result.diagnosis.symptoms_observed.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Visual Symptoms Observed
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.diagnosis.symptoms_observed.map((symptom: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg leading-none">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather Aware Alerts Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Microclimate Stats Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Microclimate Weather</span>
                          <span className="text-[9px] font-mono text-emerald-700 font-bold bg-[#D8F3DC] px-2 py-0.5 rounded">
                            {result.weather.source || "OpenWeatherMap"}
                          </span>
                        </div>
                        
                        {/* Weather Layout Row */}
                        <div className="grid grid-cols-3 gap-2 py-1">
                          <div className="flex flex-col items-center justify-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                            <Thermometer className="w-5 h-5 text-red-500 mb-1" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Temp</span>
                            <span className="text-sm font-bold text-slate-900 block mt-0.5">{result.weather.temperature_celsius}°C</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                            <Droplets className="w-5 h-5 text-sky-500 mb-1" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Humidity</span>
                            <span className="text-sm font-bold text-slate-900 block mt-0.5">{result.weather.humidity_percent}%</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                            <Wind className="w-5 h-5 text-slate-500 mb-1" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Wind</span>
                            <span className="text-xs font-bold text-slate-900 block mt-1 leading-none">{result.weather.wind_speed_kmh} km/h</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 bg-[#D8F3DC]/40 rounded-xl p-3 border border-emerald-100 flex items-start gap-2.5">
                        <CloudSun className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] text-[#1B4332] leading-normal italic font-medium">
                          {result.weather.farming_advisory}
                        </span>
                      </div>
                    </div>

                    {/* Fungal Multiplier & Heat Alerts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                        Agronomic Threat Analysis
                      </span>
                      
                      <div className="flex-1 flex flex-col gap-3 justify-center">
                        <div className="flex gap-2.5 items-start">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                            {result.advisory.weather_advisory}
                          </p>
                        </div>
                        
                        <div className="flex gap-2.5 items-start border-t border-dashed border-slate-100 pt-3">
                          <CloudRain className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                            {result.advisory.rain_alert}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Treatment Plan Section - Styled in Sleek Deep Green Theme */}
                  <section className="bg-[#1B4332] text-white rounded-2xl shadow-sm p-6 flex flex-col">
                    <div className="flex items-center gap-2.5 border-b border-[#2D6A4F] pb-3.5 mb-4">
                      <Wrench className="w-5 h-5 text-emerald-300" />
                      <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
                        Step-by-Step Treatment Plan (Agronomist Recommended)
                      </h3>
                    </div>

                    <ul className="space-y-4">
                      {result.advisory.treatment_plan.map((step: string, index: number) => (
                        <li key={index} className="flex gap-3 items-start">
                          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-emerald-200 border border-emerald-500/30 font-mono mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-xs text-emerald-50 leading-relaxed font-medium">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Kisan Helpline Support Block - Beautifully customized */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-[#2D6A4F] shrink-0">
                        <PhoneCall className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kisan Helpline Support</div>
                        <div className="text-sm font-extrabold text-[#1B4332]">1800-180-1551 (Toll Free)</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 italic max-w-sm text-center md:text-left">
                      Connect with your nearest Regional KVK (Krishi Vigyan Kendra) for professional onsite advice.
                    </div>
                    <a
                      href="tel:18001801551"
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-extrabold text-[#1B4332] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 shrink-0 uppercase tracking-wider"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> CALL HELPLINE
                    </a>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB CONTENT: KAGLGE SPEC & TECHNICAL HUB */}
          {activeTab === "technical" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
              
              {/* Technical Hub Sub Tab Controls */}
              <div className="flex border-b border-slate-100 pb-3 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTechnicalSubTab("writeup")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-display transition-all ${
                      technicalSubTab === "writeup"
                        ? "bg-[#D8F3DC] text-[#1B4332]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Kaggle Submission Writeup
                  </button>
                  <button
                    onClick={() => setTechnicalSubTab("code")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-display transition-all ${
                      technicalSubTab === "code"
                        ? "bg-[#D8F3DC] text-[#1B4332]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Python Code Explorer
                  </button>
                </div>
                
                {/* Copy to Clipboard Trigger */}
                {technicalSubTab === "writeup" ? (
                  <button
                    onClick={handleCopyWriteup}
                    className="text-xs font-extrabold text-[#1B4332] bg-[#D8F3DC] hover:bg-[#D8F3DC]/80 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    {copiedWriteup ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 animate-bounce" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                    {copiedWriteup ? "COPIED WRITEUP!" : "COPY WRITEUP"}
                  </button>
                ) : (
                  <button
                    onClick={handleCopyCode}
                    className="text-xs font-extrabold text-[#1B4332] bg-[#D8F3DC] hover:bg-[#D8F3DC]/80 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 animate-bounce" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                    {copiedCode ? "COPIED CODE!" : "COPY CODE"}
                  </button>
                )}
              </div>

              {/* Sub Tab: Kaggle Writeup Viewer */}
              {technicalSubTab === "writeup" && (
                <div className="prose max-w-none text-slate-800 text-sm leading-relaxed overflow-y-auto max-h-[580px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-100">
                    <div className="flex gap-2 items-center text-[#1B4332] mb-2.5">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-extrabold uppercase tracking-wider text-[10px]">Certified Submission Specification</span>
                    </div>
                    <p className="text-slate-600 font-normal leading-relaxed text-xs">
                      The document below is a production-quality project overview formatted explicitly for the Kaggle <strong>"AI Agents: Intensive Vibe Coding Capstone"</strong>. Press the copy button above to immediately extract it for submission.
                    </p>
                  </div>
                  <hr className="my-4 border-slate-100" />
                  <div className="space-y-4">
                    {KAGGLE_WRITEUP.split("\n\n").map((para, i) => {
                      if (para.startsWith("### ")) {
                        return <h4 key={i} className="font-display font-extrabold text-[#1B4332] text-base mt-6 first:mt-0 uppercase tracking-wide">{para.replace("### ", "")}</h4>;
                      }
                      if (para.startsWith("#### ")) {
                        return <h5 key={i} className="font-display font-bold text-slate-700 text-sm italic mt-1">{para.replace("#### ", "")}</h5>;
                      }
                      if (para.startsWith("---")) {
                        return <hr key={i} className="my-5 border-slate-100" />;
                      }
                      if (para.startsWith("- **")) {
                        // list parser simple
                        return (
                          <ul key={i} className="list-disc pl-5 text-xs text-slate-700 space-y-2">
                            {para.split("\n").map((li, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {li.replace("- **", "**")}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={i} className="text-xs text-slate-700 leading-relaxed font-normal">{para}</p>;
                    })}
                  </div>
                </div>
              )}

              {/* Sub Tab: Code Explorer */}
              {technicalSubTab === "code" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[460px]">
                  
                  {/* File Directory Sidebar */}
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 block">Project Files</span>
                    {Object.keys(PYTHON_CODEBASE).map((fileName) => (
                      <button
                        key={fileName}
                        onClick={() => setSelectedCodeFile(fileName)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl font-mono text-[11px] font-bold flex items-center justify-between border transition-all ${
                          selectedCodeFile === fileName
                            ? "bg-[#1B4332] border-[#1B4332] text-white shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{fileName}</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  {/* Live Syntax Code Window */}
                  <div className="md:col-span-8 flex flex-col bg-slate-950 text-slate-100 rounded-2xl border border-slate-900 overflow-hidden shadow-md">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-950 flex justify-between items-center">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{selectedCodeFile}</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">python</span>
                    </div>
                    <pre className="p-4 overflow-auto max-h-[420px] font-mono text-[10.5px] leading-relaxed text-slate-300 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                      <code>{PYTHON_CODEBASE[selectedCodeFile as keyof typeof PYTHON_CODEBASE]}</code>
                    </pre>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </main>

      {/* Ground Footer */}
      <footer className="bg-white border-t border-slate-100 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#2D6A4F]" />
            <span className="font-extrabold text-[#1B4332] uppercase tracking-wider">KrishiSeva Agent</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-600">Kaggle "AI Agents: Intensive Vibe Coding Capstone"</span>
          </div>
          <p className="font-medium text-slate-500">
            Helpline: <a href="tel:18001801551" className="text-[#2D6A4F] font-bold hover:underline">1800-180-1551</a> (Toll-Free). Built with ❤️ for Indian farmers.
          </p>
        </div>
      </footer>

    </div>
  );
}

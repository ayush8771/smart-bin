import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import * as tmImage from '@teachablemachine/image';
import Webcam from 'react-webcam';
import axios from 'axios';
import API_BASE_URL from './api';
import { useNavigate } from 'react-router-dom';
import { Loader2, ScanQrCode, Camera, CheckCircle2 } from 'lucide-react';

const WASTE_CONFIG = {
  "Plastic":         { label: "Plastic",           emoji: "🧴", hex: "#F59E0B", incentive: 25, bin: "Orange Bin" },
  "Metal":           { label: "Metal",             emoji: "🔩", hex: "#94A3B8", incentive: 30, bin: "Grey Bin"   },
  "Paper_Cardboard": { label: "Paper / Cardboard", emoji: "📦", hex: "#92400E", incentive: 10, bin: "Brown Bin"  },
  "organic":         { label: "Organic",           emoji: "🌿", hex: "#16A34A", incentive: 5,  bin: "Green Bin"  },
  "Glass":           { label: "Glass",             emoji: "🫙", hex: "#0891B2", incentive: 15, bin: "Blue Bin"   },
  "Other_trash":     { label: "Other Trash",       emoji: "🗑️", hex: "#DC2626", incentive: 8,  bin: "Red Bin"    },
};

export default function Scanner() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("Waiting for waste...");
  const [detectedWaste, setDetectedWaste] = useState(null); // holds WASTE_CONFIG entry
  const [borderColor, setBorderColor] = useState("border-gray-500");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrError, setQrError] = useState(null);

  const webcamRef = useRef(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const [currentLocation, setCurrentLocation] = useState("Smart Bin (General)");

  useEffect(() => {
    const savedLocation = localStorage.getItem('current_bin_location');
    if (savedLocation) setCurrentLocation(savedLocation);
  }, []);

  const videoConstraints = { facingMode: { ideal: "environment" } };
  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/SbH77oNkD/";

  // --- STEP 1: QR SCANNER ---
  useEffect(() => {
    if (step === 1) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          html5QrCode.stop().then(() => setStep(2));
        },
        () => {}
      ).catch(err => {
        console.error("Camera start failed", err);
        setQrError("Camera failed to start. Please check permissions.");
      });

      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.log("Stop failed", err));
        }
      };
    }
  }, [step]);

  // --- STEP 2: AI CAPTURE ---
  const capture = async () => {
    if (!webcamRef.current || isProcessing) return;

    setIsProcessing(true);
    setStatus("Analyzing...");
    setDetectedWaste(null);
    setBorderColor("border-gray-500");

    try {
      const model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
      const imageSrc = webcamRef.current.getScreenshot();
      const img = new Image();
      img.src = imageSrc;

      img.onload = async () => {
        const prediction = await model.predict(img);
        const best = prediction.sort((a, b) => b.probability - a.probability)[0];

        if (best.probability > 0.80) {
          const config = WASTE_CONFIG[best.className] || {
            label: best.className,
            emoji: "♻️",
            hex: "#6B7280",
            incentive: 5,
            bin: "General Bin",
          };

          setDetectedWaste(config);
          setBorderColor(`border-[${config.hex}]`);
          setStatus("identified");

          setTimeout(async () => {
            try {
              await axios.post(`${API_BASE_URL}/api/add-waste`, {
                wasteType: config.label,
                location: currentLocation
              }, {
                headers: { 'x-access-token': localStorage.getItem('token') }
              });
              localStorage.removeItem('current_bin_location');
            } catch (e) {
              console.error("Submit failed", e);
            }
            navigate('/dashboard');
          }, 3000);

        } else {
          setStatus("❌ Not clear. Hold the item closer.");
          setBorderColor("border-red-500");
          setIsProcessing(false);
        }
      };
    } catch (e) {
      alert("Model Error: Check your URL.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 pt-8 font-sans">

      <style>{`
        @keyframes scan-down {
          0%   { top: 0%;   opacity: 0; }
          50%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-down { animation: scan-down 2s linear infinite; }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .result-card { animation: slideUpFade 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }

        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .progress-bar { animation: progressBar 3s linear forwards; }

        #reader img, #reader a { display: none; }
      `}</style>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <ScanQrCode className="text-emerald-400 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Bin Scanner</h1>
          <p className="text-slate-400 text-sm">Scan → Identify → Earn</p>
          <p className="text-emerald-400 text-sm font-bold flex items-center gap-1">
            📍 {currentLocation}
          </p>
        </div>
      </div>

      {/* STEP 1: QR */}
      {step === 1 && (
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <h2 className="text-lg font-semibold text-white mb-2">Locate a Smart Bin</h2>
            <p className="text-slate-400 text-sm mb-6">Point your camera at the QR code.</p>
            <div className="bg-black rounded-xl overflow-hidden border-2 border-dashed border-slate-700 relative h-64 md:h-80 w-full flex items-center justify-center">
              <div id="reader" className="w-full h-full"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10b981] animate-scan-down pointer-events-none z-10"></div>
            </div>
            {qrError ? (
              <p className="text-red-400 text-xs mt-4 font-bold">{qrError}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                <Camera size={14} /> Auto-scanning active
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: AI */}
      {step === 2 && (
        <div className="flex flex-col items-center w-full max-w-md">

          {/* Status bar */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full mb-4">
            <div className="flex justify-between items-center px-4 py-2">
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">● Connected</span>
              <span className="text-slate-500 text-xs uppercase tracking-wider">AI Ready</span>
            </div>
          </div>

          {/* Camera */}
          <div
            className="relative rounded-2xl overflow-hidden w-full shadow-2xl transition-all duration-500"
            style={{
              border: `4px solid ${detectedWaste ? detectedWaste.hex : '#6B7280'}`,
              boxShadow: detectedWaste ? `0 0 32px ${detectedWaste.hex}55` : undefined,
            }}
          >
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full object-cover h-96"
            />
            {isProcessing && !detectedWaste && (
              <div className="absolute top-0 left-0 w-full h-1 bg-white shadow-[0_0_20px_white] animate-scan-down"></div>
            )}
            {detectedWaste && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-8 h-8 drop-shadow-lg" style={{ color: detectedWaste.hex }} />
              </div>
            )}
          </div>

          {/* Status text — only when not identified */}
          {!detectedWaste && (
            <p className="text-xl font-bold text-white mt-6 mb-2">{status}</p>
          )}

          {/* RESULT CARD */}
          {detectedWaste && (
            <div
              className="result-card w-full mt-5 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: '#0f172a', border: `1px solid ${detectedWaste.hex}44` }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${detectedWaste.hex}, transparent)` }} />

              <div className="p-5 flex items-center gap-4">
                {/* Emoji icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${detectedWaste.hex}18`, border: `1px solid ${detectedWaste.hex}44` }}
                >
                  {detectedWaste.emoji}
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: detectedWaste.hex }}>
                    Waste Identified
                  </p>
                  <p className="text-xl font-bold text-white leading-tight">{detectedWaste.label}</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    👉 Dispose in the <span className="font-semibold text-slate-200">{detectedWaste.bin}</span>
                  </p>
                </div>

                {/* Reward */}
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold" style={{ color: detectedWaste.hex }}>+₹{detectedWaste.incentive}</p>
                  <p className="text-slate-500 text-xs">reward</p>
                </div>
              </div>

              {/* Progress bar — 3s countdown to navigate */}
              <div className="h-0.5 bg-slate-800 mx-5 mb-4 rounded-full overflow-hidden">
                <div className="progress-bar h-full rounded-full" style={{ background: detectedWaste.hex }} />
              </div>
              <p className="text-center text-slate-500 text-xs pb-4">Redirecting to dashboard…</p>
            </div>
          )}

          {/* Capture button */}
          {!detectedWaste && (
            <button
              onClick={capture}
              disabled={isProcessing}
              className={`mt-6 w-full py-4 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-3 transition-all transform
                ${isProcessing
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] active:scale-95 shadow-emerald-500/30"}`}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" /> Analyzing…</>
              ) : (
                <><Camera /> Capture & Analyze</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; // <--- USING THE ENGINE DIRECTLY
import * as tmImage from '@teachablemachine/image';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ScanQrCode, Camera } from 'lucide-react';

export default function Scanner() {
  const [step, setStep] = useState(1); // 1 = QR, 2 = AI
  const [status, setStatus] = useState("Waiting for waste...");
  const [instruction, setInstruction] = useState("");
  const [borderColor, setBorderColor] = useState("border-gray-500");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrError, setQrError] = useState(null); // To show camera errors

  const webcamRef = useRef(null);
  const scannerRef = useRef(null); // To keep track of the scanner instance
  const navigate = useNavigate();

  const [currentLocation, setCurrentLocation] = useState("Smart Bin (General)");

  useEffect(() => {
    const savedLocation = localStorage.getItem('current_bin_location');
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  // --- AI CAMERA CONFIG ---
  const videoConstraints = {
    facingMode: { ideal: "environment" }
  };

  const URL = "https://teachablemachine.withgoogle.com/models/GRs1e8MV9/";

  // --- STEP 1: QR SCANNER LOGIC ---
  useEffect(() => {
    if (step === 1) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      // FORCE BACK CAMERA IMMEDIATELY
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // SUCCESS!
          console.log("QR Code detected:", decodedText);
          html5QrCode.stop().then(() => {
            setStep(2); // Move to AI Step
          });
        },
        (errorMessage) => {
          // parse error, ignore it.
        }
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

  // --- STEP 2: AI CAPTURE LOGIC ---
  const capture = async () => {
    if (!webcamRef.current || isProcessing) return;

    setIsProcessing(true);
    setStatus("Analyzing...");
    setInstruction("");
    setBorderColor("border-gray-500");

    try {
      const model = await tmImage.load(URL + "model.json", URL + "metadata.json");
      const imageSrc = webcamRef.current.getScreenshot();
      const img = new Image();
      img.src = imageSrc;

      img.onload = async () => {
        const prediction = await model.predict(img);
        const bestPrediction = prediction.sort((a, b) => b.probability - a.probability)[0];

        if (bestPrediction.probability > 0.80) {
          let wasteType = "Non-Plastic";
          let binColor = "Blue";
          let cssColor = "border-blue-600";
          let userMsg = "Non-Plastic Detected";

          if (bestPrediction.className === "Plastic" || bestPrediction.className === "Class 1") {
            wasteType = "Plastic";
            binColor = "Yellow";
            cssColor = "border-yellow-500";
            userMsg = "Plastic Detected";
          }

          setStatus(`✅ ${userMsg}`);
          setInstruction(`👉 Please dispose in the ${binColor.toUpperCase()} BIN`);
          setBorderColor(cssColor);

          // --- SUBMIT TO SERVER ---
          // We wait 3 seconds so the user can read the instruction before leaving the page
          setTimeout(async () => {
            await axios.post('https://smartbin-api-c7g4.onrender.com/api/add-waste', {
              wasteType: wasteType, // Send "Plastic" or "Non-Plastic"
              location: currentLocation // <--- SENDING THE REAL LOCATION
            }, {
              headers: { 'x-access-token': localStorage.getItem('token') }
            });
            // Clear the memory after use so it resets for next time
            localStorage.removeItem('current_bin_location');
            alert(`Reward Added! (${wasteType})`);
            navigate('/dashboard');
          }, 3000);

        } else {
          setStatus("❌ Not clear. Please hold the item closer.");
          setBorderColor("border-red-500");
          setIsProcessing(false);
        }
      }
    } catch (e) {
      alert("Model Error: Check your URL.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 pt-8 font-sans">

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

      {/* --- STEP 1: QR SCANNER (Custom UI) --- */}
      {step === 1 && (
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <h2 className="text-lg font-semibold text-white mb-2">Locate a Smart Bin</h2>
            <p className="text-slate-400 text-sm mb-6">Point your camera at the QR code.</p>

            {/* THE READER CONTAINER */}
            <div className="bg-black rounded-xl overflow-hidden border-2 border-dashed border-slate-700 relative h-64 md:h-80 w-full flex items-center justify-center">
              {/* The Library injects the video here */}
              <div id="reader" className="w-full h-full"></div>

              {/* My Custom Scanning Line Overlay */}
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

      {/* --- STEP 2: AI ANALYZER --- */}
      {step === 2 && (
        <div className="flex flex-col items-center w-full max-w-md animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full mb-4">
            <div className="flex justify-between items-center px-4 py-2">
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">● Connected</span>
              <span className="text-slate-500 text-xs uppercase tracking-wider">AI Ready</span>
            </div>
          </div>

          <div className={`relative border-4 ${borderColor} rounded-2xl overflow-hidden w-full shadow-2xl transition-all duration-300`}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full object-cover h-96"
            />
            {isProcessing && (
              <div className="absolute top-0 left-0 w-full h-1 bg-white shadow-[0_0_20px_white] animate-scan-down"></div>
            )}
          </div>

          <style>{`
            @keyframes scan-down {
                0% { top: 0%; opacity: 0; }
                50% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
            .animate-scan-down {
                animation: scan-down 2s linear infinite;
            }
            /* Hide the library's internal error texts */
            #reader img, #reader a { display: none; }
          `}</style>

          <div className="mt-6 text-center w-full">
            <p className="text-xl font-bold text-white mb-4">{status}</p>
            {instruction && (
              <div className={`p-6 rounded-2xl ${instruction.includes("YELLOW") ? "bg-yellow-400 text-black" : "bg-blue-600 text-white"} shadow-lg animate-bounce`}>
                <h2 className="text-2xl font-extrabold tracking-tight">{instruction}</h2>
              </div>
            )}
          </div>

          {!instruction && (
            <button
              onClick={capture}
              disabled={isProcessing}
              className={`mt-6 w-full py-4 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-3 transition-all transform
                    ${isProcessing
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] active:scale-95 shadow-emerald-500/30"}`
              }
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" /> Analyzing...</>
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
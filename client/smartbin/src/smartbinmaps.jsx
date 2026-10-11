import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react'; // Make sure you have this imported
import axios from 'axios';

// --- FIX ICONS (Native Leaflet requires manual icon setup) ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function SmartBinMap() {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const navigate = useNavigate();

    // State to handle the loading screen while waiting for Supabase
    const [isLoading, setIsLoading] = useState(true);

    const centerPosition = [12.9641681213894, 77.5054484020979];

    useEffect(() => {
        const fetchBinsAndInitMap = async () => {
            let activeBins = [];

            try {
                // 1. FETCH REAL-TIME DATA FROM YOUR LIVE RENDER SERVER
                const res = await axios.get('https://smartbin-api-c7g4.onrender.com/api/bins');
                if (res.data.status === 'ok') {
                    activeBins = res.data.bins;
                }
            } catch (error) {
                console.error("Failed to fetch bins from database", error);
            }

            // Remove loading screen once data arrives
            setIsLoading(false);

            // 2. Initialize Map ONLY ONCE
            if (!mapInstanceRef.current && mapContainerRef.current && activeBins.length > 0) {
                const map = L.map(mapContainerRef.current).setView(centerPosition, 18);
                mapInstanceRef.current = map;

                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri'
                }).addTo(map);

                // Add Pins using the live Supabase data
                activeBins.forEach(bin => {
                    const marker = L.marker([bin.lat, bin.lng]).addTo(map);

                    const isActive = bin.status === 'Active';
                    const statusColor = isActive ? '#10b981' : '#ef4444';

                    const buttonStyle = isActive
                        ? "background-color: #059669; color: white; cursor: pointer;"
                        : "background-color: #9ca3af; color: white; cursor: not-allowed; opacity: 0.8;";

                    const popupContent = document.createElement('div');
                    popupContent.innerHTML = `
                    <div style="text-align: center; font-family: sans-serif;">
                        <h3 style="margin: 0; font-weight: bold; font-size: 16px;">${bin.name}</h3>
                        <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 99px; font-size: 12px; font-weight: bold;">
                            ${bin.status}
                        </span>
                        <br/>
                        <button id="scan-btn-${bin.id}" style="margin-top: 8px; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; ${buttonStyle}">
                            Scan Here
                        </button>
                    </div>
                `;

                    popupContent.querySelector(`#scan-btn-${bin.id}`).addEventListener('click', () => {
                        if (!isActive) {
                            alert(`Sorry, the ${bin.name} is currently ${bin.status}. Please find an active bin!`);
                            return;
                        }
                        localStorage.setItem('current_bin_location', bin.name);
                        navigate('/scan');
                    });

                    marker.bindPopup(popupContent);
                });
            }
        };

        fetchBinsAndInitMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="h-screen w-full flex flex-col relative bg-slate-900">

            {/* HEADER OVERLAY */}
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                        <ArrowLeft className="text-slate-700" size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Smart Bin Locations</h1>
                        <p className="text-xs text-slate-500">Live Satellite Feed</p>
                    </div>
                </div>
            </div>

            {/* LOADING SCREEN */}
            {isLoading && (
                <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-white">
                    <Loader2 className="animate-spin w-12 h-12 text-emerald-500 mb-4" />
                    <p className="text-lg font-bold tracking-wide animate-pulse">Fetching Live Statuses...</p>
                </div>
            )}

            {/* MAP CONTAINER */}
            <div ref={mapContainerRef} className="h-full w-full z-0" />

        </div>
    );
}
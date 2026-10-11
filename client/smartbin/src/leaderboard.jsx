import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowLeft, Loader2, Crown } from 'lucide-react';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Make sure this points to your live Render URL!
                const res = await axios.get('https://smartbin-api-c7g4.onrender.com/api/leaderboard');
                if (res.data.status === 'ok') {
                    setLeaders(res.data.leaderboard);
                }
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-16">

            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-800 text-white pt-12 pb-24 px-4 text-center rounded-b-[3rem] shadow-xl relative">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm"
                >
                    <ArrowLeft size={24} />
                </button>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h1 className="text-4xl font-extrabold mb-2">Global Leaderboard</h1>
                <p className="text-emerald-100 opacity-90">Top Eco-Warriors making a difference</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loader2 className="animate-spin w-12 h-12 text-emerald-500 mb-4" />
                    <p className="text-slate-500 font-medium">Ranking players...</p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">

                    {/* Top 3 Podium */}
                    {leaders.length >= 3 && (
                        <div className="grid grid-cols-3 gap-4 mb-8 items-end">

                            {/* Rank 2 - Silver */}
                            <div className="bg-white p-4 rounded-t-2xl rounded-bl-2xl shadow-lg border-t-4 border-gray-300 text-center transform translate-y-4">
                                <Medal className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                <h3 className="font-bold text-slate-800 truncate">{leaders[1]?.name}</h3>
                                <p className="text-emerald-600 font-extrabold">{leaders[1]?.ecoPoints} pts</p>
                            </div>

                            {/* Rank 1 - Gold */}
                            <div className="bg-gradient-to-b from-yellow-50 to-white p-6 rounded-t-2xl shadow-2xl border-t-4 border-yellow-400 text-center relative z-10">
                                <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-2 -mt-8 bg-white rounded-full p-1 shadow-sm" />
                                <h3 className="font-bold text-slate-800 text-lg truncate">{leaders[0]?.name}</h3>
                                <p className="text-emerald-600 font-black text-xl">{leaders[0]?.ecoPoints} pts</p>
                            </div>

                            {/* Rank 3 - Bronze */}
                            <div className="bg-white p-4 rounded-t-2xl rounded-br-2xl shadow-lg border-t-4 border-amber-600 text-center transform translate-y-8">
                                <Award className="w-10 h-10 mx-auto text-amber-600 mb-2" />
                                <h3 className="font-bold text-slate-800 truncate">{leaders[2]?.name}</h3>
                                <p className="text-emerald-600 font-extrabold">{leaders[2]?.ecoPoints} pts</p>
                            </div>
                        </div>
                    )}

                    {/* Rest of the List (Ranks 4+) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {leaders.slice(3).map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                        #{index + 4}
                                    </div>
                                    <span className="font-bold text-slate-700">{user.name}</span>
                                </div>
                                <div className="font-extrabold text-emerald-600">
                                    {user.ecoPoints} <span className="text-xs text-emerald-400 font-medium">pts</span>
                                </div>
                            </div>
                        ))}

                        {leaders.length <= 3 && (
                            <div className="p-8 text-center text-slate-500">
                                More eco-warriors needed to fill the ranks!
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
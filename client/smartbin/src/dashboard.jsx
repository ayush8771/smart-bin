import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wallet, Leaf, Trash2, LogOut, History, Ticket, Bus, Train, CreditCard, Trophy, RefreshCw, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Refresh function to reload data after redemption
  const fetchUserData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get('https://smartbin-api-c7g4.onrender.com/api/dashboard', { headers: { 'x-access-token': token } })
      .then(res => {
        if (res.data.status === 'ok') {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      })
      .catch(err => {
        console.error("Dashboard fetch error", err);
        localStorage.removeItem('token');
        navigate('/login');
      });
  };

  useEffect(() => { fetchUserData(); }, []);

  if (!user) return <div className="flex h-screen items-center justify-center font-bold text-xl">Loading Dashboard...</div>;

  // --- REDEMPTION LOGIC ---
  const handleRedeem = async (item, cost, type) => {
    if (!window.confirm(`Are you sure you want to redeem ${item} for ${cost} ${type === 'money' ? 'Rupees' : 'Points'}?`)) return;

    // UPDATED URL TO NEW BACKEND
    const res = await axios.post('https://smartbin-api-c7g4.onrender.com/api/redeem', { item, cost, type }, {
      headers: { 'x-access-token': localStorage.getItem('token') }
    });

    if (res.data.status === 'ok') {
      alert(`Success! You redeemed: ${item}`);
      fetchUserData(); // Update balance instantly
    } else {
      alert(`Failed: ${res.data.message}`);
    }
  };

  // --- MERGE LOGS & REDEMPTIONS FOR WALLET HISTORY ---
  const transactions = [
    ...(user.logs || []).map(l => ({ ...l, type: 'credit', desc: `Recycled ${l.wasteType}` })),
    ...(user.redemptions || []).map(r => ({ ...r, type: 'debit', amount: r.cost, desc: r.item }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- CHART DATA PREP ---
  const processEarningsData = () => {
    if (!user.logs) return [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateString = d.toDateString();
      const dailyTotal = user.logs
        .filter(log => new Date(log.date).toDateString() === dateString)
        .reduce((sum, log) => sum + (log.amount || 0), 0);
      last7Days.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), earnings: dailyTotal });
    }
    return last7Days;
  };

  const pieData = [
    { name: 'Plastic', value: user.logs?.filter(l => l.wasteType === 'Plastic').length || 0 },
    { name: 'Non - Plastic', value: user.logs?.filter(l => l.wasteType !== 'Plastic').length || 0 },
  ];
  if (pieData[0].value === 0 && pieData[1].value === 0) pieData[0].value = 1;

  const COLORS = ['#22c55e', '#64748b'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, {user.name}!</h1>
          <p className="text-gray-500">Your Impact & Rewards Dashboard</p>
        </div>

        {/* NEW BUTTON CONTAINER */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* LEADERBOARD BUTTON */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-yellow-50 text-yellow-600 px-5 py-3 rounded-xl font-bold hover:bg-yellow-100 transition border border-yellow-200"
          >
            <Trophy size={20} /> <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-xl font-bold hover:bg-red-100 transition"
          >
            <LogOut size={20} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-gray-400 font-medium">Wallet Balance</h2>
            <p className="text-4xl font-bold text-green-600">₹{user.walletBalance}</p>
            <button onClick={() => handleRedeem("Bank Transfer", 100, 'money')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-2 font-bold hover:bg-green-200">Withdraw ₹100</button>
          </div>
          <Wallet className="text-green-600" size={40} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-gray-400 font-medium">Eco Points</h2>
            <p className="text-4xl font-bold text-blue-600">{user.ecoPoints}</p>
            <p className="text-xs text-blue-400 mt-1">Redeem below</p>
          </div>
          <Leaf className="text-blue-600" size={40} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-gray-400 font-medium">CO2 Saved</h2>
            <p className="text-4xl font-bold text-yellow-600">{(user.ecoPoints * 0.02).toFixed(1)} kg</p>
          </div>
          <Trash2 className="text-yellow-600" size={40} />
        </div>
      </div>

      <button onClick={() => navigate('/map')} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full py-5 text-xl rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition transform font-bold flex items-center justify-center gap-3 mb-10">
        🗺️ Find Nearby Bins
      </button>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold mb-4 text-gray-700">Earnings Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processEarningsData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold mb-4 text-gray-700">Waste Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* REWARDS SHOP */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Ticket className="text-blue-600" /> Redeem Eco Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Ticket className="text-purple-600" /></div>
            <h4 className="text-xl font-bold">Movie Voucher</h4>
            <p className="text-gray-500 text-sm mb-4">Get ₹200 off on BookMyShow</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-600">500 Pts</span>
              <button onClick={() => handleRedeem("Movie Voucher", 500, 'points')} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700">Redeem</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Bus className="text-yellow-600" /></div>
            <h4 className="text-xl font-bold">Bus Pass</h4>
            <p className="text-gray-500 text-sm mb-4">One Day City Bus Pass</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-600">200 Pts</span>
              <button onClick={() => handleRedeem("Bus Pass", 200, 'points')} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700">Redeem</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Train className="text-indigo-600" /></div>
            <h4 className="text-xl font-bold">Metro Recharge</h4>
            <p className="text-gray-500 text-sm mb-4">Add ₹50 to your Metro Card</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-600">300 Pts</span>
              <button onClick={() => handleRedeem("Metro Recharge", 300, 'points')} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700">Redeem</button>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY LOGS */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2"><History /> Recent Activity</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {user.logs && user.logs.length > 0 ? (
            user.logs.slice().reverse().slice(0, 5).map((log, i) => (
              <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-gray-800">{log.wasteType}</p>
                  <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString()}</p>
                </div>
                <div>
                  <div className="hidden sm:block">
                    <p className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      <MapPin size={12} /> {log.location ? log.location : "Unknown Location"}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 font-bold">+₹{log.amount}</span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">No activity yet. Scan some items to see data!</div>
          )}
        </div>
      </div>
    </div>
  );
}
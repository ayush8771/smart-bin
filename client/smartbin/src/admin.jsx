import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Wallet, Leaf, ArrowUpRight, Download, LogOut, ShieldCheck } from 'lucide-react';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, totalMoney: 0, totalPoints: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('https://smartbin-api-c7g4.onrender.com/api/admin/users');
            const data = res.data.users;
            setUsers(data);

            // Calculate Aggregate Stats for the top cards
            const totalMoney = data.reduce((acc, curr) => acc + (curr.walletBalance || 0), 0);
            const totalPoints = data.reduce((acc, curr) => acc + (curr.ecoPoints || 0), 0);

            setStats({
                totalUsers: data.length,
                totalMoney,
                totalPoints
            });
        } catch (err) {
            console.error("Error fetching users");
        }
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">

            {/* 1. TOP NAVIGATION */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
                        <p className="text-xs text-slate-500">SmartBin Developer Console</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition font-medium"
                >
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div className="p-8 max-w-7xl mx-auto">

                {/* 2. STATS OVERVIEW CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Registered Users</p>
                            <h2 className="text-3xl font-bold text-slate-800">{stats.totalUsers}</h2>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Funds Distributed</p>
                            <h2 className="text-3xl font-bold text-green-600">₹{stats.totalMoney.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <Wallet size={24} />
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Impact Created</p>
                            <h2 className="text-3xl font-bold text-indigo-600">{(stats.totalPoints * 0.02).toFixed(1)} kg</h2>
                            <span className="text-xs text-slate-400">CO2 Saved</span>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Leaf size={24} />
                        </div>
                    </div>
                </div>

                {/* 3. MAIN TABLE SECTION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Table Header & Search */}
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">User Database</h3>
                            <p className="text-sm text-slate-500">Manage and view all registered recyclers.</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-5 tracking-wide">User Profile</th>
                                    <th className="p-5 tracking-wide">Role</th>
                                    <th className="p-5 tracking-wide">Wallet Balance</th>
                                    <th className="p-5 tracking-wide">Eco Points</th>
                                    <th className="p-5 tracking-wide text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-indigo-50/30 transition duration-150">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar Generator */}
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{u.name}</p>
                                                        <p className="text-sm text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-green-600 flex items-center gap-1">
                                                    ₹{u.walletBalance.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                                                    {u.ecoPoints} pts
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button className="text-slate-400 hover:text-indigo-600 transition">
                                                    <ArrowUpRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400">
                                            No users found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer of Table */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-sm text-slate-500">Showing {filteredUsers.length} records</span>
                        <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition">
                            <Download size={16} /> Export Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// --- SMART FIREBASE CONNECTION (AUTH ONLY) ---
let serviceAccount;

if (process.env.FIREBASE_CREDS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDS);
    console.log("☁️  Running in Cloud Mode");
} else {
    serviceAccount = require('./serviceAccountKey.json');
    console.log("💻 Running in Local Mode");
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 Firebase Auth Connected");

// --- SUPABASE CONNECTION (SYSTEM DB) ---
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://chqznpoidwgoptxlzxwo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_F_F1cVmxBzRdl8SDYg_RCg_yNZTYfAg';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("⚡ Supabase Database Connected");

// --- HELPER FUNCTIONS ---
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.json({ status: 'error', error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.json({ status: 'error', error: 'Invalid Token' });
    }
};

// ==========================================
// 1. AUTHENTICATION (FIREBASE PRIMARY)
// ==========================================

// REGISTER (Firebase Auth + Supabase Profile)
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check Firebase if user exists
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();
        if (doc.exists) {
            return res.json({ status: 'error', error: 'Email already exists' });
        }

        const newPassword = await bcrypt.hash(password, 10);

        // 2. Save pure auth credentials to Firebase
        await userRef.set({
            email: email,
            password: newPassword,
            role: 'user'
        });

        // 3. Setup Wallet & Profile in Supabase
        await supabase.from('user_profiles').insert([{
            email: email,
            name: name,
            walletBalance: 0,
            ecoPoints: 0,
            logs: [],
            redemptions: [],
            role: 'user'
        }]);

        res.json({ status: 'ok' });
    } catch (err) {
        console.log(err);
        res.json({ status: 'error', error: 'Server Error' });
    }
});

// LOGIN (Firebase Only) - Completely untouched!
app.post('/api/login', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.body.email);
        const doc = await userRef.get();

        if (!doc.exists) return res.json({ status: 'error', user: false });

        const userData = doc.data();
        const isValid = await bcrypt.compare(req.body.password, userData.password);

        if (isValid) {
            const token = jwt.sign({ email: userData.email, role: userData.role }, JWT_SECRET);
            return res.json({ status: 'ok', token: token, role: userData.role });
        } else {
            return res.json({ status: 'error', user: false });
        }
    } catch (err) {
        res.json({ status: 'error', error: err.message });
    }
});

// ==========================================
// 2. SYSTEM DATA (SUPABASE PRIMARY)
// ==========================================

// DASHBOARD (Fetch from Supabase)
app.get('/api/dashboard', verifyToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', req.userEmail)
            .single();

        if (error || !user) return res.json({ status: 'error', error: 'User not found in database' });

        res.json({ status: 'ok', user: user });
    } catch (error) {
        res.json({ status: 'error', error: 'Server Error' });
    }
});

// ADD WASTE (Update Supabase Wallets & Arrays)
app.post('/api/add-waste', verifyToken, async (req, res) => {
    try {
        // 1. Get current data
        const { data: user } = await supabase.from('user_profiles').select('*').eq('email', req.userEmail).single();

        const locationName = req.body.location || 'Smart Bin (General)';
        const type = req.body.wasteType || 'Plastic';
        let reward = (type === 'Plastic') ? 10 : 7;
        let points = (type === 'Plastic') ? 50 : 20;

        const newLog = {
            date: new Date().toISOString(),
            wasteType: type,
            weight: 0.5,
            amount: reward,
            location: locationName
        };

        // 2. Calculate new values
        const newWallet = user.walletBalance + reward;
        const newPoints = user.ecoPoints + points;
        const newLogs = [...user.logs, newLog]; // Append new log to array

        // 3. Update Supabase
        await supabase.from('user_profiles').update({
            walletBalance: newWallet,
            ecoPoints: newPoints,
            logs: newLogs
        }).eq('email', req.userEmail);

        res.json({ status: 'ok', rewardAdded: reward });

    } catch (error) {
        console.log(error);
        res.json({ status: 'error' });
    }
});

// REDEEM (Update Supabase Wallets & Arrays)
app.post('/api/redeem', verifyToken, async (req, res) => {
    try {
        const { data: user } = await supabase.from('user_profiles').select('*').eq('email', req.userEmail).single();

        const cost = Number(req.body.cost);
        const { item, type } = req.body;
        let newWallet = user.walletBalance;
        let newPoints = user.ecoPoints;

        if (type === 'money') {
            if (user.walletBalance < cost) return res.json({ status: 'error', message: 'Insufficient Funds' });
            newWallet -= cost;
        } else {
            if (user.ecoPoints < cost) return res.json({ status: 'error', message: 'Insufficient Points' });
            newPoints -= cost;
        }

        const newRedemption = {
            date: new Date().toISOString(),
            item, cost, type
        };

        const newRedemptions = [...user.redemptions, newRedemption];

        await supabase.from('user_profiles').update({
            walletBalance: newWallet,
            ecoPoints: newPoints,
            redemptions: newRedemptions
        }).eq('email', req.userEmail);

        res.json({ status: 'ok' });
    } catch (error) {
        console.log(error);
        res.json({ status: 'error', message: 'Server Error' });
    }
});

// ADMIN: GET ALL USERS (From Supabase)
app.get('/api/admin/users', async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('user_profiles').select('*');
        if (error) throw error;

        // Map over users to inject _id so the frontend tables don't break
        const usersList = users.map(u => ({ ...u, _id: u.email }));
        res.json({ status: 'ok', users: usersList });
    } catch (err) {
        res.json({ status: 'error' });
    }
});

// GET BINS (From Supabase)
app.get('/api/bins', async (req, res) => {
    try {
        const { data: bins, error } = await supabase.from('bins').select('*');
        if (error) throw error;
        res.json({ status: 'ok', bins: bins });
    } catch (error) {
        res.json({ status: 'error', error: error.message });
    }
});

// ==========================================
// LEADERBOARD (Top Eco-Warriors)
// ==========================================
app.get('/api/leaderboard', async (req, res) => {
    try {
        // Fetch only names and points, ordered highest to lowest, limit top 50
        const { data: leaders, error } = await supabase
            .from('user_profiles')
            .select('name, ecoPoints')
            .eq('role', 'user')
            .order('ecoPoints', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({ status: 'ok', leaderboard: leaders });

    } catch (error) {
        console.log("Leaderboard Error:", error);
        res.json({ status: 'error', error: 'Could not fetch leaderboard' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT} (Hybrid Auth/DB Mode)`));
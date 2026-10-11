const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

// --- REQUIRED ENVIRONMENT CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in the environment.');
}

// --- SMART FIREBASE CONNECTION (AUTH ONLY) ---
let serviceAccount;

if (process.env.FIREBASE_CREDS) {
    const parsedCredentials = JSON.parse(process.env.FIREBASE_CREDS);

    // Support either raw Firebase service-account JSON
    // or a wrapper object containing FIREBASE_CREDS.
    const credentials = parsedCredentials.FIREBASE_CREDS ?? parsedCredentials;

    serviceAccount = typeof credentials === 'string'
        ? JSON.parse(credentials)
        : credentials;

    if (
        !serviceAccount ||
        typeof serviceAccount.project_id !== 'string' ||
        !serviceAccount.project_id
    ) {
        throw new Error(
            'FIREBASE_CREDS must contain valid Firebase service-account JSON with project_id.'
        );
    }

    console.log('☁️ Running in Cloud Mode');
} else {
    serviceAccount = require('./serviceAccountKey.json');
    console.log('💻 Running in Local Mode');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

console.log('🔥 Firebase Auth Connected');

// --- SUPABASE CONNECTION (SYSTEM DB) ---
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be configured in the environment.'
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('⚡ Supabase Database Connected');

// --- HELPER FUNCTIONS ---
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.json({
            status: 'error',
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.json({
            status: 'error',
            error: 'Invalid Token'
        });
    }
};

// ==========================================
// 1. AUTHENTICATION (FIREBASE PRIMARY)
// ==========================================

// REGISTER (Firebase Auth + Supabase Profile)
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                error: 'Name, email, and password are required.'
            });
        }

        // 1. Check Firebase if user exists
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.json({
                status: 'error',
                error: 'Email already exists'
            });
        }

        const newPassword = await bcrypt.hash(password, 10);

        // 2. Save authentication credentials to Firebase
        await userRef.set({
            email: email,
            password: newPassword,
            role: 'user'
        });

        // 3. Set up wallet and profile in Supabase
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
                email: email,
                name: name,
                walletBalance: 0,
                ecoPoints: 0,
                logs: [],
                redemptions: [],
                role: 'user'
            }]);

        if (profileError) {
            console.error('Supabase profile creation error:', profileError.message);

            return res.status(500).json({
                status: 'error',
                error: 'Could not create user profile.'
            });
        }

        return res.json({ status: 'ok' });
    } catch (err) {
        console.error('Registration error:', err.message);

        return res.status(500).json({
            status: 'error',
            error: 'Server Error'
        });
    }
});

// LOGIN (Firebase Only)
app.post('/api/login', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.body.email);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.json({
                status: 'error',
                user: false
            });
        }

        const userData = doc.data();
        const isValid = await bcrypt.compare(
            req.body.password,
            userData.password
        );

        if (isValid) {
            const token = jwt.sign(
                {
                    email: userData.email,
                    role: userData.role
                },
                JWT_SECRET
            );

            return res.json({
                status: 'ok',
                token: token,
                role: userData.role
            });
        }

        return res.json({
            status: 'error',
            user: false
        });
    } catch (err) {
        console.error('Login error:', err.message);

        return res.status(500).json({
            status: 'error',
            error: 'Server Error'
        });
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

        if (error || !user) {
            return res.json({
                status: 'error',
                error: 'User not found in database'
            });
        }

        return res.json({
            status: 'ok',
            user: user
        });
    } catch (error) {
        console.error('Dashboard error:', error.message);

        return res.status(500).json({
            status: 'error',
            error: 'Server Error'
        });
    }
});

// ADD WASTE (Update Supabase Wallets & Arrays)
app.post('/api/add-waste', verifyToken, async (req, res) => {
    try {
        // 1. Get current user data
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', req.userEmail)
            .single();

        if (userError || !user) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found'
            });
        }

        const locationName = req.body.location || 'Smart Bin (General)';
        const type = req.body.wasteType || 'Plastic';

        const REWARD_MAP = {
            'Plastic':           { reward: 25, points: 125 },
            'Metal':             { reward: 30, points: 150 },
            'Paper / Cardboard': { reward: 10, points: 50 },
            'Organic':            { reward: 5, points: 25 },
            'Glass':              { reward: 15, points: 75 },
            'Other Trash':        { reward: 8, points: 40 }
        };

        const { reward, points } = REWARD_MAP[type] || {
            reward: 5,
            points: 25
        };

        const newLog = {
            date: new Date().toISOString(),
            wasteType: type,
            weight: 0.5,
            amount: reward,
            location: locationName
        };

        // 2. Calculate new values
        const newWallet = Number(user.walletBalance || 0) + reward;
        const newPoints = Number(user.ecoPoints || 0) + points;
        const newLogs = [...(user.logs || []), newLog];

        // 3. Update Supabase
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                walletBalance: newWallet,
                ecoPoints: newPoints,
                logs: newLogs
            })
            .eq('email', req.userEmail);

        if (updateError) {
            console.error('Waste update error:', updateError.message);

            return res.status(500).json({
                status: 'error',
                error: 'Could not update waste records'
            });
        }

        return res.json({
            status: 'ok',
            rewardAdded: reward,
            pointsAdded: points
        });
    } catch (error) {
        console.error('Add waste error:', error.message);

        return res.status(500).json({
            status: 'error',
            error: 'Server Error'
        });
    }
});

// REDEEM (Update Supabase Wallets & Arrays)
app.post('/api/redeem', verifyToken, async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', req.userEmail)
            .single();

        if (userError || !user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const cost = Number(req.body.cost);
        const { item, type } = req.body;

        if (!Number.isFinite(cost) || cost <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid redemption cost'
            });
        }

        let newWallet = Number(user.walletBalance || 0);
        let newPoints = Number(user.ecoPoints || 0);

        if (type === 'money') {
            if (newWallet < cost) {
                return res.json({
                    status: 'error',
                    message: 'Insufficient Funds'
                });
            }

            newWallet -= cost;
        } else {
            if (newPoints < cost) {
                return res.json({
                    status: 'error',
                    message: 'Insufficient Points'
                });
            }

            newPoints -= cost;
        }

        const newRedemption = {
            date: new Date().toISOString(),
            item,
            cost,
            type
        };

        const newRedemptions = [
            ...(user.redemptions || []),
            newRedemption
        ];

        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                walletBalance: newWallet,
                ecoPoints: newPoints,
                redemptions: newRedemptions
            })
            .eq('email', req.userEmail);

        if (updateError) {
            console.error('Redemption update error:', updateError.message);

            return res.status(500).json({
                status: 'error',
                message: 'Could not update redemption'
            });
        }

        return res.json({ status: 'ok' });
    } catch (error) {
        console.error('Redeem error:', error.message);

        return res.status(500).json({
            status: 'error',
            message: 'Server Error'
        });
    }
});

// ADMIN: GET ALL USERS (From Supabase)
app.get('/api/admin/users', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('user_profiles')
            .select('*');

        if (error) throw error;

        // Map over users to inject _id for frontend compatibility
        const usersList = users.map(user => ({
            ...user,
            _id: user.email
        }));

        return res.json({
            status: 'ok',
            users: usersList
        });
    } catch (err) {
        console.error('Admin users error:', err.message);

        return res.status(500).json({
            status: 'error'
        });
    }
});

// GET BINS (From Supabase)
app.get('/api/bins', async (req, res) => {
    try {
        const { data: bins, error } = await supabase
            .from('bins')
            .select('*');

        if (error) throw error;

        return res.json({
            status: 'ok',
            bins: bins
        });
    } catch (error) {
        console.error('Bins error:', error.message);

        return res.status(500).json({
            status: 'error',
            error: 'Could not fetch bins'
        });
    }
});

// ==========================================
// LEADERBOARD (Top Eco-Warriors)
// ==========================================
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { data: leaders, error } = await supabase
            .from('user_profiles')
            .select('name, ecoPoints')
            .eq('role', 'user')
            .order('ecoPoints', { ascending: false })
            .limit(50);

        if (error) throw error;

        return res.json({
            status: 'ok',
            leaderboard: leaders
        });
    } catch (error) {
        console.error('Leaderboard error:', error.message);

        return res.status(500).json({
            status: 'error',
            error: 'Could not fetch leaderboard'
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SmartBin API'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on ${PORT} (Hybrid Auth/DB Mode)`);
});
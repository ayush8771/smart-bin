import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './landing';
import About from './about';

import Dashboard from './dashboard';
import Scanner from './scanner';
import Admin from './admin';
import Leaderboard from './leaderboard';
import { Login, Register } from './auth';
import SmartBinMap from './smartbinmaps';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/map" element={<SmartBinMap />} />
        <Route path="/about" element={<About />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
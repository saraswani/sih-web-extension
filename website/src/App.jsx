import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Install from './pages/Install';
import Privacy from './pages/Privacy';
import Security from './pages/Security';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col justify-between bg-[#f8faf7] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/install" element={<Install />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/security" element={<Security />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

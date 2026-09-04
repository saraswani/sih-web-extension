import React from 'react';
import Hero from '../components/Hero';
import RedactionDemo from '../components/RedactionDemo';
import ProfileGenerator from '../components/ProfileGenerator';
import HowItWorks from '../components/HowItWorks';
import DownloadSection from '../components/DownloadSection';
import { Shield, Lock, FileCode, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Interactive PII Sandbox */}
      <RedactionDemo />

      {/* 3. Pre-Configure Profile Generator */}
      <ProfileGenerator />

      {/* 4. How It Works Pipeline */}
      <HowItWorks />

      {/* 5. Download Cards Section */}
      <DownloadSection />

      {/* 6. Security & Legal Disclaimer Banner */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Open Source Privacy Shield</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Built for Autonomous Agent Protection
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Phantom AI is a privacy-first browser extension designed to prevent credentials, government IDs, and faces from leaking during autonomous agent interactions.
              </p>
            </div>

            <Link
              to="/security"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-sm font-semibold shrink-0 transition-colors"
            >
              <span>Read Liability Disclaimer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

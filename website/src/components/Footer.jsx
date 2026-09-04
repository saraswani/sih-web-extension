import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, Lock, Cpu, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Required AI Disclaimer Strip */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-xs text-slate-400 text-center">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Phantom AI's redaction and agent features use AI models and may occasionally make mistakes. Always review sensitive actions before confirming.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Phantom<span className="text-emerald-400">AI</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Privacy-preserving browser extension. Runs local TensorFlow vision models to sanitize DOM and screen data before AI agents can read sensitive credentials.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-emerald-400 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5" />
                Local BlazeFace TF.js
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Zero Data Sent
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm tracking-wide uppercase mb-4 text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link to="/install" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Browser Installation Guide
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Privacy Architecture
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Security & Disclaimers
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Standard */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm tracking-wide uppercase mb-4 text-slate-200">
              Technical Specs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center justify-between">
                <span>Architecture</span>
                <span className="font-mono text-slate-200 text-xs">On-Device AI</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Vision Engine</span>
                <span className="font-mono text-emerald-400 text-xs">BlazeFace WebGL</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Manifest Standard</span>
                <span className="font-mono text-slate-200 text-xs">V3 Compliant</span>
              </li>
              <li className="pt-2">
                <a
                  href="/security"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4"
                >
                  <span>Liability Disclaimer Notice</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Phantom AI Team. Open source privacy project.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/security" className="hover:text-slate-300 transition-colors">Terms & Disclaimer</Link>
            <Link to="/install" className="hover:text-slate-300 transition-colors">Installation</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  FileCode,
  ShieldCheck,
  Globe,
  Code2
} from 'lucide-react';
import { detectUserEnv } from '../utils/browserDetect';

export default function DownloadSection() {
  const env = detectUserEnv();

  return (
    <section id="download" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-semibold">
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local Browser Packages</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Download Phantom AI for your browser.
          </h2>
          <p className="text-slate-600 text-base">
            No registration, accounts, or backend services required. Download the Manifest V3 package for your preferred browser and load it locally.
          </p>
        </div>

        {/* Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          
          {/* Chrome / Edge / Brave Package */}
          <div className={`subtle-card rounded-2xl p-8 bg-white border-2 transition-all flex flex-col justify-between ${
            env.isChromium ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                {env.isChromium && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                    Recommended for You
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-2xl text-slate-900 mb-2">
                Chrome / Edge / Brave
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Full Manifest V3 extension package with bundled TensorFlow BlazeFace vision models and local PII regular expressions.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-8 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compatible with Google Chrome, Microsoft Edge, Brave, Opera</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Format: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">phantom-ai-chrome.zip</code> (0.68 MB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Installation via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">chrome://extensions</code> Developer Mode</span>
                </li>
              </ul>
            </div>

            <a
              href="/downloads/phantom-ai-chrome.zip"
              download="phantom-ai-chrome.zip"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold text-sm shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download for Chrome / Edge (.zip)</span>
            </a>
          </div>

          {/* Firefox Package */}
          <div className={`subtle-card rounded-2xl p-8 bg-white border-2 transition-all flex flex-col justify-between ${
            env.isFirefox ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <Compass className="w-6 h-6" />
                </div>
                {env.isFirefox && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                    Recommended for You
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-2xl text-slate-900 mb-2">
                Mozilla Firefox
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Firefox add-on package configured for Firefox Gecko runtime with isolated background scripts and local model execution.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-8 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compatible with Firefox Desktop (v109+)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Format: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">phantom-ai-firefox.xpi</code> (0.68 MB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Installation via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">about:debugging</code> Temporary Add-on</span>
                </li>
              </ul>
            </div>

            <a
              href="/downloads/phantom-ai-firefox.xpi"
              download="phantom-ai-firefox.xpi"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-sm shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download for Firefox (.xpi)</span>
            </a>
          </div>

        </div>

        {/* GitHub Release & Install Link */}
        <div className="max-w-2xl mx-auto text-center p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
            Need GitHub Source or Previous Releases?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/install"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>View Step-by-Step Installation Guide</span>
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <Code2 className="w-4 h-4" />
              <span>GitHub Releases & Changelog</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

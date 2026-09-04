import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Server, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Database,
  ArrowRight,
  Sparkles,
  FileCheck
} from 'lucide-react';

export default function Privacy() {
  return (
    <div className="py-12 lg:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Technical Privacy Architecture</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How we protect your data, line by line.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Privacy is our entire product proposition. Here is an honest, transparent breakdown of what processing happens locally on your device versus what sanitized context reaches an AI model.
          </p>
        </div>

        {/* Local vs Server Data Flow Table */}
        <div className="subtle-card rounded-2xl p-8 bg-slate-50 border border-slate-200 mb-16 shadow-sm">
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Data Boundary Audit Table</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-900 font-display">
                  <th className="py-3 px-4 font-bold">Data Type / Asset</th>
                  <th className="py-3 px-4 font-bold text-emerald-800 bg-emerald-100/60 rounded-t-lg">Where Processed</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Ever Transmitted to Server?</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Storage Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Web Screen Screenshots & Canvas Frames</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">100% On-Device (TF.js Canvas)</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-semibold flex items-center gap-1.5 mt-1">
                    <X className="w-4 h-4 text-rose-500" />
                    <span>NO (Sanitized frames only)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">Volatile RAM buffer only</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Face Landmark Biometrics</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">Local BlazeFace WebGL</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-semibold flex items-center gap-1.5 mt-1">
                    <X className="w-4 h-4 text-rose-500" />
                    <span>NEVER LEAVES DEVICE</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">Instant discard after blur</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Aadhaar, PAN & Credit Card Inputs</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">Verhoeff & Luhn Regex Engine</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-semibold flex items-center gap-1.5 mt-1">
                    <X className="w-4 h-4 text-rose-500" />
                    <span>NO (Blacked out in DOM)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">Never saved</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">User Settings & Rule Preferences</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">Browser Extension Storage</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-semibold flex items-center gap-1.5 mt-1">
                    <X className="w-4 h-4 text-rose-500" />
                    <span>NO</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">chrome.storage.local</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Sanitized UI Vision Tokens</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700 bg-amber-50/50">Sent to User's Chosen AI Agent</td>
                  <td className="py-3.5 px-4 text-slate-800 font-semibold flex items-center gap-1.5 mt-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>YES (After full redaction)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">User's configured LLM endpoint</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Boundary Diagram Card */}
        <div className="subtle-card rounded-2xl p-8 bg-white border border-slate-200 mb-16 shadow-md">
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
            The Phantom Local Boundary Wall
          </h2>
          <p className="text-sm text-slate-600 mb-8">
            How the extension enforces an isolated sandbox layer inside your client runtime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Inside Boundary */}
            <div className="p-6 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 relative space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <span className="font-display font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>INSIDE LOCAL DEVICE BOUNDARY</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                  100% PRIVATE
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-emerald-950 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unmasked camera frames & full screen buffer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>BlazeFace TensorFlow weight matrices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verhoeff checksum verification for Aadhaar/PAN</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Luhn card validation algorithm</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Canvas pixel manipulation & Gaussian blur</span>
                </li>
              </ul>
            </div>

            {/* Outside Boundary */}
            <div className="p-6 rounded-xl bg-slate-900 text-slate-200 border-2 border-slate-800 relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-display font-bold text-white text-sm flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <span>OUTSIDE NETWORK BOUNDARY</span>
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  SANITIZED ONLY
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sanitized DOM layout structure</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Redacted image frames with faces obscured</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Action execution requests (Click button #3, Type text)</span>
                </li>
                <li className="flex items-center gap-2 text-rose-400 font-semibold">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Zero raw facial images or cleartext PII credentials</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Zero Telemetry Policy Note */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="font-display font-bold text-lg text-slate-900">
            Zero-Telemetry Guarantee
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Phantom AI contains zero analytics scripts, tracking pixels, or third-party telemetry services (no Google Analytics, Mixpanel, or PostHog). The extension operates completely offline for data processing and only communicates directly with the LLM API endpoint configured by the user.
          </p>
        </div>

      </div>
    </div>
  );
}

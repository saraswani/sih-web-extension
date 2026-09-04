import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Zap, 
  Lock, 
  User, 
  CreditCard, 
  FileText, 
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';

export default function RedactionDemo() {
  const [redactFaces, setRedactFaces] = useState(true);
  const [redactAadhaar, setRedactAadhaar] = useState(true);
  const [redactCards, setRedactCards] = useState(true);
  const [agentViewMode, setAgentViewMode] = useState(false);

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive On-Device Redaction Sandbox</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See how Phantom AI sanitizes your DOM in real time.
          </h2>
          <p className="text-slate-600 text-base">
            Toggle the local vision and regex redaction modules below to see how sensitive DOM nodes, faces, and government IDs are masked locally before AI vision agents inspect the page.
          </p>
        </div>

        {/* Interactive Controls Bar */}
        <div className="max-w-4xl mx-auto mb-8 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex flex-wrap items-center gap-2">
            
            <button
              onClick={() => setRedactFaces(!redactFaces)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                redactFaces 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Face Redaction (BlazeFace)</span>
              {redactFaces && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setRedactAadhaar(!redactAadhaar)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                redactAadhaar 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Aadhaar & PAN (Verhoeff)</span>
              {redactAadhaar && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setRedactCards(!redactCards)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                redactCards 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Credit Card (Luhn)</span>
              {redactCards && <Check className="w-3.5 h-3.5" />}
            </button>

          </div>

          <button
            onClick={() => setAgentViewMode(!agentViewMode)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              agentViewMode 
                ? 'bg-slate-900 text-emerald-400 border border-slate-800 shadow-md' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {agentViewMode ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{agentViewMode ? 'AI Agent Inspection View' : 'User Browser View'}</span>
          </button>
        </div>

        {/* Mock Browser Frame Sandbox */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-300 bg-white shadow-xl overflow-hidden">
          
          {/* Browser Header Bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <span className="ml-2 font-mono text-xs text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-600" />
                https://portal.example.gov/applicant-verification
              </span>
            </div>

            {/* Phantom AI Extension Floating Status Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Phantom Shield Active</span>
            </div>
          </div>

          {/* Form Content Area */}
          <div className={`p-6 sm:p-8 transition-colors ${agentViewMode ? 'bg-slate-950 text-slate-200 font-mono' : 'bg-slate-50/50'}`}>
            
            {agentViewMode && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Sanitized LLM Payload Frame (Forwarded to AI Agent)</span>
                </span>
                <span className="font-bold text-[11px] bg-emerald-900 px-2 py-0.5 rounded">0 Raw Secrets Leaked</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Profile Photo with Face Bounding Box & Blur */}
              <div className="md:col-span-1 p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm relative">
                <div className="relative inline-block mx-auto mb-3 overflow-hidden rounded-xl border-2 border-slate-200">
                  
                  {/* Mock User Avatar */}
                  <div className="w-36 h-36 bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center relative">
                    <User className="w-20 h-20 text-slate-400" />
                    
                    {/* Face Redaction Layer */}
                    {redactFaces && (
                      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white border-2 border-emerald-400 rounded-xl transition-all">
                        <ShieldCheck className="w-8 h-8 text-emerald-400 mb-1" />
                        <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-widest">
                          BLAZEFACE
                        </span>
                        <span className="text-[9px] text-slate-300 font-mono">REDACTED</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-700">Applicant Photo</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {redactFaces ? 'Local TensorFlow Blur Active' : 'Unmasked (Exposed)'}
                </div>
              </div>

              {/* Form Data Inputs */}
              <div className="md:col-span-2 space-y-4">
                
                {/* Aadhaar Number Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aadhaar National Identity Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={redactAadhaar ? '████-████-9482 (REDACTED BY VERHOEFF)' : '5892-4910-9482'}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono transition-colors ${
                        redactAadhaar 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {redactAadhaar && (
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-semibold">
                        VERHOEFF OK
                      </span>
                    )}
                  </div>
                </div>

                {/* PAN Number Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Permanent Account Number (PAN)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={redactAadhaar ? 'ABCDE████F (REDACTED)' : 'ABCDE1234F'}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono transition-colors ${
                        redactAadhaar 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Credit Card Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={redactCards ? '4532-████-████-8819 (LUHN MASKED)' : '4532-8901-2234-8819'}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono transition-colors ${
                        redactCards 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {redactCards && (
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-semibold">
                        LUHN PASSED
                      </span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Sandbox Footer Banner */}
          <div className="bg-slate-900 text-slate-300 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Sanitization latency: <strong className="text-white font-mono">1.2ms</strong> (100% Client-Side)</span>
            </span>
            <span className="font-mono text-emerald-400">Zero Server Data Leakage</span>
          </div>

        </div>

      </div>
    </section>
  );
}

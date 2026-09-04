import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function Security() {
  return (
    <div className="py-12 lg:py-16 bg-slate-50/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300 text-xs font-mono font-semibold">
            <Scale className="w-3.5 h-3.5 text-slate-700" />
            <span>Legal & Security Terms</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Security Disclosures & Liability Disclaimer
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Please read the terms below governing the use of Phantom AI, a privacy-preserving browser extension.
          </p>
        </div>

        {/* Required Liability Disclaimer Box */}
        <div className="subtle-card rounded-2xl p-8 bg-white border-2 border-slate-300 mb-12 shadow-lg relative overflow-hidden">
          
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                Disclaimer of Liability
              </h2>
              <p className="text-xs text-slate-500 font-mono">Official Legal Notice</p>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            <p>
              Phantom AI is provided <strong>"as is,"</strong> as a prototype software project, without warranty of any kind, express or implied. The developers make no guarantees regarding the accuracy, completeness, or reliability of the redaction, detection, or autonomous action features.
            </p>
            
            <p>
              This software is intended for use on your own device and data, or with proper authorization where third-party data is involved. Users are solely responsible for how they use this extension, including any actions it takes on their behalf. The developers of Phantom AI are not responsible or liable for any misuse of this software, any data loss, unauthorized access, or damages arising from its use, including but not limited to actions taken on websites where the user does not have proper authorization to use automation tools.
            </p>

            <p>
              By downloading and using Phantom AI, you agree to use it responsibly and in compliance with the terms of service of any website you use it on.
            </p>
          </div>

        </div>

        {/* Technical Security Disclosures Card */}
        <div className="subtle-card rounded-2xl p-8 bg-white border border-slate-200 mb-12 shadow-sm space-y-6">
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Security Model & AI Limitations</span>
          </h2>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>On-Device Model Accuracy</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The face blur module uses TensorFlow BlazeFace running locally in WebGL context. While highly optimized for real-time performance (&lt; 2ms), small or obscured faces in low-resolution screen regions may occasionally go undetected. Always verify sensitive screenshots before submission.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Isolated Content Scripts</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Phantom AI is constructed following Chrome Manifest V3 security standards. Content scripts run in isolated execution worlds, preventing host webpage JavaScript from altering or intercepting the redaction logic.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Responsible AI Automation</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Autonomous form fill and action execution features include user confirmation prompts prior to executing high-privilege actions (e.g. submitting financial payments or changing account passwords).
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Reporting */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-display font-bold text-sm text-white">Responsible Security Disclosure</div>
            <div className="text-slate-400 mt-0.5">Found a security flaw or bug? Report directly on GitHub.</div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}

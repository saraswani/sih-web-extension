import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ShieldCheck, 
  Monitor, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  Layers,
  Lock
} from 'lucide-react';
import { detectUserEnv } from '../utils/browserDetect';

export default function Hero() {
  const env = detectUserEnv();
  const [selectedBrowser, setSelectedBrowser] = useState(env.isFirefox ? 'firefox' : 'chrome');
  const [showInstallAccordion, setShowInstallAccordion] = useState(false);

  const isChromeTarget = selectedBrowser === 'chrome';
  const downloadLink = isChromeTarget 
    ? '/downloads/phantom-ai-chrome.zip' 
    : '/downloads/phantom-ai-firefox.xpi';
  const downloadFileName = isChromeTarget 
    ? 'phantom-ai-chrome.zip' 
    : 'phantom-ai-firefox.xpi';

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/60 bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile Warning Notice */}
        {env.isMobile && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Desktop Browser Required</p>
              <p className="text-amber-800 text-xs mt-0.5">
                Phantom AI is a desktop browser extension. Open this URL on your Mac, Windows, or Linux desktop browser (Chrome, Edge, Brave, or Firefox) to install and use.
              </p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>What shouldn’t be seen, disappears.</span>
          </div>

          {/* Distinctive Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Your screen never leaves your device — <span className="text-emerald-600 underline decoration-emerald-300 underline-offset-8">until it's safe to.</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            <strong className="text-slate-900 font-semibold">What shouldn't be seen, disappears.</strong> Phantom AI redacts faces and sensitive data locally before any AI agent ever sees your screen, then autofills forms for you without exposing what shouldn't leave your browser.
          </p>

          {/* Download Box / CTA Area */}
          <div className="pt-4 flex flex-col items-center gap-4">
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Primary Download Button */}
              <a
                href={downloadLink}
                download={downloadFileName}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 emerald-glow"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Download for {isChromeTarget ? 'Chrome / Edge' : 'Firefox'}</span>
                <span className="text-xs bg-emerald-800/60 px-2 py-0.5 rounded font-mono font-normal">v1.0.0</span>
              </a>

              {/* Secondary Swap Button */}
              <button
                onClick={() => setSelectedBrowser(isChromeTarget ? 'firefox' : 'chrome')}
                className="w-full sm:w-auto px-5 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm transition-colors shadow-sm"
              >
                {isChromeTarget ? 'Using Firefox instead?' : 'Using Chrome / Edge instead?'}
              </button>
            </div>

            {/* Client Courtesy Detection Pill Label */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span>{env.label}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Manifest V3 Package</span>
            </div>

            {/* Toggle Installation Steps Accordion */}
            <button
              onClick={() => setShowInstallAccordion(!showInstallAccordion)}
              className="mt-2 text-xs font-medium text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1.5 underline underline-offset-4 decoration-slate-300"
            >
              <span>{showInstallAccordion ? 'Hide installation steps' : 'How to install manually in 4 simple steps'}</span>
              {showInstallAccordion ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

          </div>

          {/* Collapsible Installation Steps Accordion */}
          {showInstallAccordion && (
            <div className="mt-6 text-left subtle-card rounded-2xl p-6 bg-white/95 max-w-2xl mx-auto border border-emerald-200/80 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Installation Guide: {isChromeTarget ? 'Chrome / Edge / Brave' : 'Firefox'}</span>
                </h3>
                <Link to="/install" className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1">
                  Full Guide <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {isChromeTarget ? (
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-slate-900">Download & Extract</p>
                      <p className="text-xs text-slate-500">Download <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">phantom-ai-chrome.zip</code> and extract the contents to a local folder.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-slate-900">Open Extension Manager</p>
                      <p className="text-xs text-slate-500">Go to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">chrome://extensions</code> in your browser address bar.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-semibold text-slate-900">Enable Developer Mode</p>
                      <p className="text-xs text-slate-500">Toggle the <strong>"Developer mode"</strong> switch in the top-right corner of the extensions page.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      <p className="font-semibold text-slate-900">Load Unpacked Extension</p>
                      <p className="text-xs text-slate-500">Click <strong>"Load unpacked"</strong> and select your unzipped Phantom AI folder. Ready to go!</p>
                    </div>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-slate-900">Download Firefox Package</p>
                      <p className="text-xs text-slate-500">Download <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">phantom-ai-firefox.xpi</code> to your computer.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-slate-900">Open Firefox Debugging</p>
                      <p className="text-xs text-slate-500">Navigate to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">about:debugging#/runtime/this-firefox</code> in Firefox.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-semibold text-slate-900">Load Temporary Add-on</p>
                      <p className="text-xs text-slate-500">Click <strong>"Load Temporary Add-on..."</strong> and select the downloaded manifest or package file.</p>
                    </div>
                  </li>
                </ol>
              )}
            </div>
          )}

          {/* Key Metric Highlights */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-mono uppercase text-slate-400 font-medium">Vision Model</div>
              <div className="text-base font-bold font-display text-slate-900 mt-1">BlazeFace TF.js</div>
              <div className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> On-Device Execution
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-mono uppercase text-slate-400 font-medium">PII Algorithms</div>
              <div className="text-base font-bold font-display text-slate-900 mt-1">Verhoeff & Luhn</div>
              <div className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar & PAN Validated
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-mono uppercase text-slate-400 font-medium">Manifest Standard</div>
              <div className="text-base font-bold font-display text-slate-900 mt-1">Manifest V3</div>
              <div className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Chrome & Firefox
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-mono uppercase text-slate-400 font-medium">Data Boundary</div>
              <div className="text-base font-bold font-display text-slate-900 mt-1">Zero Telemetry</div>
              <div className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Private Sandbox
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

import React, { useState } from 'react';
import ProfileGenerator from '../components/ProfileGenerator';
import { 
  Globe, 
  Compass, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Shield,
  FolderArchive,
  Terminal,
  Sliders,
  Pin
} from 'lucide-react';
import { detectUserEnv } from '../utils/browserDetect';

export default function Install() {
  const env = detectUserEnv();
  const [activeTab, setActiveTab] = useState(env.isFirefox ? 'firefox' : 'chrome');
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Why does Chrome say "This extension is not from the Chrome Web Store"?',
      a: 'During local developer-mode testing (such as hackathon judging or prototype evaluation), Chrome displays a standard warning banner for unpacked extensions. Phantom AI is 100% open-source and runs entirely on your local machine with zero external network tracking.'
    },
    {
      q: 'What permissions does Phantom AI require and why?',
      a: 'Phantom AI requires `activeTab` to inspect DOM elements for PII, `storage` to save your local redaction preferences, and `scripting` to overlay the floating shield UI. It does NOT require global webRequest listening or background network tracking.'
    },
    {
      q: 'How do I pin the Phantom AI icon to my toolbar?',
      a: 'In Chrome or Edge, click the puzzle piece (Extensions) icon in the top right of your browser address bar, locate "Phantom AI Privacy Shield", and click the pushpin icon. This gives you instant access to the redaction control popup.'
    },
    {
      q: 'How do I update to a newer version of the extension?',
      a: 'Simply download the latest `.zip` package from this website or GitHub Releases, extract it to your chosen folder, go to `chrome://extensions`, and click the "Reload" icon on the Phantom AI extension card.'
    }
  ];

  return (
    <div className="py-12 lg:py-16 bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-semibold">
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local Browser Setup Guide</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Installing Phantom AI in Developer Mode.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Follow the simple step-by-step instructions below for your browser to load the unpacked extension locally in under 60 seconds.
          </p>
        </div>

        {/* Browser Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chrome')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display text-sm font-semibold transition-all ${
                activeTab === 'chrome'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Chrome / Edge / Brave</span>
            </button>

            <button
              onClick={() => setActiveTab('firefox')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display text-sm font-semibold transition-all ${
                activeTab === 'firefox'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Mozilla Firefox</span>
            </button>
          </div>
        </div>

        {/* Installation Steps Content */}
        <div className="subtle-card rounded-2xl p-8 bg-white border border-slate-200 shadow-lg mb-16">
          
          {activeTab === 'chrome' ? (
            <div className="space-y-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-slate-900">Chrome / Chromium Installation</h2>
                    <p className="text-xs text-slate-500">Works on Chrome, Microsoft Edge, Brave, and Opera</p>
                  </div>
                </div>

                <a
                  href="/downloads/phantom-ai-chrome.zip"
                  download="phantom-ai-chrome.zip"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .zip</span>
                </a>
              </div>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <FolderArchive className="w-4 h-4 text-emerald-600" />
                      <span>Download and Extract the Package</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Download <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono text-xs font-semibold">phantom-ai-chrome.zip</code> and extract the ZIP archive to a folder on your machine (e.g. <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-xs">C:\phantom-ai-extension</code> or <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-xs">~/phantom-ai-extension</code>).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      <span>Navigate to Chrome Extensions</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Open a new browser tab and type <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-xs text-slate-900 font-bold">chrome://extensions</code> in the URL bar (or <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-xs">edge://extensions</code> for Microsoft Edge).
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>Enable Developer Mode</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      In the top-right corner of the Extensions page, switch the toggle switch labeled <strong>"Developer mode"</strong> to the <strong>ON</strong> position.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Click "Load Unpacked"</span>
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Click the <strong>"Load unpacked"</strong> button in the top-left menu bar and select the extracted <code className="bg-white border border-emerald-300 px-1.5 py-0.5 rounded text-emerald-900 font-mono text-xs font-semibold">phantom-ai-chrome</code> directory. The shield icon will appear in your extensions list!
                    </p>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="space-y-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-slate-900">Firefox Add-on Installation</h2>
                    <p className="text-xs text-slate-500">Works on Firefox Desktop (v109+)</p>
                  </div>
                </div>

                <a
                  href="/downloads/phantom-ai-firefox.xpi"
                  download="phantom-ai-firefox.xpi"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .xpi</span>
                </a>
              </div>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <FolderArchive className="w-4 h-4 text-emerald-600" />
                      <span>Download Firefox Extension Package</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Download <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono text-xs font-semibold">phantom-ai-firefox.xpi</code> to your downloads folder.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      <span>Open Firefox Debugging</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      In Firefox, enter <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-xs text-slate-900 font-bold">about:debugging#/runtime/this-firefox</code> into the address bar.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Load Temporary Add-on</span>
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Click <strong>"Load Temporary Add-on..."</strong> and select the downloaded file or <code className="bg-white border border-emerald-300 px-1.5 py-0.5 rounded text-emerald-900 font-mono text-xs font-semibold">manifest.json</code>. The Phantom AI privacy shield is now active!
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Pre-Configure Profile Section */}
        <div className="mb-16">
          <ProfileGenerator />
        </div>

        {/* Troubleshooting Accordion */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-2xl text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
              <span>Troubleshooting & FAQ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Common developer mode questions answered.</p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="subtle-card rounded-xl bg-white border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left font-display font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

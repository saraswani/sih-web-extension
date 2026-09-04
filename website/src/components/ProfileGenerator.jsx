import React, { useState } from 'react';
import { 
  UserCheck, 
  Download, 
  FileJson, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  Lock, 
  Copy, 
  Check, 
  ShieldCheck,
  FileText,
  User,
  CreditCard,
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function ProfileGenerator() {
  const [profile, setProfile] = useState({
    name: 'Aarav Sharma',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    aadhaar: '2345 6789 0123',
    pan: 'ABCDE1234F',
    passport: 'Z1234567',
    gender: 'Male',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    country: 'India',
    address: 'Flat 402, Lotus Heights, Outer Ring Road, Bengaluru 560103',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    signature: 'Aarav Sharma (Digitally Signed)',
    feedback: 'The portal interface was intuitive and the process was completed seamlessly.'
  });

  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        const parts = value.trim().split(' ');
        updated.first_name = parts[0] || '';
        updated.last_name = parts.slice(1).join(' ') || '';
      }
      return updated;
    });
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify({ mockProfile: profile }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'phantom-profile.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify({ mockProfile: profile }, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="profile-generator" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-mono font-bold">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real-Time Autofill Profile Pre-Configurator</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pre-configure your extension profile before installing.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Fill in your default credentials below to generate your 1-click extension configuration file (<code className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold text-xs">phantom-profile.json</code>). Import it into your extension settings so the AI agent autofills forms in real time on any site!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Setup Controls (7 cols) */}
          <div className="lg:col-span-7 subtle-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-md space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <span>Autofill Profile Credentials</span>
              </h3>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">
                100% Client-Side Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Aarav Sharma"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Aadhaar Number (Verhoeff)</label>
                <input
                  type="text"
                  value={profile.aadhaar}
                  onChange={(e) => handleChange('aadhaar', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="2345 6789 0123"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  value={profile.pan}
                  onChange={(e) => handleChange('pan', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="ABCDE1234F"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Passport / Govt Document ID</label>
                <input
                  type="text"
                  value={profile.passport}
                  onChange={(e) => handleChange('passport', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Z1234567"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bengaluru"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">State / Province</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Karnataka"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Pincode / Zip</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="560103"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Digital Signature</label>
                <input
                  type="text"
                  value={profile.signature}
                  onChange={(e) => handleChange('signature', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Aarav Sharma (Signed)"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Street Address</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Flat 402, Lotus Heights, Outer Ring Road, Bengaluru"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Photo URL / Image Link</label>
                <input
                  type="url"
                  value={profile.photo}
                  onChange={(e) => handleChange('photo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://domain.com/photo.jpg"
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleExportJSON}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm shadow-md transition-all emerald-glow"
              >
                <FileJson className="w-4 h-4" />
                <span>Export Profile Config (phantom-profile.json)</span>
              </button>

              <button
                onClick={handleCopyJSON}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-300"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
              </button>
            </div>

          </div>

          {/* Setup Guide & JSON Code Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 3 Step Import Instructions (High-contrast clean styling) */}
            <div className="subtle-card rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-bold text-white text-base tracking-tight">
                  How to Import into Extension in 3 Steps
                </h3>
              </div>

              <ol className="space-y-4 text-xs font-normal">
                
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-mono font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">
                    1
                  </span>
                  <div className="space-y-1">
                    <div className="text-white font-bold text-sm">Export Config File</div>
                    <div className="text-slate-300 leading-relaxed">
                      Click the green export button to download <code className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold inline-block my-0.5">phantom-profile.json</code> locally.
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-mono font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">
                    2
                  </span>
                  <div className="space-y-1">
                    <div className="text-white font-bold text-sm">Open Extension Settings</div>
                    <div className="text-slate-300 leading-relaxed">
                      Right click the Phantom AI icon in your browser toolbar and select <strong className="text-white font-semibold">Options</strong>.
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-mono font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">
                    3
                  </span>
                  <div className="space-y-1">
                    <div className="text-white font-bold text-sm">Click "Import Profile JSON"</div>
                    <div className="text-slate-300 leading-relaxed">
                      Click <code className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold inline-block my-0.5">📥 Import Profile JSON</code> in Section 5 and select your file. Done!
                    </div>
                  </div>
                </li>

              </ol>
            </div>

            {/* High-Contrast Live JSON Code Preview */}
            <div className="subtle-card rounded-2xl p-5 bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2.5 mb-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  phantom-profile.json (Preview)
                </span>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  100% On-Device Storage
                </span>
              </div>
              
              <pre className="overflow-x-auto max-h-64 text-emerald-300 text-[11px] leading-relaxed font-mono">
{JSON.stringify({ mockProfile: profile }, null, 2)}
              </pre>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

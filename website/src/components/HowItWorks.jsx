import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Scan, 
  Lock, 
  Check, 
  X, 
  ArrowRight,
  Layers,
  Eye,
  FileCheck,
  Server
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Local Screen & DOM Capture',
      desc: 'When an AI agent requests screen context or form details, Phantom AI intercepts the frame inside the browser sandbox before any network packets leave your computer.',
      icon: Scan,
    },
    {
      num: '02',
      title: 'On-Device TF.js & PII Redaction',
      desc: 'Local TensorFlow BlazeFace model locates faces, while Verhoeff (Aadhaar/PAN) and Luhn (Credit Card) algorithms instantly black out sensitive text fields in < 2ms.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Sanitized Context Delivery',
      desc: 'Only the sanitized visual snapshot and redacted text tokens are delivered to the AI LLM endpoint. Raw biometric data and credentials never leave your browser.',
      icon: Lock,
    },
    {
      num: '04',
      title: 'Safe Form Autofill & Action',
      desc: 'The AI agent safely reads the sanitized layout, plans its navigation sequence, and performs form autofill without having ever exposed your private credentials.',
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-20 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Architecture & Security Flow</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Phantom AI guards your privacy in 4 steps.
          </h2>
          <p className="text-slate-600 text-base">
            Designed to provide unbreakable client-side security for autonomous browser agents.
          </p>
        </div>

        {/* 4 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.num}
                className="subtle-card rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono font-extrabold text-2xl text-emerald-600">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
                      <IconComponent className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-semibold">
                  <span>Client-Side Only</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Matrix Table */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-display font-bold text-2xl text-slate-900">
              Traditional AI Agent vs. Phantom AI Guarded Agent
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Why on-device pre-processing is mandatory for privacy compliance.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-display">
                  <th className="py-3.5 px-5 font-semibold">Feature / Risk Layer</th>
                  <th className="py-3.5 px-5 font-semibold text-rose-400 bg-slate-950/60">Standard Agent</th>
                  <th className="py-3.5 px-5 font-semibold text-emerald-400 bg-slate-950">Phantom AI Guarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                
                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Screen & Face Exposure</td>
                  <td className="py-4 px-5 text-rose-700 bg-rose-50/40 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Full unredacted face sent to external LLM</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-emerald-800 bg-emerald-50/40 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>BlazeFace blurred before network dispatch</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Aadhaar & PAN Protection</td>
                  <td className="py-4 px-5 text-rose-700 bg-rose-50/40 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>National ID numbers read in clear text</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-emerald-800 bg-emerald-50/40 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Verhoeff-validated regex blackouts</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Credit Card & Financial PII</td>
                  <td className="py-4 px-5 text-rose-700 bg-rose-50/40 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Raw PAN card & CVV vulnerable to prompt injection</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-emerald-800 bg-emerald-50/40 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Luhn-check masked before model input</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Server Latency & Dependency</td>
                  <td className="py-4 px-5 text-slate-600 bg-slate-50 text-xs">
                    Cloud server dependency required
                  </td>
                  <td className="py-4 px-5 text-emerald-800 bg-emerald-50/40 text-xs font-mono font-semibold">
                    100% On-Device TensorFlow.js (&lt; 2ms)
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

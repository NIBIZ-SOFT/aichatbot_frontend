"use client";

import React from "react";
import { UploadCloud, Code2, Rocket } from "lucide-react";

export default function InstantDeployment() {
  const steps = [
    {
      num: "01",
      title: "Upload Knowledge Base",
      desc: "Upload product specs, service catalogs, policy PDFs, or paste website URLs to train your AI instantly.",
      icon: <UploadCloud className="w-5 h-5 text-indigo-600" />
    },
    {
      num: "02",
      title: "Embed 1-Line Snippet",
      desc: "Copy your custom widget code and paste it before </body> on your WordPress, custom portal, or ERP.",
      icon: <Code2 className="w-5 h-5 text-indigo-600" />
    },
    {
      num: "03",
      title: "Automate Support & Sales",
      desc: "Your AI begins handling inquiries, qualifying leads, taking orders, and routing edge cases 24/7.",
      icon: <Rocket className="w-5 h-5 text-indigo-600" />
    }
  ];

  return (
    <section id="deployment" className="py-10 sm:py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Instant Deployment</h2>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Go Live in Less Than 2 Minutes
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Zero complex server configuration or machine learning setup.
          </p>
        </div>

        {/* 3 Steps Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-2xs relative space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  {step.icon}
                </div>
                <span className="font-mono text-base font-black text-slate-300">
                  {step.num}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

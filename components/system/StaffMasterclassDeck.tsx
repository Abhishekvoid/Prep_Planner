"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStaffMasterclass, StaffMasterclass } from "@/lib/staffMentorVault";
import { renderMarkdown } from "@/lib/markdown";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-cpp";

interface Props {
  topicId: string | null;
  customTitle?: string;
  onClose: () => void;
}

export function StaffMasterclassDeck({ topicId, customTitle, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"internals" | "code" | "gotchas" | "interview">("internals");
  const masterclass: StaffMasterclass | null = topicId ? getStaffMasterclass(topicId, customTitle) : null;

  useEffect(() => {
    if (activeTab === "code" || activeTab === "internals") {
      const timer = setTimeout(() => Prism.highlightAll(), 10);
      return () => clearTimeout(timer);
    }
  }, [activeTab, topicId]);

  if (!topicId || !masterclass) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Slide-Over Drawer Container */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-screen max-w-3xl bg-[#050505] border-l border-white/15 shadow-2xl flex flex-col justify-between text-slate-200"
          >
            {/* Staff Mentor Badge Header */}
            <div className="p-6 border-b border-white/10 bg-[#0E0E12]/90 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    🎓 STAFF ENGINEER MENTOR MASTERCLASS
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    SpaceX • OpenAI • Google Standards
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="font-mono text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  ✕ Close [Esc]
                </button>
              </div>

              <h2 className="font-mono text-2xl font-bold text-slate-100 mt-3">
                {masterclass.topicTitle}
              </h2>
              <p className="font-mono text-xs text-emerald-400 mt-1">
                Zero external search needed — complete 0-to-1 internals, production code, & interview gotchas.
              </p>

              {/* 4-Tab Navigation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-5 bg-zinc-950 p-1.5 rounded-lg border border-white/10 font-mono text-[11px]">
                <button
                  onClick={() => setActiveTab("internals")}
                  className={`py-2 px-2 rounded transition-all font-bold text-center ${
                    activeTab === "internals"
                      ? "bg-slate-200 text-black shadow"
                      : "text-zinc-400 hover:text-slate-200"
                  }`}
                >
                  [1] Internals & Theory
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`py-2 px-2 rounded transition-all font-bold text-center ${
                    activeTab === "code"
                      ? "bg-slate-200 text-black shadow"
                      : "text-zinc-400 hover:text-slate-200"
                  }`}
                >
                  [2] Production Code
                </button>
                <button
                  onClick={() => setActiveTab("gotchas")}
                  className={`py-2 px-2 rounded transition-all font-bold text-center ${
                    activeTab === "gotchas"
                      ? "bg-slate-200 text-black shadow"
                      : "text-zinc-400 hover:text-slate-200"
                  }`}
                >
                  [3] Scale Gotchas
                </button>
                <button
                  onClick={() => setActiveTab("interview")}
                  className={`py-2 px-2 rounded transition-all font-bold text-center ${
                    activeTab === "interview"
                      ? "bg-slate-200 text-black shadow"
                      : "text-zinc-400 hover:text-slate-200"
                  }`}
                >
                  [4] Interview Grilling
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 font-mono text-xs leading-relaxed">
              {/* TAB 1: Internals */}
              {activeTab === "internals" && (
                <div
                  className="bg-[#0A0A0E] border border-white/10 p-6 rounded-lg text-slate-200 leading-relaxed font-mono space-y-4 prose prose-invert max-w-none text-xs"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(masterclass.internalsMarkdown, { codeTheme: "midnight" }),
                  }}
                />
              )}

              {/* TAB 2: Production Code */}
              {activeTab === "code" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] uppercase font-mono px-1">
                    <span>Language: {masterclass.codeLanguage}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(masterclass.productionCode)}
                      className="hover:text-emerald-400 font-bold bg-white/5 border border-white/10 px-2 py-1 rounded"
                    >
                      [Copy Production Code]
                    </button>
                  </div>

                  <div className="code-block-container code-theme-midnight">
                    <pre className="!m-0 !p-4">
                      <code className={`language-${masterclass.codeLanguage}`}>
                        {masterclass.productionCode}
                      </code>
                    </pre>
                  </div>

                  <div className="bg-[#0A0A0E] border border-emerald-500/30 p-4 rounded text-emerald-300">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-1">
                      Staff Engineer Code Annotation:
                    </span>
                    {masterclass.codeExplanation}
                  </div>
                </div>
              )}

              {/* TAB 3: Scale Gotchas & Benchmarks */}
              {activeTab === "gotchas" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
                      ⚠️ Production Failure Modes & Scale Gotchas
                    </h4>
                    <div className="space-y-3">
                      {masterclass.scaleGotchas.map((g, idx) => (
                        <div key={idx} className="bg-zinc-950 border border-rose-500/20 p-4 rounded-lg space-y-2">
                          <h5 className="font-mono text-xs font-bold text-rose-300">
                            {idx + 1}. {g.title}
                          </h5>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">{g.description}</p>
                          <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded text-[10px] text-rose-200">
                            <span className="font-bold uppercase block mb-0.5">Production Impact & Fix:</span>
                            {g.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {masterclass.benchmarks.length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                        ⚡ Real-World Latency Benchmarks
                      </h4>
                      <div className="space-y-2">
                        {masterclass.benchmarks.map((b, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-white/10 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-zinc-300 text-[11px] font-medium">{b.scenario}</span>
                            <div className="flex items-center gap-3 shrink-0 text-[10px]">
                              <span className="text-rose-400 line-through">Unoptimized: {b.unoptimized}</span>
                              <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                                Staff: {b.staffOptimized}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Interview Grilling & Model Answers */}
              {activeTab === "interview" && (
                <div className="space-y-4">
                  <h4 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ⚔️ Google / SpaceX / OpenAI Interview Grilling Questions
                  </h4>
                  <div className="space-y-4">
                    {masterclass.interviewGrilling.map((item, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-white/10 p-4.5 rounded-lg space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-amber-400 shrink-0">Q{idx + 1}:</span>
                          <p className="font-bold text-slate-100 text-xs leading-relaxed">{item.question}</p>
                        </div>

                        <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded text-emerald-200 text-[11px] whitespace-pre-wrap leading-relaxed">
                          <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-1">
                            Staff Engineer Model Answer:
                          </span>
                          {item.staffAnswer}
                        </div>

                        <div className="bg-rose-950/30 border border-rose-500/20 p-2.5 rounded text-[10px] text-rose-300">
                          <span className="font-bold uppercase block mb-0.5">🚩 Red Flags To Avoid:</span>
                          {item.whatRedFlagsToAvoid}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0E0E12] flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-400">
                Staff Masterclass Complete — Zero External Searching Needed
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded bg-slate-200 hover:bg-white text-black font-mono text-xs font-bold transition-all"
              >
                [Got It & Continue Prep]
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

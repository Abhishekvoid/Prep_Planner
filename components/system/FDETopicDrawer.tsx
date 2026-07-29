"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FDE_CURRICULUM, FDETopic } from "@/lib/fdeCurriculum";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-cpp";

import { renderMarkdown } from "@/lib/markdown";

interface Props {
  topicId: string | null;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

export function FDETopicDrawer({ topicId, onClose, onSelectTopic }: Props) {
  const [activeTab, setActiveTab] = useState<"concept" | "code" | "gotchas">("concept");
  const topic: FDETopic | null = topicId ? FDE_CURRICULUM[topicId] ?? DEFAULT_FALLBACK_TOPIC(topicId) : null;

  useEffect(() => {
    if (activeTab === "code" || activeTab === "concept") {
      const timer = setTimeout(() => Prism.highlightAll(), 10);
      return () => clearTimeout(timer);
    }
  }, [activeTab, topicId]);

  if (!topicId || !topic) return null;

  const handleFastForward = () => {
    if (topic.nextTopicId) {
      setActiveTab("concept");
      onSelectTopic(topic.nextTopicId);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Slide-Over Drawer Container */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-screen max-w-2xl bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col justify-between text-slate-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#0E0E12]/80 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Day {topic.dayIndex}: {topic.category}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    ⏱ {topic.readTimeMin} Min Minimum Effective Dose
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="font-mono text-zinc-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10"
                >
                  ✕ Close [Esc]
                </button>
              </div>

              <h2 className="font-mono text-xl font-bold text-slate-100 mt-2.5">
                {topic.title}
              </h2>

              {/* 3-Tab Selector + AI Mentor Launch */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <div className="flex-1 flex gap-1.5 bg-zinc-950 p-1 rounded border border-white/10">
                  {(["concept", "code", "gotchas"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`flex-1 py-1.5 rounded font-mono text-[11px] uppercase transition-all ${
                        activeTab === t
                          ? "bg-slate-200 text-black font-bold shadow"
                          : "text-zinc-400 hover:text-slate-200"
                      }`}
                    >
                      {t === "concept" ? "[1] 0-to-1 Concept" : t === "code" ? "[2] Code Snippet" : "[3] Interview Gotchas"}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(
                      new CustomEvent("open-ai-mentor", {
                        detail: { topicId: topic.id, title: topic.title, day: topic.dayIndex },
                      })
                    );
                  }}
                  className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold px-3 py-1.5 rounded transition-all"
                  title="Launch AI Senior Mentor Socratic Grill for this topic"
                >
                  <span>🔥 Grill Me with AI</span>
                </button>
              </div>
            </div>

            {/* Main Content View */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 font-mono text-xs leading-relaxed">
              {activeTab === "concept" && (
                <div
                  className="bg-[#0A0A0E] border border-white/10 p-5 rounded-lg text-slate-200 leading-relaxed font-mono space-y-3 prose prose-invert max-w-none text-xs"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(topic.concept, { codeTheme: "midnight" }),
                  }}
                />
              )}

              {activeTab === "code" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] uppercase font-mono px-1">
                    <span>Production Language: {topic.codeLanguage}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(topic.codeSnippet)}
                      className="hover:text-emerald-400 font-bold"
                    >
                      [Copy Code]
                    </button>
                  </div>
                  <div className="code-block-container code-theme-midnight">
                    <pre className="!m-0 !p-4">
                      <code className={`language-${topic.codeLanguage}`}>
                        {topic.codeSnippet}
                      </code>
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === "gotchas" && (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ⚠️ FDE Interview Gotchas & Real-World Latency Benchmarks
                  </h4>
                  <ul className="space-y-2.5">
                    {topic.interviewGotchas.map((gotcha, idx) => (
                      <li
                        key={idx}
                        className="bg-zinc-950 border border-white/10 p-3 rounded text-slate-200 leading-relaxed font-mono text-xs"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(gotcha, { codeTheme: "midnight" }),
                        }}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer with Anti-Quitting Fast-Forward Button */}
            <div className="p-4 border-t border-white/10 bg-[#0E0E12] flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-400">
                Minimum Effective Dose Complete
              </span>

              {topic.nextTopicId ? (
                <button
                  onClick={handleFastForward}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  <span>[Next High-ROI Topic]</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-white text-black font-mono text-xs font-bold"
                >
                  [Finish Prep]
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

function DEFAULT_FALLBACK_TOPIC(id: string): FDETopic {
  return {
    id,
    dayIndex: 1,
    title: id.toUpperCase().replace(/-/g, " "),
    category: "RAG & AI Systems",
    readTimeMin: 10,
    concept: `### 0-to-1 Concept: ${id}

Mastering the minimum effective dose of ${id} for Systems & FDE roles.

1. **Fundamental Mechanism**: Core data flow and runtime properties.
2. **Interview Standard**: High-concurrency constraints & failure recovery.`,
    codeLanguage: "typescript",
    codeSnippet: `// 0-to-1 Minimum Effective Dose for ${id}
export async function executeFDEPipeline(input: any) {
  // 1. Process data through low-latency queue
  const result = await processTask(input);
  return { status: "PROVEN", result };
}`,
    interviewGotchas: [
      `Key gotcha for ${id}: Always measure memory allocation bandwidth under high load.`,
      `Interview target: Complete architecture explanation within 3 minutes.`
    ],
  };
}

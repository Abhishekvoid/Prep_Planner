"use client";

import React, { useState } from "react";
import { X, Code, Play, FileCode } from "@phosphor-icons/react";
import { useMentorStore } from "@/lib/mentorStore";

export function CodeReviewDrawer() {
  const {
    isCodeDrawerOpen,
    toggleCodeDrawer,
    codeForReview,
    setCodeForReview,
    codeLanguage,
    setMode,
    addMessage,
  } = useMentorStore();

  const [localCode, setLocalCode] = useState(codeForReview || "");
  const [localLang, setLocalLang] = useState(codeLanguage || "typescript");

  if (!isCodeDrawerOpen) return null;

  const handleSubmitReview = () => {
    if (!localCode.trim()) return;
    setCodeForReview(localCode, localLang);
    setMode("code-review");
    toggleCodeDrawer(false);

    // Send code message to thread
    const userPrompt = `Please perform a production-grade code review of my implementation below in ${localLang}.\n\n\`\`\`${localLang}\n${localCode}\n\`\`\``;
    addMessage("user", userPrompt, "code-review");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-coffee/20 bg-[#121316] p-6 text-cream shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Code size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cream">Code Review Workbench</h2>
              <p className="text-xs text-cream/60">
                Submit implementation snippets for production-grade edge case & concurrency analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleCodeDrawer(false)}
            className="rounded-lg p-2 text-cream/60 hover:bg-white/10 hover:text-cream transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="my-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-amber-400" />
            <span className="text-xs font-medium text-cream/70">Language:</span>
            <select
              value={localLang}
              onChange={(e) => setLocalLang(e.target.value)}
              className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-cream focus:border-amber-400 focus:outline-none"
            >
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="rust">Rust</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <button
            onClick={() => {
              setLocalCode(`// Example: High-concurrency Token Bucket Rate Limiter
class TokenBucket {
  private capacity: number;
  private refillRate: number; // tokens per second
  private tokens: number;
  private lastRefill: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  public allowRequest(tokensRequested = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsedSec * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}`);
            }}
            className="text-xs text-amber-400/80 hover:text-amber-300 underline"
          >
            Insert Sample Snippet
          </button>
        </div>

        {/* Code Editor Area */}
        <div className="relative flex-1 rounded-xl border border-white/10 bg-[#0a0b0d] p-4 font-mono text-xs shadow-inner">
          <textarea
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value)}
            placeholder="// Paste your backend implementation here (e.g. WAL writer, Cache eviction, Thread pool, LRU, etc.)"
            className="h-full w-full resize-none bg-transparent text-cream/90 placeholder-cream/30 focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-xs text-cream/50">
            {localCode.split("\n").length} lines | {localCode.length} chars
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleCodeDrawer(false)}
              className="rounded-lg px-4 py-2 text-xs text-cream/70 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={!localCode.trim()}
              className="flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-semibold text-black shadow-lg disabled:opacity-50 transition-colors"
            >
              <Play size={16} weight="fill" />
              Request Production Code Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  PaperPlaneTilt,
  Code,
  Gear,
  Key,
  Flame,
  Trash,
  Stack,
  TerminalWindow,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { useMentorStore } from "@/lib/mentorStore";
import { MentorMode } from "@/lib/ai/prompt";
import { CodeReviewDrawer } from "./system/CodeReviewDrawer";

const STRUCTURE_STEPS = [
  "1. Problem",
  "2. Why Naive Fails",
  "3. First Principles",
  "4. Internals",
  "5. Visual Model",
  "6. Production Uses",
  "7. Trade-offs",
  "8. Live Coding",
  "9. Debugging",
  "10. Optimization",
  "11. Interview Qs",
  "12. Mistakes",
  "13. Quiz",
];

const PRESET_TOPICS = [
  { id: "general-backend", title: "General Backend & Systems Design", day: 1 },
  { id: "fde-01", title: "DB Internals & Indexing (B-Trees vs LSM)", day: 2 },
  { id: "fde-02", title: "Distributed Consensus (Raft & Paxos)", day: 3 },
  { id: "fde-03", title: "Caching & Consistency (Write-Through vs Write-Back)", day: 4 },
  { id: "fde-04", title: "Message Queues & Event Streaming (Kafka vs RabbitMQ)", day: 5 },
  { id: "fde-05", title: "Rate Limiting & Token Buckets at Scale", day: 6 },
  { id: "fde-06", title: "WAL & Crash Recovery Mechanisms", day: 7 },
  { id: "fde-07", title: "Memory Allocation & GC Profiling", day: 8 },
  { id: "fde-08", title: "Load Balancing & Consistency Hashing", day: 9 },
  { id: "fde-09", title: "AI Systems Infrastructure & Vector Search", day: 10 },
];

export function MentorView() {
  const {
    activeTopicId,
    activeTopicContext,
    activeMode,
    threads,
    customApiKey,
    provider,
    selectedModel,
    isStreaming,
    setActiveTopic,
    setMode,
    setCustomApiKey,
    setProvider,
    setSelectedModel,
    addMessage,
    appendToLastMessage,
    setLastMessageContent,
    setStreaming,
    toggleCodeDrawer,
    clearCurrentThread,
  } = useMentorStore();

  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = threads[activeTopicId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isStreaming]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    if (!textToSend) setInput("");

    // Add user message
    addMessage("user", query, activeMode);

    // Add placeholder assistant message
    addMessage("assistant", "", activeMode);
    setStreaming(true);

    try {
      const payloadMessages = [...currentMessages, { role: "user", content: query }].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          mode: activeMode,
          topicContext: activeTopicContext || { id: activeTopicId },
          apiKey: customApiKey,
          provider,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error === "NO_API_KEY") {
          setLastMessageContent(
            "⚠️ **API Key Required**: No API key was found in environment or local settings.\n\nPlease click the **Settings ⚙️** icon in the top right to configure your OpenAI, Groq, or OpenRouter key."
          );
        } else {
          setLastMessageContent(
            `⚠️ **API Error (${res.status})**: ${errorData.message || "Failed to reach AI service."}`
          );
        }
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body reader");

      const decoder = new TextDecoder("utf-8");
      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const contentChunk = parsed.choices?.[0]?.delta?.content || "";
                if (contentChunk) {
                  fullText += contentChunk;
                  appendToLastMessage(contentChunk);
                }
              } catch {
                // Ignore parse errors for raw stream fragments
              }
            }
          }
        }
      }

      if (!fullText) {
        setLastMessageContent(
          "I have processed your query. Let's analyze the first principles of this problem."
        );
      }
    } catch (err: any) {
      setLastMessageContent(`⚠️ Connection error: ${err.message}`);
    } finally {
      setStreaming(false);
    }
  };

  const handleSaveSettings = () => {
    setCustomApiKey(apiKeyInput.trim());
    setShowSettings(false);
  };

  return (
    <div className="relative flex h-[calc(100vh-100px)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e11] text-cream font-sans shadow-2xl">
      <CodeReviewDrawer />

      {/* TOP HEADER */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#14151a]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md">
            <Brain size={22} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-cream">Senior Backend Engineering Mentor</h1>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                10-Day Sprint
              </span>
            </div>
            <p className="text-xs text-cream/60">
              Socratic learning • First Principles • Production Code Reviews • Mock Interviews
            </p>
          </div>
        </div>

        {/* MODE TOGGLES & ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => setMode("grill")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeMode === "grill"
                  ? "bg-amber-500 text-black font-semibold shadow-md"
                  : "text-cream/70 hover:text-cream"
              }`}
            >
              <Flame size={14} weight={activeMode === "grill" ? "fill" : "regular"} />
              Socratic Grill
            </button>
            <button
              onClick={() => setMode("code-review")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeMode === "code-review"
                  ? "bg-amber-500 text-black font-semibold shadow-md"
                  : "text-cream/70 hover:text-cream"
              }`}
            >
              <Code size={14} weight={activeMode === "code-review" ? "fill" : "regular"} />
              Code Review
            </button>
            <button
              onClick={() => setMode("mock-interview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeMode === "mock-interview"
                  ? "bg-amber-500 text-black font-semibold shadow-md"
                  : "text-cream/70 hover:text-cream"
              }`}
            >
              <TerminalWindow size={14} weight={activeMode === "mock-interview" ? "fill" : "regular"} />
              Mock Interview
            </button>
          </div>

          <button
            onClick={() => toggleCodeDrawer(true)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Code size={14} />
            Code Workbench
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-cream/70 hover:bg-white/10 hover:text-cream transition-colors"
            title="Configure API Key"
          >
            <Gear size={16} />
          </button>

          <button
            onClick={clearCurrentThread}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-cream/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Clear Chat Thread"
          >
            <Trash size={16} />
          </button>
        </div>
      </header>

      {/* SUB-BAR: TOPIC CONTEXT & 13-STEP PROGRESS */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 bg-[#101115] px-6 py-2.5 gap-3">
        <div className="flex items-center gap-2">
          <Stack size={16} className="text-amber-400" />
          <span className="text-xs font-semibold text-cream/60">Active Topic:</span>
          <select
            value={activeTopicId}
            onChange={(e) => {
              const selected = PRESET_TOPICS.find((t) => t.id === e.target.value);
              if (selected) {
                setActiveTopic(selected.id, {
                  id: selected.id,
                  title: selected.title,
                  sprintDay: selected.day,
                });
              }
            }}
            className="rounded-lg border border-white/10 bg-black/50 px-3 py-1 text-xs text-cream focus:border-amber-400 focus:outline-none"
          >
            {PRESET_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                Day {t.day}: {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* 13-STEP STRUCTURE PROGRESS TRACKER */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto text-[10px]">
          {STRUCTURE_STEPS.map((step, idx) => (
            <span
              key={idx}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-cream/50 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* SETTINGS MODAL OVERLAY */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#16181d] p-6 text-cream shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Key size={20} className="text-amber-400" />
              <h3 className="text-lg font-bold">AI Mentor API Settings</h3>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-cream/70">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-cream"
                >
                  <option value="gemini">Google Gemini (gemini-1.5-pro / 2.0-flash)</option>
                  <option value="groq">Groq (llama-3.3-70b-versatile)</option>
                  <option value="openrouter">OpenRouter (Multiple Models)</option>
                  <option value="openai">OpenAI (gpt-4o-mini / gpt-4o)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-cream/70">Custom API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-... or gsk_..."
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-cream placeholder-cream/30 focus:border-amber-400 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-cream/40">
                  Optional: If set in your `.env.local`, leave this empty.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg px-4 py-2 text-xs text-cream/70 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MESSAGES THREAD */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Brain size={18} weight="fill" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500/15 border border-amber-500/30 text-cream"
                  : "bg-[#16181e] border border-white/10 text-cream/90 shadow-lg"
              }`}
            >
              {msg.mode && (
                <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-400/80">
                  {msg.mode === "code-review" && <Code size={12} />}
                  {msg.mode === "mock-interview" && <TerminalWindow size={12} />}
                  {msg.mode === "grill" && <Flame size={12} />}
                  {msg.mode} mode
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              <div className="mt-3 text-[10px] text-cream/30">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cream border border-white/20 font-bold text-xs">
                You
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 bg-[#111216] px-6 py-2">
        <span className="text-[11px] font-semibold text-cream/40">Quick Action:</span>
        <button
          onClick={() => handleSendMessage("Give me a subtle hint to solve this, don't reveal the code yet.")}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cream/80 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
        >
          💡 Ask for Hint
        </button>
        <button
          onClick={() => handleSendMessage("What are the core computer science First Principles behind this topic?")}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cream/80 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
        >
          🔬 First Principles
        </button>
        <button
          onClick={() => handleSendMessage("Give me an L6 Senior Backend interview question on this topic.")}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cream/80 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
        >
          🎯 L6 Interview Question
        </button>
        <button
          onClick={() => handleSendMessage("What are the production trade-offs (latency vs memory vs throughput)?")}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cream/80 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
        >
          ⚖️ Production Trade-offs
        </button>
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-white/10 bg-[#14151a] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={
              activeMode === "code-review"
                ? "Ask about code optimizations, memory leaks, or open Code Workbench..."
                : activeMode === "mock-interview"
                ? "Answer the interviewer or ask a clarifying system question..."
                : "Ask or answer a first-principles question (e.g. 'How does WAL guarantee crash recovery?')"
            }
            className="w-full rounded-2xl border border-white/15 bg-black/60 py-3.5 pl-5 pr-14 text-sm text-cream placeholder-cream/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 transition-colors shadow-md"
          >
            {isStreaming ? (
              <ArrowsClockwise size={16} className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={16} weight="fill" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, FileSearch, ArrowUpRight, RotateCcw } from "lucide-react";

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";

type Mode = "ask" | "documents";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; category: string; time: string }[];
}

const SUGGESTED = [
  "What happened at the security summit?",
  "Explain the Fed's policy shift",
  "Latest on AI regulation",
  "Climate news this week",
  "Who are the key figures in the NATO debate?",
  "How does the semiconductor deal affect markets?",
];

const DOC_RESULTS = [
  {
    id: "DOC-2026-0471",
    title: "Operation Nexus — Internal Communications",
    classification: "CONFIDENTIAL",
    date: "Jun 2026",
    pages: 847,
    desc: "Diplomatic cables between senior officials discussing pre-summit negotiations and undisclosed concessions.",
    redacted: true,
  },
  {
    id: "DOC-2026-0389",
    title: "Project Shield Financial Records",
    classification: "RESTRICTED",
    date: "May 2026",
    pages: 2340,
    desc: "Cross-border financial transfers linked to defense procurement contracts across 12 jurisdictions.",
    redacted: false,
  },
  {
    id: "DOC-2026-0301",
    title: "The Brussels Intercepts",
    classification: "TOP SECRET",
    date: "Apr 2026",
    pages: 412,
    desc: "Intercepted communications from multilateral climate finance negotiations revealing undisclosed lobbying.",
    redacted: true,
  },
];

function buildResponse(query: string): { text: string; sources: Message["sources"] } {
  const q = query.toLowerCase();

  if (q.match(/summit|security|agreement|treaty|78 nation/)) {
    return {
      text: `The Global Security Framework signed on June 28, 2026 represents the most sweeping multinational security agreement since the founding of NATO. After three days of negotiations in Geneva, 78 nations endorsed binding commitments across three pillars:\n\n**1. Intelligence Sharing** — Real-time threat data exchange between signatory states through a new encrypted network.\n\n**2. Joint Response Protocols** — A 72-hour collective response window for designated threat categories.\n\n**3. Cyber Defense Compact** — Mutual obligations on critical infrastructure protection.\n\nNotably absent: China and Russia, though both have been invited to observer status. The framework will be reviewed annually.`,
      sources: [
        { title: "Summit of World Leaders Reaches Historic Agreement", category: "World", time: "2h ago" },
        { title: "NATO Allies Debate Expansion of Eastern European Defense Perimeter", category: "World", time: "3h ago" },
        { title: "Inside the Summit (Video)", category: "World", time: "Today" },
      ],
    };
  }
  if (q.match(/fed|federal reserve|rate|inflation|interest|monetary/)) {
    return {
      text: `The Federal Reserve's June 2026 minutes signal a pivot away from the rate tightening cycle that began in late 2024. Key takeaways:\n\n**Pause likely through Q3** — Board members cited declining core PCE and softening labor market data as justification.\n\n**Not a cut** — Chair language carefully avoids signaling imminent reductions. Markets are pricing in one 25bp cut by November.\n\n**Global coordination** — The ECB and Bank of England issued coordinated statements, suggesting synchronised policy easing could begin in Q4.\n\nIMF's simultaneous downgrade to 2.8% global growth complicates the picture — easing too early risks re-igniting inflation.`,
      sources: [
        { title: "Central Banks Signal Coordinated Rate Shift", category: "Business", time: "4h ago" },
        { title: "IMF Downgrades Global Growth Forecast", category: "Business", time: "2h ago" },
        { title: "Dollar Strengthens as Fed Minutes Signal Prolonged Tightening", category: "Business", time: "1h ago" },
      ],
    };
  }
  if (q.match(/ai|artificial intelligence|regulation|agi|openai/)) {
    return {
      text: `Three concurrent AI regulatory frameworks passed this week across major economies:\n\n**United States** — The AI Accountability Act requires frontier model developers to submit to mandatory third-party audits before deployment. Penalties up to $50M per violation.\n\n**European Union** — An emergency amendment to the EU AI Act adds a new "Tier 0" category for systems demonstrating general reasoning capabilities.\n\n**China** — The State Council issued new guidelines requiring all AI models to be registered with the Cyberspace Administration, with additional restrictions on cross-border model transfer.\n\nSeparately, an unnamed startup claims to have crossed the AGI threshold — independent verification is ongoing and contested.`,
      sources: [
        { title: "Landmark AI Regulation Passes in Three Economies", category: "Tech", time: "5h ago" },
        { title: "OpenAI Rival Claims AGI Threshold Met in Lab", category: "Tech", time: "1h ago" },
        { title: "The Case for a Global AI Moratorium", category: "Opinion", time: "Today" },
      ],
    };
  }
  if (q.match(/climate|arctic|ice|carbon|environment|green/)) {
    return {
      text: `Two significant climate developments emerged this week:\n\n**Arctic Ice Recovery** — NASA satellite data shows a 12% recovery in multi-year Arctic sea ice extent compared to the 2024 seasonal minimum — the fastest partial recovery on record. Scientists caution this does not reverse long-term trends.\n\n**EU Carbon Border Tax** — The Carbon Border Adjustment Mechanism (CBAM) entered full force on July 1, imposing carbon pricing on imports of steel, cement, fertilisers, aluminium, electricity, and hydrogen from non-EU countries. Early modelling suggests this will redirect approximately $180B in global trade flows annually.`,
      sources: [
        { title: "Arctic Ice Sheet Records Fastest Partial Recovery", category: "Climate", time: "6h ago" },
        { title: "EU Carbon Border Tax Takes Effect", category: "Climate", time: "5h ago" },
        { title: "The Science Behind Arctic Ice Recovery (Video)", category: "Climate", time: "Today" },
      ],
    };
  }

  return {
    text: `Here's a summary of the most significant stories across Y-O-X today, June 30, 2026:\n\n**World** — 78 nations signed a landmark global security framework in Geneva after three days of negotiations. NATO allies are debating expanded Article 5 protections.\n\n**Business** — The IMF trimmed global growth to 2.8%. The Fed minutes signal a pause in rate hikes. A $200B semiconductor consortium was announced.\n\n**Technology** — A startup claims to have reached AGI. AI regulations passed simultaneously in the US, EU, and China. A 5-city quantum internet pilot launched in Europe.\n\n**Climate** — Arctic ice showed its fastest partial recovery in the satellite era. The EU carbon border tax took effect.\n\nAsk me about any of these topics for a deeper analysis.`,
    sources: [
      { title: "Summit of World Leaders Reaches Historic Agreement", category: "World", time: "2h ago" },
      { title: "IMF Downgrades Global Growth Forecast", category: "Business", time: "2h ago" },
      { title: "OpenAI Rival Claims AGI Threshold Met", category: "Tech", time: "1h ago" },
    ],
  };
}

interface AISearchProps {
  open: boolean;
  onClose: () => void;
}

export function AISearch({ open, onClose }: AISearchProps) {
  const [mode, setMode] = useState<Mode>("ask");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [typingId, setTypingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText]);

  // Typewriter effect
  useEffect(() => {
    if (!typingId) return;
    const msg = messages.find((m) => m.id === typingId);
    if (!msg) return;
    let i = 0;
    setDisplayedText("");
    const tick = setInterval(() => {
      i++;
      setDisplayedText(msg.content.slice(0, i));
      if (i >= msg.content.length) {
        clearInterval(tick);
        setTypingId(null);
      }
    }, 8);
    return () => clearInterval(tick);
  }, [typingId]);

  const submit = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 900));
    const { text, sources } = buildResponse(userMsg.content);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: text,
      sources,
    };
    setMessages((m) => [...m, aiMsg]);
    setTypingId(aiMsg.id);
    setLoading(false);
  };

  const reset = () => {
    setMessages([]);
    setDisplayedText("");
    setTypingId(null);
    setInput("");
  };

  const formatMd = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} className="font-semibold text-white mt-3 mb-1 text-[14px]">{line.replace(/\*\*/g, "")}</p>;
      if (line.match(/^\*\*(.+)\*\* —/)) {
        const [bold, rest] = line.split(" — ", 2);
        return <p key={i} className="text-[13px] mb-1.5 leading-relaxed text-white/70"><span className="text-white font-semibold">{bold.replace(/\*\*/g, "")}</span> — {rest}</p>;
      }
      if (line === "") return <div key={i} className="h-1.5" />;
      return <p key={i} className="text-[13px] leading-relaxed text-white/70">{line}</p>;
    });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080808]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <div
              className="text-white text-[15px] leading-none"
              style={{ fontFamily: AVENIR, fontWeight: 900 }}
            >
              Y-O-X Intelligence
            </div>
            <div className="text-[10px] text-white/30 tracking-wide mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AI-powered news analysis
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={reset} className="text-white/30 hover:text-white/60 p-1.5 transition-colors">
              <RotateCcw size={14} />
            </button>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white p-1.5 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-white/8">
        {(["ask", "documents"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] tracking-[0.15em] uppercase transition-colors border-b-2 ${mode === m ? "border-white text-white" : "border-transparent text-white/30"}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            {m === "ask" ? <Sparkles size={12} /> : <FileSearch size={12} />}
            {m === "ask" ? "Ask AI" : "Search Documents"}
          </button>
        ))}
      </div>

      {mode === "ask" ? (
        <>
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
                <div className="text-center">
                  <div
                    className="text-white/8 text-[56px] leading-none mb-4"
                    style={{ fontFamily: AVENIR, fontWeight: 900, letterSpacing: "-0.03em" }}
                  >
                    Ask anything.
                  </div>
                  <p className="text-white/30 text-[13px] leading-relaxed max-w-xs mx-auto">
                    Get AI-synthesized analysis on any story, topic, or event — grounded in today's reporting.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-[11px] text-white/50 border border-white/10 px-3 py-1.5 hover:border-white/30 hover:text-white/80 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div
                          className="bg-white/10 text-white text-[14px] px-4 py-2.5 max-w-[80%] leading-relaxed"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
                            <Sparkles size={10} className="text-white/60" />
                          </div>
                          <span className="text-[10px] text-white/30 tracking-wider uppercase"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                            Y-O-X AI
                          </span>
                        </div>
                        <div className="pl-7">
                          {formatMd(msg.id === typingId ? displayedText : msg.content)}
                          {msg.id !== typingId && msg.sources && (
                            <div className="mt-4 border-t border-white/8 pt-3">
                              <div className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-2"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                                Sources
                              </div>
                              {msg.sources.map((src, si) => (
                                <a key={si} href="#" className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                                  <div>
                                    <span className="text-[12px] text-white/60 group-hover:text-white transition-colors block leading-snug">
                                      {src.title}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[9px] text-white/25">{src.category}</span>
                                      <span className="text-white/15">·</span>
                                      <span className="text-[9px] text-white/25">{src.time}</span>
                                    </div>
                                  </div>
                                  <ArrowUpRight size={12} className="text-white/20 group-hover:text-white/50 shrink-0 ml-2" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 pl-7">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-white/25">Analyzing...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-5 pb-6 pt-3 border-t border-white/8">
            <div className="flex items-center gap-3 bg-white/6 border border-white/10 px-4 py-3 focus-within:border-white/25 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Ask about any story or topic..."
                className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder-white/25"
              />
              <button
                onClick={submit}
                disabled={!input.trim() || loading}
                className="text-white/40 hover:text-white disabled:opacity-20 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-white/15 mt-2 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              Y-O-X AI may produce inaccuracies. Always verify with primary sources.
            </p>
          </div>
        </>
      ) : (
        /* Documents search */
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3 bg-white/6 border border-white/10 px-4 py-3 mb-4">
              <FileSearch size={15} className="text-white/30 shrink-0" />
              <input
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                placeholder="Search leaked documents, cables, files..."
                className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder-white/25"
              />
            </div>
            <p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Y-O-X Documents contains verified leaked files, diplomatic cables, and investigative source material.
              Submissions are end-to-end encrypted.
            </p>
          </div>

          <div className="flex-1 px-5 pb-6 flex flex-col gap-3">
            {DOC_RESULTS.map((doc) => (
              <a
                key={doc.id}
                href="#"
                className="group border border-white/8 hover:border-white/20 p-4 transition-colors block"
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[9px] font-mono text-white/30"
                  >
                    {doc.id}
                  </span>
                  <span
                    className={`text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 ${
                      doc.classification === "TOP SECRET"
                        ? "bg-[#FF2D20]/20 text-[#FF2D20] border border-[#FF2D20]/30"
                        : doc.classification === "CONFIDENTIAL"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                        : "bg-white/8 text-white/40 border border-white/10"
                    }`}
                    style={{ fontFamily: "monospace", letterSpacing: "0.15em" }}
                  >
                    {doc.classification}
                  </span>
                </div>
                <h4
                  className="text-[14px] text-white/80 group-hover:text-white transition-colors mb-1.5 leading-snug"
                  style={{ fontFamily: AVENIR, fontWeight: 700 }}
                >
                  {doc.title}
                </h4>
                <p className="text-[12px] text-white/35 leading-relaxed mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {doc.desc}
                </p>
                {doc.redacted && (
                  <div className="flex gap-1 mb-3">
                    {["██████████", "████", "███████████████", "███"].map((bar, i) => (
                      <span key={i} className="text-[10px] font-mono text-white/20 bg-white/10 px-1">{bar}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-white/25"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span>{doc.pages.toLocaleString()} pages · {doc.date}</span>
                  <span className="flex items-center gap-1 group-hover:text-white/50 transition-colors">
                    View documents <ArrowUpRight size={10} />
                  </span>
                </div>
              </a>
            ))}

            <a
              href="#"
              className="border border-dashed border-white/10 hover:border-white/25 p-4 text-center transition-colors mt-2"
            >
              <div className="text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-white/50"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                + Submit Documents Securely
              </div>
              <p className="text-[10px] text-white/15 mt-1">256-bit E2E encryption · Zero metadata logging</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

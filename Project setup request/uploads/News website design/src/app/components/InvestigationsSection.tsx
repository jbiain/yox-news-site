import { useState } from "react";
import { Shield, ArrowUpRight, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";

const investigations = [
  {
    id: "YOX-INV-2026-047",
    code: "OPERATION NEXUS",
    title: "The Shadow Diplomacy Files",
    classification: "CONFIDENTIAL",
    classColor: "#F59E0B",
    summary:
      "Internal communications between senior government officials reveal a parallel negotiating track that preceded the public security summit — including undisclosed concessions on technology transfer and intelligence access.",
    excerpt: "...parties agreed that the ██████████ provisions would not be disclosed to ████████ until after the ratification period. The financial arrangement totalling ████ was to be routed through ████████████ in ████████...",
    files: 2847,
    sources: 4,
    date: "Jun 28, 2026",
    tags: ["Diplomacy", "Security Summit", "Intelligence"],
    verified: true,
  },
  {
    id: "YOX-INV-2026-031",
    code: "PROJECT PHANTOM",
    title: "The Offshore Capital Network",
    classification: "RESTRICTED",
    classColor: "#0052CC",
    summary:
      "A leak of 1.2 million financial records traces $4.7 trillion in assets through 47 shell-company jurisdictions, connecting 340 current and former public officials across 22 countries.",
    excerpt: "Account ref ████-████-0047 received wire transfers totalling ████████ from counterparties in ████████, ████████, and ████████ between ████████ and ████████...",
    files: 1200000,
    sources: 11,
    date: "Jun 15, 2026",
    tags: ["Finance", "Corruption", "Tax Havens"],
    verified: true,
  },
  {
    id: "YOX-INV-2026-019",
    code: "THE BRUSSELS INTERCEPTS",
    title: "Climate Finance — The Hidden Lobbying",
    classification: "TOP SECRET",
    classColor: "#FF2D20",
    summary:
      "Intercepted communications from multilateral climate finance negotiations reveal systematic lobbying by fossil fuel interests through front organisations, undermining publicly pledged commitments.",
    excerpt: "Communication dated ████████: 'The delegation has confirmed they will block Amendment ██ in exchange for the ████████████████████ arrangement. Recommend proceeding with ████████ as planned.'",
    files: 412,
    sources: 3,
    date: "Apr 2, 2026",
    tags: ["Climate", "Lobbying", "Energy Policy"],
    verified: false,
  },
  {
    id: "YOX-INV-2026-008",
    code: "SILICON CURTAIN",
    title: "The AI Lab Security Failures",
    classification: "CONFIDENTIAL",
    classColor: "#F59E0B",
    summary:
      "Internal audit documents from three major AI laboratories show systemic security protocol failures, including unauthorized model weight exfiltration and undisclosed capability discoveries withheld from regulators.",
    excerpt: "Incident log ████████: Model ████████ demonstrated ████████████ capabilities during red-team evaluation on ████████. Decision made to ████████ findings. Authorized by ████████...",
    files: 623,
    sources: 6,
    date: "Mar 18, 2026",
    tags: ["Technology", "AI Safety", "Regulation"],
    verified: true,
  },
];

export function InvestigationsSection() {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  return (
    <section className="bg-[#050505] border-t border-white/5 px-5 md:px-10 py-14">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-8 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Shield size={14} className="text-[#FF2D20]" />
              <span
                className="text-[10px] tracking-[0.3em] uppercase text-[#FF2D20]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                Verified Source Material
              </span>
            </div>
            <h2
              className="text-white leading-none tracking-[-0.03em]"
              style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(32px, 5vw, 56px)" }}
            >
              Investigations
            </h2>
            <p
              className="text-white/30 text-[13px] leading-relaxed mt-3 max-w-md"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
            >
              Original investigative journalism backed by primary source documents. All material is independently
              verified and published in the public interest.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <a
              href="#"
              className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white border border-white/15 px-4 py-2.5 hover:bg-white hover:text-black transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              <Lock size={11} /> Submit Documents
            </a>
            <p className="text-[10px] text-white/20" style={{ fontFamily: "'Inter', sans-serif" }}>
              256-bit E2E · Zero metadata
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investigations.map((inv) => {
            const isRevealed = revealedId === inv.id;
            return (
              <div
                key={inv.id}
                className="border border-white/8 hover:border-white/18 transition-colors group flex flex-col"
              >
                {/* Card header */}
                <div className="flex items-start justify-between p-4 border-b border-white/6">
                  <div>
                    <div
                      className="text-[9px] font-mono text-white/25 mb-1"
                    >
                      {inv.id}
                    </div>
                    <div
                      className="text-[10px] tracking-[0.18em] uppercase text-white/40"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      {inv.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.verified && (
                      <span
                        className="text-[8px] tracking-[0.15em] uppercase px-1.5 py-0.5 border text-green-400 border-green-500/30 bg-green-500/10"
                        style={{ fontFamily: "monospace" }}
                      >
                        VERIFIED
                      </span>
                    )}
                    <span
                      className="text-[8px] tracking-[0.15em] uppercase px-1.5 py-0.5 border"
                      style={{
                        fontFamily: "monospace",
                        color: inv.classColor,
                        borderColor: `${inv.classColor}40`,
                        backgroundColor: `${inv.classColor}15`,
                      }}
                    >
                      {inv.classification}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    className="text-white/90 leading-snug tracking-[-0.02em] mb-2 group-hover:text-white transition-colors"
                    style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "18px" }}
                  >
                    {inv.title}
                  </h3>
                  <p
                    className="text-[12px] text-white/40 leading-relaxed mb-4"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                  >
                    {inv.summary}
                  </p>

                  {/* Redacted excerpt */}
                  <div className="bg-white/[0.03] border border-white/6 p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">
                        Source excerpt — REDACTED
                      </span>
                      <button
                        onClick={() => setRevealedId(isRevealed ? null : inv.id)}
                        className="text-white/20 hover:text-white/50 transition-colors"
                      >
                        {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{
                        fontFamily: "monospace",
                        color: isRevealed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                        filter: isRevealed ? "none" : "blur(3px)",
                        transition: "all 0.3s",
                        userSelect: isRevealed ? "text" : "none",
                      }}
                    >
                      {inv.excerpt}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {inv.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 bg-white/6 text-white/35 border border-white/6"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/6">
                    <div className="text-[10px] text-white/25 font-mono">
                      {inv.files.toLocaleString()} files · {inv.sources} sources · {inv.date}
                    </div>
                    <a
                      href="#"
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                    >
                      Read <ChevronRight size={10} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 border border-dashed border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div
              className="text-white/70 text-[15px] mb-1"
              style={{ fontFamily: AVENIR, fontWeight: 700 }}
            >
              Have information the public should know?
            </div>
            <p className="text-[12px] text-white/25" style={{ fontFamily: "'Inter', sans-serif" }}>
              Y-O-X accepts encrypted submissions via SecureDrop. Your identity is never stored.
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            <Lock size={11} /> Secure Submission <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </section>
  );
}

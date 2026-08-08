import { useRef, useState, useEffect, useCallback } from "react";
import { X, ArrowRight, Bookmark, Share2, ChevronDown } from "lucide-react";
import type { Article } from "./NewsCard";

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";
const INTER = "'Inter', sans-serif";
const GROTESK = "'Space Grotesk', sans-serif";

// Render inline markdown: **bold**, *italic*
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    const m = match[0];
    if (m.startsWith("**"))
      parts.push(<strong key={key++} style={{ fontWeight: 700, color: "inherit" }}>{m.slice(2, -2)}</strong>);
    else
      parts.push(<em key={key++} style={{ fontStyle: "italic" }}>{m.slice(1, -1)}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
}

// Render a block of markdown text (a single page's content)
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      // blank line — skip (paragraph gaps handled by container gap)
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={key++} className="text-[#0A0A0A] leading-tight tracking-[-0.03em] mt-2 mb-1"
          style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(20px, 2.5vw, 32px)" }}>
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={key++} className="text-[#0A0A0A] leading-snug tracking-[-0.02em] mt-2 mb-1"
          style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(16px, 1.8vw, 24px)" }}>
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++}
          className="border-l-4 pl-5 py-1 my-1"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}>
          <p className="text-[#333] leading-relaxed"
            style={{ fontFamily: AVENIR, fontWeight: 700, fontStyle: "italic", fontSize: "clamp(15px, 1.5vw, 20px)" }}>
            {renderInline(line.slice(2))}
          </p>
        </blockquote>
      );
    } else {
      elements.push(
        <p key={key++} className="text-[#1a1a1a] leading-[1.75]"
          style={{ fontFamily: INTER, fontWeight: 300, fontSize: "clamp(15px, 1.3vw, 18px)" }}>
          {renderInline(line)}
        </p>
      );
    }
  }
  return <>{elements}</>;
}

// Split article body into pages on --- dividers; fall back to 2-paragraphs-per-page
function parseBodyPages(body: string): string[] {
  // --- on its own line = explicit page break
  const pages = body.split(/\n\s*---\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (pages.length > 1) return pages;
  // No explicit breaks: auto-split every 2 paragraphs
  const paras = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const auto: string[] = [];
  for (let i = 0; i < paras.length; i += 2) auto.push(paras.slice(i, i + 2).join("\n\n"));
  return auto.length > 0 ? auto : [body.trim()];
}

// Generate mock body pages from article metadata
function getBodyPages(article: Article): string[][] {
  const bodies: Record<string, string[][]> = {
    World: [
      [
        `The agreement, reached after 72 hours of near-continuous negotiations at the Palais des Nations in Geneva, represents a fundamental shift in how sovereign states conceive of collective security. For the first time, 78 nations have accepted legally binding obligations on intelligence sharing — a concession that even optimistic observers considered remote as recently as six months ago.`,
        `The framework's architecture is deliberately modular. Three core pillars — intelligence exchange, joint response protocols, and a cyber defence compact — can be ratified independently, allowing holdout nations to participate partially rather than reject the treaty outright. Diplomats involved in the drafting describe this as the crucial innovation that unlocked consensus.`,
      ],
      [
        `"We have built something durable precisely because we did not demand unanimity on everything," said one senior negotiator, speaking on condition of anonymity. "The door remains open. The architecture invites rather than excludes."`,
        `France and Germany, who entered the final day's session with significant reservations about the scope of the cyber compact, ultimately endorsed the full text after a last-minute rewording of Article 14 — the clause governing mandatory notification timelines. The revised language gives member states a 96-hour window before escalation triggers, a compromise that the Franco-German delegation had pushed for since the second day.`,
      ],
      [
        `The treaty's most consequential absence is notable. Neither China nor Russia signed, though both were present as observers throughout the process. Both governments issued statements describing the framework as "premature" and expressing willingness to engage with "appropriately scoped" future instruments.`,
        `Whether the framework holds its shape as it moves through national ratification processes remains the central uncertainty. History is littered with multilateral agreements that commanded signatories at ceremony and then frayed in legislatures. But proponents point to a key structural difference: the treaty includes a binding dispute arbitration mechanism administered by a newly constituted secretariat in The Hague, insulated from the veto dynamics that have paralysed the UN Security Council.`,
      ],
    ],
    Business: [
      [
        `The Federal Reserve's June minutes, released Thursday, contained language that markets had not fully priced: three separate references to "patience" as a policy disposition, framing that historically precedes a prolonged hold rather than further tightening. The dollar fell against a basket of major currencies within minutes of publication.`,
        `What makes this cycle different from prior pauses is the simultaneous acknowledgement, in the same document, that inflation's last mile — the descent from three percent to the two percent target — has proven "stickier than the median projection." The combination of patience on rates and candour about stickiness creates an unusual policy ambiguity that strategists at several major banks described as unprecedented in post-crisis communications.`,
      ],
      [
        `For equity markets, the signal is double-edged. Rate stability removes the prospect of further compression on valuation multiples, a tailwind for growth equities that have underperformed for eighteen months. But the inflation acknowledgement introduces the possibility that any easing cycle, when it comes, will be shallower than the 2019 template — reducing the magnitude of the refinancing relief that corporate balance sheets are counting on.`,
        `The IMF's simultaneous revision of global growth to 2.8% adds another layer of complexity. In a normal easing cycle, weaker global growth would accelerate the Fed's timeline. Here, with core services inflation still running above three percent on a six-month annualised basis, the central bank appears willing to accept softer growth as the price of credibility.`,
      ],
      [
        `The most immediate practical consequence falls on the roughly $2.3 trillion in floating-rate corporate debt that matures between now and the end of 2027. For issuers who refinanced at the lows of 2021, the arithmetic of rolling that debt at current rates remains brutally unfavourable regardless of whether the Fed cuts once or three times.`,
        `The semiconductor consortium announced this week — 14 manufacturers spanning Japan, South Korea, Germany, and the Netherlands — reads, against this backdrop, as a strategic hedge rather than an opportunistic investment. Firms that locked in long-duration capital commitments now rather than waiting for easing are, in effect, betting that the cost of waiting exceeds the cost of today's elevated rates.`,
      ],
    ],
    Tech: [
      [
        `The claim, published late Wednesday in a preprint that had not yet been peer-reviewed, is both precisely defined and extraordinarily broad. The researchers describe a system that achieves "generalised reasoning performance at or above the 95th human percentile" across 14 benchmark domains including novel mathematical proof generation, open-ended scientific hypothesis formation, and cross-domain analogical transfer.`,
        `Independent AI safety researchers responded with a mix of scepticism about the benchmarks and alarm about the implications if the claims hold. The benchmarks themselves — which the researchers designed — have not been independently audited. Three leading AI labs contacted by Y-O-X declined to comment specifically on the preprint, a posture that some interpreted as significant.`,
      ],
      [
        `The regulatory timing is conspicuous. The publication arrives in the same week that coordinated AI legislation passed in the United States, the European Union, and China — three frameworks that were drafted under the assumption that transformative AI capability was years, not months, away. If the claims are verified, each of those frameworks may require emergency amendment before they take effect.`,
        `"The law was written for a different technological moment," said one member of the EU's AI Act implementation committee, who asked not to be named. "We knew this risk existed. We chose not to write for it because the political consensus would not have survived the attempt."`,
      ],
      [
        `The most significant technical claim in the paper is not the aggregate benchmark performance but a specific finding on what the authors call "zero-shot novel domain entry" — the ability to perform well on problems in categories the system had not encountered during training. This is the capability that has historically separated narrow AI from something more general.`,
        `Verification, if it comes, will require independent researchers to be given access to the model weights and training data — a process that, in past cases involving contested capability claims, has taken between six weeks and eight months. Until then, the world's AI governance infrastructure is operating on the basis of a claim that cannot yet be confirmed or denied.`,
      ],
    ],
    Climate: [
      [
        `The satellite data, compiled from the CryoSat-3 and ICESat-2 missions and cross-validated by three independent research groups, shows multi-year Arctic sea ice extent recovering at a rate that has no precedent in the 47-year satellite observation record. The recovery is concentrated in the Beaufort and Chukchi seas, regions that experienced the most severe summer melt events of the previous decade.`,
        `Scientists are careful to contextualise the finding. A partial recovery from a severely depleted baseline is not the same as a return to historical norms. The ice that has regrown is predominantly first-year ice — thinner, structurally weaker, and more vulnerable to the next warm season than the multi-year ice it replaces. The physical memory of the ice system, they emphasise, has not been restored.`,
      ],
      [
        `What makes the data scientifically interesting, rather than merely encouraging, is the mechanism driving it. Standard models of Arctic ice dynamics predicted a slower recovery response to the two consecutive cool summers of 2024 and 2025. The observed rate is roughly 40% faster than the ensemble model median — a discrepancy that suggests either a feedback mechanism that current models underweight, or a fortuitous coincidence of atmospheric circulation patterns that may not persist.`,
        `"We are learning something new about the system," said Dr. Ingrid Sørensen of the Norwegian Polar Institute. "Whether what we're learning is good news or neutral news depends entirely on whether this mechanism is robust or fragile. That is what the next three years of data will tell us."`,
      ],
      [
        `The EU carbon border tax, which entered full force this week, provides an unrelated but politically connected backdrop. The CBAM imposes carbon pricing on six categories of imported goods — steel, cement, fertilisers, aluminium, electricity, and hydrogen — from countries without equivalent domestic carbon pricing. In its first week, the mechanism has already generated trade friction with India, Brazil, and Turkey, each of which has indicated plans to challenge the measure at the WTO.`,
        `The intersection of the ice recovery data and the CBAM is, in a narrow sense, coincidental. In a broader sense, it captures the central tension of contemporary climate politics: the science is moving faster than the governance, and the governance is moving faster than the political coalitions that are supposed to sustain it.`,
      ],
    ],
    Opinion: [
      [
        `The case for pessimism, I want to be clear, is not the same as the case for despair. What I am arguing is something more precise: that the institutional architecture we have relied upon to manage great-power competition, economic interdependence, and technological disruption was designed for a world whose load-bearing assumptions have quietly ceased to hold.`,
        `The post-1945 settlement rested on four pillars: American hegemony sufficient to underwrite the system, economic growth sufficient to make redistribution politically tolerable, a shared epistemic space sufficient to sustain deliberation, and the threat of mutual destruction sufficient to deter direct conflict between major powers. All four are under pressure simultaneously, for the first time.`,
      ],
      [
        `I am not, to be clear, predicting catastrophe. History's trajectory is never linear, and the very pressures I am describing have generated countervailing responses — the security framework signed this week being one example. What I am predicting is turbulence: a period in which the costs of maintaining the existing order rise faster than the benefits, and in which the coalitions needed to reform it are too fractured to act coherently.`,
        `The analogy I keep returning to is not 1914 or 1939 — the catastrophist references that dominate this conversation — but 1973. A year of multiple simultaneous shocks that the existing system was not designed to absorb, in which the response was neither collapse nor renewal but a long, disorienting reorganisation whose shape only became legible a decade later.`,
      ],
      [
        `Central banks provide an instructive case study in institutional brittleness. Their models were built on the assumption that inflation was primarily a monetary phenomenon responsive to rate policy, and that expectations could be anchored through credible communication. Both assumptions have been tested severely by post-pandemic supply dynamics and the structural energy price shifts triggered by the conflict in Ukraine and the acceleration of electrification.`,
        `The Fed's minutes released this week capture the predicament precisely: patient on rates, candid about stickiness, but operationally committed to a framework whose predictive validity has been demonstrably weakened. The honest institutional response to that situation would be to say: our models are wrong and we are rebuilding them in real time. Instead, the language of confidence and framework is preserved, because the alternative — visible uncertainty at the apex of global monetary authority — is considered more dangerous than the uncertainty itself.`,
      ],
    ],
  };

  const category = article.category as keyof typeof bodies;
  return bodies[category] ?? bodies["World"];
}

interface ArticleReaderProps {
  article: Article;
  feedArticles: Article[];
  onClose: () => void;
}

function BodySlide({
  content,
  article,
  pageNum,
  totalPages,
}: {
  content: string;
  article: Article;
  pageNum: number;
  totalPages: number;
}) {
  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Top strip */}
      <div className="flex items-center justify-between px-10 pt-6 pb-4 border-b border-black/6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[8px] tracking-[0.3em] uppercase"
            style={{ fontFamily: GROTESK, fontWeight: 700, color: article.categoryColor }}>
            {article.category}
          </span>
          <span className="w-px h-3 bg-black/15" />
          <span className="text-[10px] text-black/30" style={{ fontFamily: INTER }}>
            {pageNum} / {totalPages}
          </span>
        </div>
        <span className="text-[13px] tracking-[0.2em] text-black/20" style={{ fontFamily: AVENIR, fontWeight: 900 }}>
          Y-O-X
        </span>
      </div>

      {/* Reading content */}
      <div className="flex-1 overflow-y-auto px-8 md:px-16 lg:px-28 xl:px-40 max-w-5xl mx-auto w-full py-8">
        {pageNum === 1 && (
          <h2 className="text-[#0A0A0A] leading-[1.05] tracking-[-0.03em] mb-8"
            style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(22px, 3vw, 38px)" }}>
            {article.headline}
          </h2>
        )}
        <div className="flex flex-col gap-4">
          <MarkdownContent content={content} />
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="h-[2px] bg-black/6 shrink-0">
        <div className="h-full bg-[#0A0A0A] transition-all duration-300"
          style={{ width: `${(pageNum / totalPages) * 100}%` }} />
      </div>
    </div>
  );
}

function FeedSlide({ article, layout }: { article: Article; layout: "cover" | "split" }) {
  if (layout === "cover" && article.image) {
    return (
      <div className="h-full relative overflow-hidden bg-[#0A0A0A] cursor-pointer group">
        <img src={article.image} alt={article.headline}
          className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-75 group-hover:scale-[1.02] transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 max-w-3xl">
          <span className="text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 text-white mb-4 inline-block"
            style={{ fontFamily: GROTESK, fontWeight: 700, backgroundColor: article.categoryColor }}>
            {article.category}
          </span>
          <h2 className="text-white leading-[0.95] tracking-[-0.03em] mb-5"
            style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(28px, 3.5vw, 52px)" }}>
            {article.headline}
          </h2>
          {article.excerpt && (
            <p className="text-white/50 text-[14px] leading-relaxed mb-5 max-w-xl"
              style={{ fontFamily: INTER, fontWeight: 300 }}>{article.excerpt}</p>
          )}
          <div className="flex items-center gap-3" style={{ fontFamily: INTER }}>
            <span className="text-white/60 text-[13px]">{article.author}</span>
            <span className="text-white/30 text-[12px]">{article.time}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full grid grid-cols-[1fr_1fr] cursor-pointer group">
      <div className="bg-white flex flex-col justify-center px-14 py-12">
        <span className="text-[9px] tracking-[0.3em] uppercase mb-5 block"
          style={{ fontFamily: GROTESK, fontWeight: 700, color: article.categoryColor }}>{article.category}</span>
        <h2 className="text-[#0A0A0A] leading-[0.95] tracking-[-0.03em] mb-5"
          style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(22px, 2.8vw, 42px)" }}>
          {article.headline}
        </h2>
        {article.excerpt && (
          <p className="text-black/40 text-[14px] leading-relaxed mb-8 max-w-sm"
            style={{ fontFamily: INTER, fontWeight: 300 }}>{article.excerpt}</p>
        )}
        <div style={{ fontFamily: INTER }}>
          <span className="text-black/50 text-[13px]">{article.author}</span>
          <span className="text-black/30 text-[12px] ml-2">{article.time}</span>
        </div>
      </div>
      <div className="overflow-hidden bg-[#0A0A0A]">
        {article.image
          ? <img src={article.image} alt={article.headline} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/5 text-[120px]" style={{ fontFamily: AVENIR, fontWeight: 900 }}>{article.category[0]}</span>
            </div>
        }
      </div>
    </div>
  );
}

export function ArticleReader({ article, feedArticles, onClose }: ArticleReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [saved, setSaved] = useState(false);

  // bodyPages is always string[] — real content uses parseBodyPages, mock joins paragraphs
  const bodyPages: string[] = article.body
    ? parseBodyPages(article.body)
    : getBodyPages(article).map((paragraphs) => paragraphs.join("\n\n"));
  // Slides: [hero] + body pages + feed articles after this one
  const afterIdx = feedArticles.findIndex((a) => a.id === article.id);
  const nextArticles = feedArticles.slice(afterIdx + 1);
  const totalSlides = 1 + bodyPages.length + nextArticles.length;

  useEffect(() => {
    const slides = containerRef.current?.querySelectorAll("[data-rslide]");
    if (!slides) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.rslide));
      }),
      { threshold: 0.5, root: containerRef.current }
    );
    slides.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [article]);

  const scrollTo = useCallback((idx: number) => {
    containerRef.current?.querySelector(`[data-rslide="${idx}"]`)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); scrollTo(Math.min(current + 1, totalSlides - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); scrollTo(Math.max(current - 1, 0)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, totalSlides, onClose, scrollTo]);

  const snapStyle: React.CSSProperties = { scrollSnapAlign: "start", scrollSnapStop: "always" };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0A]">
      {/* Persistent top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 md:px-8 py-2.5 bg-white/[0.03] border-b border-white/8 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          style={{ fontFamily: GROTESK, fontWeight: 600 }}
        >
          <X size={15} />
          <span className="text-[11px] tracking-[0.12em] uppercase">Back</span>
        </button>

        <span className="text-[11px] tracking-[0.2em] text-white/30" style={{ fontFamily: INTER }}>
          {current < 1 + bodyPages.length
            ? `${Math.max(0, current)} of ${bodyPages.length} pages`
            : "Up next"}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaved(s => !s)}
            className={`w-7 h-7 flex items-center justify-center transition-colors ${saved ? "text-white" : "text-white/40 hover:text-white"}`}
          >
            <Bookmark size={14} fill={saved ? "white" : "none"} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Snap scroll reader */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Slide 0: Hero */}
        <div data-rslide={0} className="h-full relative cursor-pointer" style={snapStyle}>
          {article.image && (
            <img src={article.image} alt={article.headline}
              className="absolute inset-0 w-full h-full object-cover opacity-65" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16 max-w-4xl">
            <span className="text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 text-white mb-4 inline-block"
              style={{ fontFamily: GROTESK, fontWeight: 700, backgroundColor: article.categoryColor }}>
              {article.category}
            </span>
            <h1 className="text-white leading-[0.95] tracking-[-0.03em] mb-5"
              style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(32px, 4.5vw, 62px)" }}>
              {article.headline}
            </h1>
            {article.excerpt && (
              <p className="text-white/55 text-[15px] md:text-[17px] leading-relaxed mb-6 max-w-2xl"
                style={{ fontFamily: INTER, fontWeight: 300 }}>{article.excerpt}</p>
            )}
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-[13px]" style={{ fontFamily: INTER }}>{article.author}</span>
              <span className="text-white/30 text-[12px]" style={{ fontFamily: INTER }}>{article.time}</span>
              {article.readTime && <span className="text-white/30 text-[12px]" style={{ fontFamily: INTER }}>· {article.readTime} read</span>}
            </div>
          </div>
          {/* Scroll hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
            <ChevronDown size={16} className="text-white/30" />
          </div>
        </div>

        {/* Body slides */}
        {bodyPages.map((pageContent, i) => (
          <div key={i} data-rslide={i + 1} className="h-full" style={snapStyle}>
            <BodySlide
              content={pageContent}
              article={article}
              pageNum={i + 1}
              totalPages={bodyPages.length}
            />
          </div>
        ))}

        {/* Transition slide before feed continues */}
        {nextArticles.length > 0 && (
          <div
            data-rslide={1 + bodyPages.length}
            className="h-full bg-[#0A0A0A] flex flex-col items-center justify-center gap-6"
            style={snapStyle}
          >
            <div
              className="text-white/10 text-[80px] md:text-[110px] leading-none tracking-[-0.04em] select-none"
              style={{ fontFamily: AVENIR, fontWeight: 900 }}
            >
              Y-O-X
            </div>
            <div className="text-center">
              <p className="text-[11px] tracking-[0.25em] uppercase text-white/30 mb-2"
                style={{ fontFamily: GROTESK, fontWeight: 600 }}>Continue reading</p>
              <p className="text-white/15 text-[13px]" style={{ fontFamily: INTER }}>Next story below</p>
            </div>
            <div className="animate-bounce">
              <ChevronDown size={18} className="text-white/20" />
            </div>
          </div>
        )}

        {/* Remaining feed articles */}
        {nextArticles.map((a, i) => (
          <div key={a.id} data-rslide={2 + bodyPages.length + i} className="h-full" style={snapStyle}>
            <FeedSlide article={a} layout={i % 3 === 1 ? "split" : "cover"} />
          </div>
        ))}
      </div>

      {/* Right progress indicator */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-20 pointer-events-none">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="pointer-events-auto transition-all duration-300"
            style={{
              width: "2px",
              height: i === current ? "20px" : "4px",
              backgroundColor: i <= bodyPages.length
                ? i === current ? "white" : "rgba(255,255,255,0.2)"
                : i === current ? article.categoryColor : "rgba(255,255,255,0.12)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

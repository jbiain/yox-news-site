import { useRef, useState, useEffect, useCallback } from "react";
import { Bookmark, Share2, ArrowRight, ChevronDown } from "lucide-react";
import type { Article } from "./NewsCard";

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";

interface DesktopFeedProps {
  articles: Article[];
  trailing?: React.ReactNode[];
  onArticleSelect?: (article: Article) => void;
}

// Alternate between two layouts
function SlideCard({ article, layout }: { article: Article; layout: "split" | "cover" }) {
  const [saved, setSaved] = useState(false);

  if (layout === "cover" && article.image) {
    return (
      <div className="group h-full relative overflow-hidden bg-[#0A0A0A] cursor-pointer">
        <img
          src={article.image}
          alt={article.headline}
          className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-75 group-hover:scale-[1.02] transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-8 left-10">
          <span
            className="text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, backgroundColor: article.categoryColor }}
          >
            {article.category}
          </span>
        </div>

        {/* Main text */}
        <div className="absolute inset-0 flex flex-col justify-end p-10 max-w-3xl">
          <h2
            className="text-white leading-[0.95] tracking-[-0.03em] mb-5"
            style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(36px, 4.5vw, 64px)" }}
          >
            {article.headline}
          </h2>
          {article.excerpt && (
            <p className="text-white/55 text-[15px] leading-relaxed mb-6 max-w-xl"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4">
            <div style={{ fontFamily: "'Inter', sans-serif" }}>
              <span className="text-white/70 text-[13px]">{article.author}</span>
              <span className="text-white/30 text-[12px] ml-2">{article.time}</span>
            </div>
            <span
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-[11px] tracking-[0.15em] uppercase transition-colors ml-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              Read <ArrowRight size={11} />
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${saved ? "bg-white" : "bg-white/10 hover:bg-white/20"}`}
          >
            <Bookmark size={16} className={saved ? "text-black" : "text-white"} fill={saved ? "black" : "none"} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Share2 size={15} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Split layout: text left, image right
  return (
    <div className="h-full grid grid-cols-[1fr_1fr] cursor-pointer group">
      {/* Left: text */}
      <div className="bg-white flex flex-col justify-center px-14 py-12 relative">
        <span
          className="text-[9px] tracking-[0.3em] uppercase mb-5 block"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: article.categoryColor }}
        >
          {article.category}
        </span>
        <h2
          className="text-[#0A0A0A] leading-[0.95] tracking-[-0.03em] mb-5"
          style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "clamp(28px, 3.2vw, 50px)" }}
        >
          {article.headline}
        </h2>
        {article.excerpt && (
          <p className="text-black/45 text-[14px] leading-relaxed mb-8 max-w-sm"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4">
          <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="text-black/60 text-[13px]">{article.author}</span>
            <span className="text-black/30 text-[12px] ml-2">{article.time}</span>
          </div>
          <a
            href="#"
            className="flex items-center gap-1.5 text-black text-[11px] tracking-[0.15em] uppercase ml-4 border-b border-black/20 pb-0.5 hover:border-black transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            Read <ArrowRight size={11} />
          </a>
        </div>

        <div className="absolute top-8 right-8 flex flex-col items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${saved ? "bg-black border-black" : "border-black/15 hover:border-black/40"}`}
          >
            <Bookmark size={14} className={saved ? "text-white" : "text-black/40"} fill={saved ? "white" : "none"} />
          </button>
          <button className="w-9 h-9 rounded-full border border-black/15 hover:border-black/40 flex items-center justify-center transition-colors">
            <Share2 size={14} className="text-black/40" />
          </button>
        </div>
      </div>

      {/* Right: image */}
      <div className="overflow-hidden bg-[#0A0A0A]">
        {article.image ? (
          <img
            src={article.image}
            alt={article.headline}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-white/5 text-[120px] leading-none"
              style={{ fontFamily: AVENIR, fontWeight: 900 }}
            >
              {article.category[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DesktopFeed({ articles, trailing = [], onArticleSelect }: DesktopFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const total = articles.length + trailing.length;

  // Track current slide
  useEffect(() => {
    const slides = containerRef.current?.querySelectorAll("[data-slide]");
    if (!slides) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.slide));
        });
      },
      { threshold: 0.5, root: containerRef.current }
    );
    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [articles, trailing]);

  // Keyboard navigation
  const scrollToSlide = useCallback((idx: number) => {
    const el = containerRef.current?.querySelector(`[data-slide="${idx}"]`);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        scrollToSlide(Math.min(current + 1, total - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToSlide(Math.max(current - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, total, scrollToSlide]);

  return (
    <div className="relative h-full">
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {articles.map((article, i) => (
          <div
            key={article.id}
            data-slide={i}
            className="h-full"
            style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
            onClick={() => onArticleSelect?.(article)}
          >
            <SlideCard article={article} layout={i % 3 === 1 ? "split" : "cover"} />
          </div>
        ))}

        {trailing.map((node, i) => (
          <div
            key={`trailing-${i}`}
            data-slide={articles.length + i}
            style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            {node}
          </div>
        ))}
      </div>

      {/* Progress indicator — right edge */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-20 pointer-events-none">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            className="pointer-events-auto transition-all duration-300"
            style={{
              width: "2px",
              height: i === current ? "20px" : "4px",
              backgroundColor: i === current ? "white" : "rgba(255,255,255,0.25)",
              mixBlendMode: "difference",
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        className="absolute bottom-6 right-10 z-20 pointer-events-none"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, mixBlendMode: "difference" }}
      >
        <span className="text-[11px] text-white/60 tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Scroll hint on first slide */}
      {current === 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce pointer-events-none">
          <ChevronDown size={16} className="text-white/40" style={{ mixBlendMode: "difference" }} />
        </div>
      )}
    </div>
  );
}

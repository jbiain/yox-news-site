import { useRef, useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, ChevronUp, ArrowRight, Volume2, VolumeX } from "lucide-react";
import type { Article } from "./NewsCard";

interface FeedArticle extends Article {
  likes?: number;
  comments?: number;
}

interface MobileFeedProps {
  articles: FeedArticle[];
  onAIOpen: () => void;
  onArticleSelect?: (article: FeedArticle) => void;
}

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";

export function MobileFeed({ articles, onAIOpen, onArticleSelect }: MobileFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Track current slide via IntersectionObserver
  useEffect(() => {
    const slides = containerRef.current?.querySelectorAll("[data-slide]");
    if (!slides) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.slide);
            setCurrentIndex(idx);
            setExpandedId(null);
          }
        });
      },
      { threshold: 0.6 }
    );
    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [articles]);

  const toggleLike = (id: string) =>
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleBookmark = (id: string) =>
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const feed = articles.filter((a) => a.image);

  return (
    <div className="relative bg-black" style={{ height: "100dvh" }}>
      {/* Snap scroll container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
      >
        {feed.map((article, i) => {
          const isLiked = liked.has(article.id);
          const isSaved = bookmarked.has(article.id);
          const isExpanded = expandedId === article.id;

          return (
            <div
              key={article.id}
              data-slide={i}
              className="relative w-full bg-black overflow-hidden"
              style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
            >
              {/* Background image */}
              <img
                src={article.image}
                alt={article.headline}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 pb-2">
                <span
                  className="text-white text-[18px] tracking-[0.2em]"
                  style={{ fontFamily: AVENIR, fontWeight: 900 }}
                >
                  Y-O-X
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onAIOpen}
                    className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1 text-[11px] tracking-wide"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                  >
                    Ask AI
                  </button>
                  <button onClick={() => setMuted((m) => !m)} className="text-white/70">
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="absolute top-12 left-0 right-0 z-20 flex justify-center gap-1 px-4">
                <div className="flex gap-[3px]">
                  {feed.slice(Math.max(0, i - 3), Math.min(feed.length, i + 4)).map((_, dotIdx) => {
                    const actual = Math.max(0, i - 3) + dotIdx;
                    return (
                      <div
                        key={actual}
                        className="h-[2px] rounded-full transition-all duration-300"
                        style={{
                          width: actual === i ? "20px" : "4px",
                          backgroundColor: actual === i ? "white" : "rgba(255,255,255,0.3)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Right action bar */}
              <div className="absolute right-3 z-20 flex flex-col items-center gap-5"
                style={{ bottom: "100px" }}>
                <button
                  onClick={() => toggleLike(article.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isLiked ? "bg-[#FF2D20]" : "bg-black/40 backdrop-blur-sm"}`}>
                    <Heart size={18} className="text-white" fill={isLiked ? "white" : "none"} />
                  </div>
                  <span className="text-white text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {((article.likes ?? 2400) + (isLiked ? 1 : 0)).toLocaleString()}
                  </span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <span className="text-white text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {article.comments ?? 342}
                  </span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Share2 size={18} className="text-white" />
                  </div>
                  <span className="text-white text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Share
                  </span>
                </button>

                <button
                  onClick={() => toggleBookmark(article.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSaved ? "bg-white" : "bg-black/40 backdrop-blur-sm"}`}>
                    <Bookmark size={18} className={isSaved ? "text-black" : "text-white"} fill={isSaved ? "black" : "none"} />
                  </div>
                  <span className="text-white text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Save
                  </span>
                </button>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pr-16">
                <span
                  className="inline-block text-[9px] tracking-[0.25em] uppercase px-2 py-0.5 text-white mb-3"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    backgroundColor: article.categoryColor,
                  }}
                >
                  {article.category}
                </span>

                <h2
                  className="text-white leading-[1.1] mb-2"
                  style={{
                    fontFamily: AVENIR,
                    fontWeight: 900,
                    fontSize: "clamp(22px, 5.5vw, 28px)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {article.headline}
                </h2>

                {(article.excerpt || isExpanded) && (
                  <p
                    className={`text-white/60 text-[13px] leading-relaxed mb-2 transition-all ${isExpanded ? "" : "line-clamp-2"}`}
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                  >
                    {article.excerpt ?? "Tap to read more about this developing story and its implications for the region and beyond."}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div style={{ fontFamily: "'Inter', sans-serif" }}>
                    <span className="text-white/70 text-[12px]">{article.author}</span>
                    <span className="text-white/35 text-[11px] ml-2">{article.time}</span>
                  </div>
                  <button
                    onClick={() => onArticleSelect ? onArticleSelect(article) : setExpandedId(isExpanded ? null : article.id)}
                    className="flex items-center gap-1 text-white text-[11px] tracking-wider uppercase"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                  >
                    Read <ArrowRight size={11} />
                  </button>
                </div>
              </div>

              {/* Swipe up hint */}
              {i < feed.length - 1 && i === currentIndex && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce">
                  <ChevronUp size={14} className="text-white/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

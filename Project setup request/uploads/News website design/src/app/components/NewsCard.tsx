import { ArrowUpRight } from "lucide-react";

export interface Article {
  id: string;
  category: string;
  categoryColor: string;
  headline: string;
  excerpt?: string;
  body?: string;
  author: string;
  time: string;
  readTime?: string;
  image?: string;
  isOpinion?: boolean;
}

interface NewsCardProps {
  article: Article;
  variant?: "cover" | "standard" | "row" | "text" | "tall";
}

export function NewsCard({ article, variant = "standard" }: NewsCardProps) {
  const { category, categoryColor, headline, excerpt, author, time, readTime, image } = article;

  const Label = () => (
    <span
      className="text-[9px] tracking-[0.25em] uppercase block mb-2"
      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: categoryColor }}
    >
      {category}
    </span>
  );

  const Meta = ({ light = false }: { light?: boolean }) => (
    <div
      className={`flex items-center gap-2 text-[11px] ${light ? "text-white/40" : "text-black/35"}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <span>{author}</span>
      <span>·</span>
      <span>{time}</span>
      {readTime && <><span>·</span><span>{readTime}</span></>}
    </div>
  );

  // Full image cover — big card
  if (variant === "cover") {
    return (
      <article className="group cursor-pointer relative overflow-hidden bg-[#0A0A0A]" style={{ aspectRatio: "3/4" }}>
        {image && (
          <img
            src={image}
            alt={headline}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-[1.03] transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <Label />
          <h3
            className="text-white leading-snug tracking-[-0.02em] mb-2"
            style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800, fontSize: "clamp(18px, 2vw, 26px)" }}
          >
            {headline}
          </h3>
          <Meta light />
        </div>
      </article>
    );
  }

  // Tall image + text below
  if (variant === "tall") {
    return (
      <article className="group cursor-pointer flex flex-col">
        {image && (
          <div className="overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <img
              src={image}
              alt={headline}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
            />
          </div>
        )}
        <div className="pt-3 flex flex-col flex-1">
          <Label />
          <h3
            className="text-[#0A0A0A] leading-snug tracking-[-0.02em] group-hover:text-black/50 transition-colors"
            style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800, fontSize: "clamp(16px, 1.8vw, 22px)" }}
          >
            {headline}
          </h3>
          {excerpt && (
            <p className="text-[13px] text-black/45 leading-relaxed mt-2 line-clamp-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              {excerpt}
            </p>
          )}
          <div className="mt-3">
            <Meta />
          </div>
        </div>
      </article>
    );
  }

  // Standard: image + text, horizontal-ish
  if (variant === "standard") {
    return (
      <article className="group cursor-pointer flex flex-col">
        {image && (
          <div className="overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img src={image} alt={headline} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
        )}
        <div className="pt-3">
          <Label />
          <h3
            className="text-[#0A0A0A] text-[15px] leading-snug tracking-[-0.01em] group-hover:text-black/50 transition-colors"
            style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 700 }}
          >
            {headline}
          </h3>
          <div className="mt-2">
            <Meta />
          </div>
        </div>
      </article>
    );
  }

  // Row: image thumb + text side by side
  if (variant === "row") {
    return (
      <article className="group cursor-pointer flex gap-4 py-4 border-b border-black/8 last:border-0">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Label />
            <h3
              className="text-[#0A0A0A] text-[15px] leading-snug tracking-[-0.01em] group-hover:text-black/50 transition-colors"
              style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 700 }}
            >
              {headline}
            </h3>
            {excerpt && (
              <p className="text-[12px] text-black/40 leading-relaxed mt-1.5 line-clamp-2 hidden md:block" style={{ fontFamily: "'Inter', sans-serif" }}>
                {excerpt}
              </p>
            )}
          </div>
          <div className="mt-2"><Meta /></div>
        </div>
        {image && (
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
            <img src={image} alt={headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
      </article>
    );
  }

  // Text only
  return (
    <article className="group cursor-pointer flex items-start gap-3 py-4 border-b border-black/8 last:border-0">
      <div className="flex-1">
        <Label />
        <h4
          className="text-[#0A0A0A] text-[14px] leading-snug group-hover:text-black/50 transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
        >
          {headline}
        </h4>
        <div className="mt-1.5"><Meta /></div>
      </div>
      <ArrowUpRight size={13} className="text-black/20 group-hover:text-black/60 transition-colors mt-1 shrink-0" />
    </article>
  );
}

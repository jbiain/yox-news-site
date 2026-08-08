import { ArrowRight } from "lucide-react";
import { NewsCard, type Article } from "./NewsCard";

interface CategorySectionProps {
  title: string;
  color: string;
  articles: Article[];
  dark?: boolean;
}

export function CategorySection({ title, color, articles, dark = false }: CategorySectionProps) {
  const [a, b, c, ...rest] = articles;
  const bg = dark ? "bg-[#0A0A0A]" : "bg-white";
  const textColor = dark ? "text-white/80" : "text-black/25";
  const titleColor = dark ? "text-white/10" : "text-black/[0.04]";
  const linkColor = dark ? "text-white/40 hover:text-white" : "text-black/35 hover:text-black";
  const dividerColor = dark ? "border-white/8" : "border-black/8";

  return (
    <section className={`${bg} px-5 md:px-10 py-12`}>
      <div className="max-w-screen-xl mx-auto">

        {/* Section header — oversized ghost label */}
        <div className="relative mb-8">
          <span
            className={`absolute -top-6 left-0 text-[80px] md:text-[110px] leading-none select-none pointer-events-none ${titleColor}`}
            style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }}
            aria-hidden
          >
            {title}
          </span>
          <div className={`flex items-center justify-between border-b ${dividerColor} pb-3 relative z-10`}>
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span
                className={`text-[11px] tracking-[0.22em] uppercase ${dark ? "text-white" : "text-[#0A0A0A]"}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                {title}
              </span>
            </div>
            <a
              href="#"
              className={`flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase transition-colors ${linkColor}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              All {title} <ArrowRight size={11} />
            </a>
          </div>
        </div>

        {/* Editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Featured — large */}
          {a && (
            <div className="md:col-span-5">
              <NewsCard article={a} variant="cover" />
            </div>
          )}
          {/* Middle */}
          {b && (
            <div className="md:col-span-4">
              <NewsCard article={b} variant="tall" />
            </div>
          )}
          {/* Right column — text list */}
          <div className={`md:col-span-3 ${dark ? "border-white/8" : "border-black/8"} md:border-l md:pl-6 flex flex-col`}>
            {c && <NewsCard article={c} variant="text" />}
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} variant="text" />
            ))}
            {dark && (
              <div className="mt-auto pt-6">
                <div
                  className="text-[10px] tracking-[0.2em] uppercase text-white/20 mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                >
                  Daily Brief
                </div>
                <p className="text-[13px] text-white/40 leading-relaxed mb-3" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                  The biggest stories. In your inbox. Every morning.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                >
                  Subscribe Free <ArrowRight size={11} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

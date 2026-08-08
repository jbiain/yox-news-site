import { ArrowRight } from "lucide-react";

const hero = {
  category: "World",
  categoryColor: "#FF2D20",
  issue: "Issue 47 · June 30, 2026",
  headline: "A New World Order Takes Shape",
  subheadline: "78 nations sign the most sweeping security framework since 1945 — rewriting the rules of global cooperation.",
  author: "Eleanor Whitmore",
  authorRole: "Diplomatic Correspondent",
  time: "2 hours ago",
  image: "https://images.unsplash.com/photo-1534298261662-f8fdd25317db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwdXJiYW4lMjBhcmNoaXRlY3R1cmUlMjBza3lsaW5lfGVufDF8fHx8MTc4MjgxMjY2MXww&ixlib=rb-4.1.0&q=80&w=1080",
};

const secondaryStories = [
  {
    id: "s1",
    category: "Business",
    categoryColor: "#0052CC",
    headline: "Central Banks Signal Coordinated Rate Shift",
    author: "Marcus Chen",
    time: "4h",
  },
  {
    id: "s2",
    category: "Tech",
    categoryColor: "#6D28D9",
    headline: "AI Regulation Passes in Three Economies Simultaneously",
    author: "Priya Nair",
    time: "5h",
  },
  {
    id: "s3",
    category: "Climate",
    categoryColor: "#047857",
    headline: "Arctic Ice Records Fastest Partial Recovery in Satellite History",
    author: "Dr. Sofía Renaud",
    time: "6h",
  },
  {
    id: "s4",
    category: "Business",
    categoryColor: "#0052CC",
    headline: "IMF Trims 2026 Growth Forecast as Trade Fragmentation Deepens",
    author: "James Farrow",
    time: "7h",
  },
];

export function HeroSection() {
  return (
    <section className="max-w-screen-xl mx-auto px-5 md:px-10 pt-8 pb-0">

      {/* Hero card — full editorial */}
      <div className="group cursor-pointer relative overflow-hidden bg-[#0A0A0A]" style={{ aspectRatio: "16/7" }}>
        <img
          src={hero.image}
          alt={hero.headline}
          className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-65 group-hover:scale-[1.02] transition-all duration-700"
        />
        {/* Left fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          {/* Top label */}
          <div className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3">
            <span
              className="text-[9px] tracking-[0.3em] uppercase text-white px-2.5 py-1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                backgroundColor: hero.categoryColor,
              }}
            >
              {hero.category}
            </span>
            <span
              className="text-[10px] tracking-[0.12em] text-white/30"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {hero.issue}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-white leading-[0.95] tracking-[-0.03em] mb-4 max-w-[640px]"
            style={{
              fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 5vw, 64px)",
            }}
          >
            {hero.headline}
          </h1>
          <p
            className="text-white/60 text-[14px] md:text-[16px] leading-relaxed mb-5 max-w-[460px]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            {hero.subheadline}
          </p>
          <div className="flex items-center justify-between max-w-[640px]">
            <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-white/80 text-[13px]" style={{ fontWeight: 500 }}>{hero.author}</span>
              <span className="text-white/30 text-[11px] ml-2">{hero.authorRole} · {hero.time}</span>
            </div>
            <span
              className="flex items-center gap-1.5 text-white/50 text-[11px] tracking-[0.14em] uppercase group-hover:text-white group-hover:gap-2.5 transition-all"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              Read <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>

      {/* Secondary strip — horizontal scrollable row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-l border-black/8">
        {secondaryStories.map((story, i) => (
          <a
            key={story.id}
            href="#"
            className={`group flex flex-col gap-2 p-4 md:p-5 border-r border-b md:border-b-0 border-black/8 hover:bg-black/[0.02] transition-colors ${i === 0 ? "" : ""}`}
          >
            <span
              className="text-[9px] tracking-[0.22em] uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: story.categoryColor }}
            >
              {story.category}
            </span>
            <h3
              className="text-[13px] leading-snug text-[#0A0A0A] group-hover:text-black/60 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              {story.headline}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-black/30 mt-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              <span>{story.author}</span>
              <span>·</span>
              <span>{story.time}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

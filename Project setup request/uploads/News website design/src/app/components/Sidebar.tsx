import { ArrowUpRight } from "lucide-react";

const trending = [
  { rank: "01", category: "Business", categoryColor: "#0052CC", headline: "Dollar Strengthens as Fed Minutes Signal Prolonged Tightening Cycle", time: "1h" },
  { rank: "02", category: "World", categoryColor: "#FF2D20", headline: "Peace Talks Resume Between Warring Factions After Six-Month Standoff", time: "3h" },
  { rank: "03", category: "Tech", categoryColor: "#6D28D9", headline: "Open-Source AI Surpasses Proprietary Benchmarks in Medical Diagnosis", time: "4h" },
  { rank: "04", category: "Climate", categoryColor: "#047857", headline: "EU Carbon Border Tax Takes Effect, Reshaping Global Trade Flows", time: "5h" },
  { rank: "05", category: "Science", categoryColor: "#0891B2", headline: "Physicists Confirm New Quantum State at Ultra-Low Temperatures", time: "7h" },
];

const markets = [
  { name: "S&P 500", value: "5,847", change: "+0.34%", up: true },
  { name: "NASDAQ", value: "19,412", change: "+0.61%", up: true },
  { name: "DOW", value: "43,115", change: "-0.08%", up: false },
  { name: "EUR/USD", value: "1.0842", change: "+0.12%", up: true },
  { name: "Gold", value: "2,341", change: "-0.22%", up: false },
  { name: "WTI", value: "78.64", change: "+1.04%", up: true },
];

export function Sidebar() {
  return (
    <aside className="flex flex-col gap-10">

      {/* Trending */}
      <div>
        <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
          <span
            className="text-[10px] tracking-[0.25em] uppercase text-[#0A0A0A]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
          >
            Trending
          </span>
        </div>
        <div>
          {trending.map((item) => (
            <a
              key={item.rank}
              href="#"
              className="group flex items-start gap-3 py-3.5 border-b border-black/6 last:border-0"
            >
              <span
                className="text-[18px] leading-none shrink-0 mt-0.5 text-black/[0.07] group-hover:text-black/20 transition-colors"
                style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800 }}
              >
                {item.rank}
              </span>
              <div>
                <span
                  className="text-[9px] tracking-[0.22em] uppercase block mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: item.categoryColor }}
                >
                  {item.category}
                </span>
                <h4
                  className="text-[13px] leading-snug text-[#0A0A0A] group-hover:text-black/50 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                >
                  {item.headline}
                </h4>
                <span className="text-[10px] text-black/30 mt-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {item.time} ago
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Newsletter — editorial dark block */}
      <div className="bg-[#0A0A0A] p-6">
        <div
          className="text-[42px] leading-none tracking-[-0.03em] text-white mb-4"
          style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800 }}
        >
          Morning<br />Brief.
        </div>
        <p className="text-[12px] text-white/40 leading-relaxed mb-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
          The most important stories. Curated. In your inbox at 6 AM.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full bg-white/8 border border-white/10 text-white text-[12px] px-3 py-2.5 outline-none placeholder-white/20 mb-2.5 focus:border-white/30 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <button
          className="w-full bg-white text-[#0A0A0A] text-[11px] tracking-[0.14em] uppercase py-2.5 hover:bg-white/90 transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
        >
          Subscribe Free
        </button>
      </div>

      {/* Markets */}
      <div>
        <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-0">
          <span
            className="text-[10px] tracking-[0.25em] uppercase text-[#0A0A0A]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
          >
            Markets
          </span>
          <a href="#" className="flex items-center gap-0.5 text-[10px] text-black/30 hover:text-black transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            Full data <ArrowUpRight size={10} />
          </a>
        </div>
        {markets.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between py-2.5 border-b border-black/6 last:border-0"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="text-[12px] text-black/50">{m.name}</span>
            <div className="text-right">
              <span className="text-[13px] text-[#0A0A0A] block" style={{ fontWeight: 600 }}>{m.value}</span>
              <span
                className="text-[10px] block"
                style={{ color: m.up ? "#047857" : "#FF2D20", fontWeight: 600 }}
              >
                {m.change}
              </span>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-black/20 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          Delayed 15 min · June 30, 2026
        </p>
      </div>
    </aside>
  );
}

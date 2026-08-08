import { useState } from "react";
import { Search, X, Menu } from "lucide-react";

const navLinks = ["Investigations", "Latest", "Data", "Video", "Leak to Y-O-X", "Donate"];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-black/8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Live strip */}
      <div className="bg-[#0A0A0A] overflow-hidden h-8 flex items-center">
        <div className="flex items-center gap-0 shrink-0 px-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D20] animate-pulse mr-2" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/50 mr-4" style={{ fontWeight: 600 }}>Live</span>
          <span className="w-px h-3 bg-white/10 mr-4" />
        </div>
        <div className="flex gap-0 overflow-hidden">
          <div className="flex animate-[ticker_35s_linear_infinite] whitespace-nowrap">
            {[
              "Global leaders reach historic security agreement · Markets rally as Fed signals rate pause · AI regulation passes in 3 major economies · Arctic ice shows fastest recovery in satellite era · Semiconductor alliance announces $200B investment · EU carbon border tax reshapes trade · OpenAI rival claims AGI threshold met in lab · ",
              "Global leaders reach historic security agreement · Markets rally as Fed signals rate pause · AI regulation passes in 3 major economies · Arctic ice shows fastest recovery in satellite era · Semiconductor alliance announces $200B investment · EU carbon border tax reshapes trade · OpenAI rival claims AGI threshold met in lab · ",
            ].map((text, i) => (
              <span key={i} className="text-[11px] text-white/40 shrink-0">{text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="px-5 md:px-10">
        <div className="max-w-screen-xl mx-auto">
          {/* Single combined row: logo + nav + actions */}
          <div className="flex items-center gap-6 py-3">
            <button className="md:hidden p-1 shrink-0" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <a href="#" className="shrink-0">
              <span
                className="text-[#0A0A0A] text-[22px] tracking-[0.22em] select-none"
                style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800 }}
              >
                Y-O-X
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-5 flex-1">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className={
                    link === "Donate"
                      ? "text-[11px] tracking-[0.14em] uppercase bg-black text-white px-3 py-1 hover:bg-black/75 transition-colors"
                      : link === "Leak to Y-O-X"
                      ? "text-[11px] tracking-[0.14em] uppercase text-[#FF2D20] border border-[#FF2D20]/40 px-3 py-1 hover:bg-[#FF2D20] hover:text-white transition-colors"
                      : "text-[11px] tracking-[0.14em] uppercase text-black/45 hover:text-black transition-colors"
                  }
                  style={{ fontWeight: 600 }}
                >
                  {link}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 ml-auto md:ml-0 shrink-0">
              {searchOpen ? (
                <div className="flex items-center gap-2 border-b border-black pb-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    className="text-[13px] outline-none bg-transparent text-[#0A0A0A] placeholder-black/25 w-32"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <button onClick={() => setSearchOpen(false)}>
                    <X size={14} className="text-black/40" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-black/50 hover:text-black transition-colors">
                  <Search size={16} />
                </button>
              )}
              <a
                href="#"
                className="hidden md:block text-[11px] tracking-[0.12em] uppercase border border-black px-4 py-1.5 hover:bg-black hover:text-white transition-colors"
                style={{ fontWeight: 600 }}
              >
                Subscribe
              </a>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <nav className="md:hidden border-t border-black/8 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link} href="#" className="text-[13px] tracking-[0.1em] uppercase py-2.5 border-b border-black/5 last:border-0 text-black/70">
                  {link}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </header>
  );
}

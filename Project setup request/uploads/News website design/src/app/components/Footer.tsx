export function Footer() {
  const cols = [
    { title: "News", links: ["World", "Business", "Technology", "Climate", "Science", "Culture"] },
    { title: "Opinion", links: ["Editorials", "Columnists", "Letters", "Essays"] },
    { title: "Video", links: ["Latest", "Documentaries", "Interviews", "Explainers"] },
    { title: "Company", links: ["About", "Careers", "Press", "Advertising", "Contact"] },
  ];

  return (
    <footer style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="bg-[#0A0A0A] px-5 md:px-10 pt-14 pb-8">
        <div className="max-w-screen-xl mx-auto">

          {/* Masthead */}
          <div className="mb-12 pb-10 border-b border-white/8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div
                className="text-white text-[48px] leading-none tracking-[0.12em]"
                style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800 }}
              >
                Y-O-X
              </div>
              <p
                className="text-white/25 text-[13px] mt-3 max-w-xs leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
              >
                Independent journalism for a complex world. Est. 1887.
              </p>
            </div>
            <a
              href="#"
              className="self-start md:self-auto inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-colors"
              style={{ fontWeight: 700 }}
            >
              Subscribe
            </a>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {cols.map((col) => (
              <div key={col.title}>
                <h4
                  className="text-[9px] tracking-[0.3em] uppercase text-white/20 mb-5"
                  style={{ fontWeight: 700 }}
                >
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] text-white/40 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/20">© 2026 Y-O-X News. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {["Privacy", "Terms", "Cookies", "Accessibility"].map((item) => (
                <a key={item} href="#" className="text-[11px] text-white/20 hover:text-white/50 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

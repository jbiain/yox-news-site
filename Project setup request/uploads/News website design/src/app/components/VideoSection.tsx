import { Play, ArrowRight } from "lucide-react";

const videos = [
  {
    id: "v1",
    title: "Inside the Summit",
    subtitle: "How 78 nations rewrote the rules of global security in 72 hours",
    duration: "14:32",
    category: "World",
    categoryColor: "#FF2D20",
    views: "128K",
    thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjaXR5JTIwdXJiYW4lMjBhcmNoaXRlY3R1cmUlMjBza3lsaW5lfGVufDF8fHx8MTc4MjgxMjY2MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "v2",
    title: "The Fed, Explained",
    subtitle: "What the new policy signals mean for your money",
    duration: "8:47",
    category: "Business",
    categoryColor: "#0052CC",
    views: "74K",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "v3",
    title: "Arctic Recovery",
    subtitle: "Scientists explain what the data really shows",
    duration: "11:20",
    category: "Climate",
    categoryColor: "#047857",
    views: "52K",
    thumbnail: "https://images.unsplash.com/photo-1766699623469-32a2c3b17a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjbGltYXRlJTIwZW52aXJvbm1lbnQlMjBzY2llbmNlJTIwcmVzZWFyY2h8ZW58MXx8fHwxNzgyODEyNjYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function VideoSection() {
  const [featured, ...rest] = videos;

  return (
    <section className="bg-[#0A0A0A] px-5 md:px-10 py-14">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="relative mb-10">
          <span
            className="absolute -top-5 left-0 text-[80px] md:text-[110px] leading-none select-none pointer-events-none text-white/[0.03]"
            style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }}
            aria-hidden
          >
            Video
          </span>
          <div className="flex items-center justify-between border-b border-white/8 pb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-2 h-2 rounded-full bg-white" />
              <span
                className="text-[11px] tracking-[0.22em] uppercase text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                Video
              </span>
            </div>
            <a
              href="#"
              className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-white/30 hover:text-white transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              All Videos <ArrowRight size={11} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-5">
          {/* Featured */}
          <div className="group cursor-pointer relative overflow-hidden lg:col-span-1" style={{ aspectRatio: "3/4" }}>
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-[1.03] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-white/60 group-hover:border-white flex items-center justify-center transition-colors">
                <Play size={18} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span
                className="text-[9px] tracking-[0.25em] uppercase mb-2 block"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: featured.categoryColor }}
              >
                {featured.category}
              </span>
              <h3
                className="text-white leading-tight tracking-[-0.02em] mb-1"
                style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800, fontSize: "22px" }}
              >
                {featured.title}
              </h3>
              <p className="text-white/50 text-[12px] mb-3" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                {featured.subtitle}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-white/30" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span>{featured.duration}</span>
                <span>·</span>
                <span>{featured.views} views</span>
              </div>
            </div>
          </div>

          {/* Side videos */}
          {rest.map((video) => (
            <div key={video.id} className="group cursor-pointer relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-white/40 group-hover:border-white flex items-center justify-center transition-colors">
                  <Play size={13} className="text-white ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span
                  className="text-[9px] tracking-[0.25em] uppercase mb-2 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: video.categoryColor }}
                >
                  {video.category}
                </span>
                <h3
                  className="text-white leading-tight tracking-[-0.02em] mb-1"
                  style={{ fontFamily: "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif", fontWeight: 800, fontSize: "18px" }}
                >
                  {video.title}
                </h3>
                <p className="text-white/40 text-[12px] mb-3" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                  {video.subtitle}
                </p>
                <div className="text-[11px] text-white/25" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {video.duration} · {video.views} views
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "./components/Header";
import { VideoSection } from "./components/VideoSection";
import { Footer } from "./components/Footer";
import { type Article } from "./components/NewsCard";
import { MobileFeed } from "./components/MobileFeed";
import { DesktopFeed } from "./components/DesktopFeed";
import { AISearch } from "./components/AISearch";
import { ArticleReader } from "./components/ArticleReader";
import { InvestigationsSection } from "./components/InvestigationsSection";
import { AdminPanel } from "./components/AdminPanel";
import { useAdminArticles } from "./hooks/useAdminArticles";
import { useIsMobile } from "./components/ui/use-mobile";

const worldArticles: Article[] = [
  {
    id: "w1",
    category: "World",
    categoryColor: "#FF2D20",
    headline: "NATO Allies Debate Expansion of Eastern European Defense Perimeter",
    excerpt: "Alliance members convened in Brussels to weigh the strategic implications of extending Article 5 protections to new observer states.",
    author: "Eleanor Whitmore",
    time: "3h ago",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1487900562037-056962ab1fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHx3b3JsZCUyMG5ld3MlMjBwb2xpdGljcyUyMGpvdXJuYWxpc218ZW58MXx8fHwxNzgyODEyNjU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "w2",
    category: "World",
    categoryColor: "#FF2D20",
    headline: "Syrian Reconstruction Funds Stall Over International Governance Dispute",
    excerpt: "Pledged billions remain frozen as donor nations clash over oversight mechanisms.",
    author: "Amara Osei",
    time: "5h ago",
    image: "https://images.unsplash.com/photo-1505262744895-ac5705911f6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx3b3JsZCUyMG5ld3MlMjBwb2xpdGljcyUyMGpvdXJuYWxpc218ZW58MXx8fHwxNzgyODEyNjU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "w3",
    category: "World",
    categoryColor: "#FF2D20",
    headline: "India–Pakistan Border Talks Enter Third Day With No Breakthrough",
    author: "Priya Mehta",
    time: "8h ago",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjaXR5JTIwdXJiYW4lMjBhcmNoaXRlY3R1cmUlMjBza3lsaW5lfGVufDF8fHx8MTc4MjgxMjY2MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "w4",
    category: "World",
    categoryColor: "#FF2D20",
    headline: "UN Peacekeeping Mission Expanded Amid Escalating Sahel Violence",
    author: "Louis Mbeki",
    time: "10h ago",
  },
];

const businessArticles: Article[] = [
  {
    id: "b1",
    category: "Business",
    categoryColor: "#0052CC",
    headline: "IMF Downgrades Global Growth Forecast on Persistent Trade Fragmentation",
    excerpt: "The fund trimmed its 2026 outlook to 2.8%, citing structural shifts in supply chains.",
    author: "Marcus Chen",
    time: "2h ago",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "b2",
    category: "Business",
    categoryColor: "#0052CC",
    headline: "Semiconductor Alliance Announces $200B Joint Investment in Advanced Fabs",
    excerpt: "Asian and European manufacturers co-fund next-generation chip plants.",
    author: "Lin Wei",
    time: "4h ago",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "b3",
    category: "Business",
    categoryColor: "#0052CC",
    headline: "Luxury Sector Posts Strongest Quarter in Five Years on Asian Demand Surge",
    author: "Isabelle Fontaine",
    time: "6h ago",
  },
  {
    id: "b4",
    category: "Business",
    categoryColor: "#0052CC",
    headline: "Private Credit Market Surpasses $2 Trillion for First Time",
    author: "James Farrow",
    time: "9h ago",
  },
];

const techArticles: Article[] = [
  {
    id: "t1",
    category: "Tech",
    categoryColor: "#6D28D9",
    headline: "OpenAI Rival Claims AGI Threshold Met in Controlled Lab Environment",
    excerpt: "Researchers say their model demonstrates generalizable reasoning across 14 domains.",
    author: "Dr. Sophie Laurent",
    time: "1h ago",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1621264448270-9ef00e88a935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "t2",
    category: "Tech",
    categoryColor: "#6D28D9",
    headline: "Quantum Internet Pilot Connects Five Cities Across Central Europe",
    author: "Henrik Bauer",
    time: "4h ago",
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "t3",
    category: "Tech",
    categoryColor: "#6D28D9",
    headline: "Biometric Data Lawsuit Forces Policy Overhaul at Three Tech Giants",
    author: "Natasha Ivanova",
    time: "7h ago",
  },
  {
    id: "t4",
    category: "Tech",
    categoryColor: "#6D28D9",
    headline: "First Commercial Quantum Computer Clears 1,000-Qubit Milestone",
    author: "Dr. Rajan Pillai",
    time: "11h ago",
  },
];

const opinionPieces: Article[] = [
  {
    id: "o1",
    category: "Opinion",
    categoryColor: "#B45309",
    headline: "The Illusion of Stability: Why the Current World Order Cannot Hold",
    excerpt: "Five converging pressures are eroding the foundations of the post-1945 settlement faster than most analysts acknowledge.",
    author: "Prof. Alicia Montero",
    time: "Today",
    image: "https://images.unsplash.com/photo-1507961455425-0caef37ef6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjaXR5JTIwdXJiYW4lMjBhcmNoaXRlY3R1cmUlMjBza3lsaW5lfGVufDF8fHx8MTc4MjgxMjY2MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "o2",
    category: "Opinion",
    categoryColor: "#B45309",
    headline: "Central Bankers Are Flying Blind in an Age of Structural Inflation",
    excerpt: "The models central banks rely on were built for a world that no longer exists.",
    author: "Dr. Samuel Bright",
    time: "Today",
    image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "o3",
    category: "Opinion",
    categoryColor: "#B45309",
    headline: "The Case for a Global AI Moratorium Has Never Been Stronger",
    excerpt: "Last week's disclosure should be a turning point — if governments have the courage to act.",
    author: "Prof. Lena Fischer",
    time: "Today",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwYnVzaW5lc3MlMjBlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3ODI4MTI2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";

export default function App() {
  const isMobile = useIsMobile();
  const [aiOpen, setAIOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const { adminArticles, addArticle, removeArticle, updateArticle } = useAdminArticles();

  // Secret shortcut: Ctrl+Shift+E opens editorial admin
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setAdminOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const allFeedArticles = [
    ...adminArticles,
    ...worldArticles,
    ...businessArticles,
    ...techArticles,
    ...opinionPieces,
  ].filter((a) => a.image || adminArticles.some((aa) => aa.id === a.id));

  // Mobile: TikTok-style full-screen feed
  if (isMobile) {
    return (
      <>
        {selectedArticle ? (
          <ArticleReader
            article={selectedArticle}
            feedArticles={allFeedArticles}
            onClose={() => setSelectedArticle(null)}
          />
        ) : (
          <MobileFeed
            articles={allFeedArticles}
            onAIOpen={() => setAIOpen(true)}
            onArticleSelect={setSelectedArticle}
          />
        )}
        <AISearch open={aiOpen} onClose={() => setAIOpen(false)} />
        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          adminArticles={adminArticles}
          onAdd={addArticle}
          onRemove={removeArticle}
          onUpdate={updateArticle}
        />
      </>
    );
  }

  // Desktop: TikTok-style snap feed
  return (
    <div
      className="h-[100dvh] flex flex-col bg-[#0A0A0A] overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Header />

      {/* AI bar — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-md px-5 md:px-10 py-3 border-t border-white/8">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setAIOpen(true)}
            className="flex-1 flex items-center gap-3 bg-white/6 border border-white/10 hover:border-white/25 px-4 py-2.5 text-left transition-colors group"
          >
            <Sparkles size={14} className="text-white/30 group-hover:text-white/60 shrink-0" />
            <span className="text-[13px] text-white/25 group-hover:text-white/50 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Ask Y-O-X AI anything — "What happened at the summit?" "Explain today's market moves..."
            </span>
            <span
              className="ml-auto text-[10px] tracking-[0.15em] uppercase text-white/20 group-hover:text-white/40 shrink-0 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              Ask AI
            </span>
          </button>
          <button
            onClick={() => setAIOpen(true)}
            className="text-[11px] tracking-[0.14em] uppercase text-white border border-white/15 px-4 py-2.5 hover:bg-white hover:text-black transition-colors shrink-0"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            Documents
          </button>
        </div>
      </div>

      <AISearch open={aiOpen} onClose={() => setAIOpen(false)} />

      {/* Main feed — single snap scroll, article slides + trailing sections */}
      <div className="flex-1 overflow-hidden">
        {selectedArticle ? (
          <ArticleReader
            article={selectedArticle}
            feedArticles={allFeedArticles}
            onClose={() => setSelectedArticle(null)}
          />
        ) : (
          <DesktopFeed
            articles={allFeedArticles}
            onArticleSelect={setSelectedArticle}
            trailing={[
              <InvestigationsSection />,
              <VideoSection />,
              <Footer />,
            ]}
          />
        )}
      </div>

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        adminArticles={adminArticles}
        onAdd={addArticle}
        onRemove={removeArticle}
          onUpdate={updateArticle}
      />
    </div>
  );
}

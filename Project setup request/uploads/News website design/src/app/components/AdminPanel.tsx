import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Eye, Upload, CheckCircle, AlertCircle, Image as ImageIcon, Pencil, RotateCcw, FileImage, Clipboard } from "lucide-react";
import type { Article } from "./NewsCard";

const AVENIR = "'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif";
const GROTESK = "'Space Grotesk', sans-serif";
const INTER = "'Inter', sans-serif";

const CATEGORIES = [
  { label: "World", color: "#FF2D20" },
  { label: "Business", color: "#0052CC" },
  { label: "Tech", color: "#6D28D9" },
  { label: "Climate", color: "#047857" },
  { label: "Opinion", color: "#B45309" },
  { label: "Data", color: "#0891B2" },
  { label: "Investigations", color: "#FF2D20" },
];

const QUICK_IMAGES = [
  { label: "City", url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { label: "Finance", url: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { label: "Tech", url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { label: "Climate", url: "https://images.unsplash.com/photo-1571845599234-790a035f6109?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { label: "Politics", url: "https://images.unsplash.com/photo-1487900562037-056962ab1fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { label: "Skyline", url: "https://images.unsplash.com/photo-1534298261662-f8fdd25317db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
];

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  adminArticles: Article[];
  onAdd: (article: Article) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Article>) => void;
}

const EMPTY_FORM = {
  headline: "",
  excerpt: "",
  body: "",
  author: "",
  category: "World",
  imageUrl: "",
  readTime: "4 min",
};

function PreviewCard({ article }: { article: Partial<Article> }) {
  const color = CATEGORIES.find((c) => c.label === article.category)?.color ?? "#FF2D20";
  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] rounded" style={{ aspectRatio: "3/4" }}>
      {article.image ? (
        <img src={article.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-65" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={32} className="text-white/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span className="text-[8px] tracking-[0.25em] uppercase px-2 py-0.5 text-white mb-2 inline-block"
          style={{ fontFamily: GROTESK, fontWeight: 700, backgroundColor: color }}>
          {article.category || "Category"}
        </span>
        <h3 className="text-white leading-snug mb-1.5" style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "14px" }}>
          {article.headline || "Your headline will appear here"}
        </h3>
        {article.excerpt && (
          <p className="text-white/50 text-[11px] leading-snug mb-2 line-clamp-2" style={{ fontFamily: INTER }}>
            {article.excerpt}
          </p>
        )}
        <div className="text-white/40 text-[10px]" style={{ fontFamily: INTER }}>
          {article.author || "Author"} · Just now
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({ open, onClose, adminArticles, onAdd, onRemove, onUpdate }: AdminPanelProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tab, setTab] = useState<"new" | "manage">("new");
  const [published, setPublished] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"upload" | "url" | "quick">("upload");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const headlineRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bodyCopied, setBodyCopied] = useState(false);

  const selectAllBody = () => {
    bodyRef.current?.focus();
    bodyRef.current?.select();
  };

  const copyBody = () => {
    if (!form.body) return;
    navigator.clipboard.writeText(form.body).then(() => {
      setBodyCopied(true);
      setTimeout(() => setBodyCopied(false), 1500);
    });
  };

  useEffect(() => {
    if (open) setTimeout(() => headlineRef.current?.focus(), 100);
  }, [open]);

  const categoryColor = CATEGORIES.find((c) => c.label === form.category)?.color ?? "#FF2D20";

  const canPublish = form.headline.trim().length > 5 && form.author.trim().length > 0;

  // Auto-generate excerpt from first body paragraph if excerpt is empty
  const effectiveExcerpt = form.excerpt.trim() ||
    (form.body ? form.body.split("\n\n")[0]?.slice(0, 160) : "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imageUrl: ev.target?.result as string }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (article: Article) => {
    setForm({
      headline: article.headline,
      excerpt: article.excerpt ?? "",
      body: article.body ?? "",
      author: article.author,
      category: article.category,
      imageUrl: article.image ?? "",
      readTime: article.readTime ?? "4 min",
    });
    setEditingId(article.id);
    setImageMode(article.image?.startsWith("data:") ? "upload" : article.image ? "url" : "quick");
    setTab("new");
    setTimeout(() => headlineRef.current?.focus(), 100);
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const publish = () => {
    if (!canPublish) return;
    const patch: Partial<Article> = {
      headline: form.headline.trim(),
      excerpt: effectiveExcerpt || undefined,
      body: form.body.trim() || undefined,
      author: form.author.trim(),
      category: form.category,
      categoryColor,
      image: form.imageUrl || undefined,
      readTime: form.readTime,
    };
    if (editingId) {
      onUpdate(editingId, patch);
      setPublished(`Updated: ${form.headline}`);
      setEditingId(null);
    } else {
      onAdd({ id: `admin-${Date.now()}`, time: "Just now", ...patch } as Article);
      setPublished(form.headline);
    }
    setForm(EMPTY_FORM);
    setTimeout(() => setPublished(null), 3000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0D0D0D]" style={{ fontFamily: INTER }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FF2D20]" />
          <span className="text-white text-[13px] tracking-[0.15em]" style={{ fontFamily: AVENIR, fontWeight: 900 }}>Y-O-X</span>
          <span className="text-white/20 text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: GROTESK }}>Editorial</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/20" style={{ fontFamily: GROTESK }}>Internal · not public</span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1"><X size={16} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/8 shrink-0">
        {(["new", "manage"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2.5 text-[11px] tracking-[0.15em] uppercase border-b-2 transition-colors ${tab === t ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}
            style={{ fontFamily: GROTESK, fontWeight: 600 }}>
            {t === "new" ? (editingId ? "Edit Article" : "New Article") : `Manage (${adminArticles.length})`}
          </button>
        ))}
      </div>

      {tab === "new" ? (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_300px]">

          {/* Form */}
          <div className="overflow-y-auto px-6 md:px-10 py-7 flex flex-col gap-5">

            {/* Edit mode banner */}
            {editingId && (
              <div className="flex items-center justify-between bg-[#6D28D9]/10 border border-[#6D28D9]/25 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Pencil size={13} className="text-[#a78bfa] shrink-0" />
                  <span className="text-[#a78bfa] text-[13px]">Editing — changes update the live feed</span>
                </div>
                <button onClick={cancelEdit} className="flex items-center gap-1.5 text-[11px] text-[#a78bfa]/60 hover:text-[#a78bfa] transition-colors"
                  style={{ fontFamily: GROTESK, fontWeight: 600 }}>
                  <RotateCcw size={11} /> Cancel
                </button>
              </div>
            )}

            {published && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-3">
                <CheckCircle size={14} className="text-green-400 shrink-0" />
                <span className="text-green-400 text-[13px]">{published.slice(0, 80)}{published.length > 80 ? "…" : ""}</span>
              </div>
            )}

            {/* Headline */}
            <div>
              <label className="text-[9px] tracking-[0.25em] uppercase text-white/30 block mb-2" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Headline *</label>
              <textarea ref={headlineRef} value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                placeholder="Write a clear, impactful headline..." rows={2}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 outline-none placeholder-white/20 resize-none focus:border-white/25 transition-colors"
                style={{ fontFamily: AVENIR, fontWeight: 900, fontSize: "18px", lineHeight: 1.2 }} />
            </div>

            {/* Full article body */}
            <div>
              <div className="flex items-center justify-between mb-2 gap-3">
                <label className="text-[9px] tracking-[0.25em] uppercase text-white/30 shrink-0" style={{ fontFamily: GROTESK, fontWeight: 600 }}>
                  Article Body
                </label>
                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-[9px] text-white/20 font-mono hidden lg:block">
                    --- = page &nbsp;·&nbsp; # H1 &nbsp;·&nbsp; &gt; quote &nbsp;·&nbsp; **bold** &nbsp;·&nbsp; *italic*
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={selectAllBody}
                      className="text-[9px] tracking-[0.12em] uppercase text-white/30 hover:text-white/70 px-2 py-0.5 border border-white/10 hover:border-white/25 transition-colors"
                      style={{ fontFamily: GROTESK }}>
                      Select all
                    </button>
                    <button onClick={copyBody} disabled={!form.body}
                      className={`flex items-center gap-1 text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 border transition-colors ${bodyCopied ? "text-green-400 border-green-500/30" : "text-white/30 hover:text-white/70 border-white/10 hover:border-white/25"} disabled:opacity-20`}
                      style={{ fontFamily: GROTESK }}>
                      <Clipboard size={10} />
                      {bodyCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
              <textarea ref={bodyRef} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={"Write the full article here...\n\nEach blank line separates a paragraph. Two paragraphs make one reading page in the feed."}
                rows={12}
                className="w-full bg-white/5 border border-white/10 text-white/80 px-4 py-3 outline-none placeholder-white/20 resize-y focus:border-white/25 transition-colors text-[14px] leading-[1.7]"
                style={{ fontFamily: INTER, minHeight: "240px" }} />
            </div>

            {/* Excerpt (optional override) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] tracking-[0.25em] uppercase text-white/30" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Excerpt</label>
                <span className="text-[9px] text-white/20" style={{ fontFamily: INTER }}>
                  {form.excerpt ? "Custom" : "Auto-generated from first paragraph"}
                </span>
              </div>
              <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder={effectiveExcerpt || "Auto-generated from article body, or write a custom summary..."}
                rows={2}
                className="w-full bg-white/5 border border-white/10 text-white/70 px-4 py-3 outline-none placeholder-white/15 resize-none focus:border-white/25 transition-colors text-[13px] leading-relaxed" />
            </div>

            {/* Author + Read time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] tracking-[0.25em] uppercase text-white/30 block mb-2" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Author *</label>
                <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="Full name"
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 outline-none placeholder-white/20 text-[13px] focus:border-white/25 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] tracking-[0.25em] uppercase text-white/30 block mb-2" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Read Time</label>
                <input value={form.readTime} onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                  placeholder="e.g. 4 min"
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 outline-none placeholder-white/20 text-[13px] focus:border-white/25 transition-colors" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[9px] tracking-[0.25em] uppercase text-white/30 block mb-3" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat.label} onClick={() => setForm((f) => ({ ...f, category: cat.label }))}
                    className="px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase border transition-colors"
                    style={{
                      fontFamily: GROTESK, fontWeight: 600,
                      borderColor: form.category === cat.label ? cat.color : "rgba(255,255,255,0.1)",
                      color: form.category === cat.label ? cat.color : "rgba(255,255,255,0.4)",
                      backgroundColor: form.category === cat.label ? `${cat.color}15` : "transparent",
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover image */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] tracking-[0.25em] uppercase text-white/30" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Cover Image</label>
                <div className="flex gap-1">
                  {(["upload", "quick", "url"] as const).map((m) => (
                    <button key={m} onClick={() => setImageMode(m)}
                      className={`text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 transition-colors ${imageMode === m ? "text-white bg-white/10" : "text-white/30 hover:text-white/50"}`}
                      style={{ fontFamily: GROTESK }}>
                      {m === "upload" ? "Upload" : m === "quick" ? "Quick" : "URL"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current image preview + delete */}
              {form.imageUrl && (
                <div className="relative mb-3 group">
                  <img src={form.imageUrl} alt="Cover" className="w-full h-28 object-cover opacity-80" />
                  <button
                    onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-[#FF2D20] text-white p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="absolute bottom-2 left-2 text-[9px] text-white/50 bg-black/50 px-1.5 py-0.5" style={{ fontFamily: INTER }}>
                    {form.imageUrl.startsWith("data:") ? "Uploaded image" : "URL image"}
                  </div>
                </div>
              )}

              {imageMode === "upload" && (
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/35 py-6 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {uploading ? (
                      <span className="text-[12px]" style={{ fontFamily: INTER }}>Processing...</span>
                    ) : (
                      <>
                        <FileImage size={16} />
                        <span className="text-[12px]" style={{ fontFamily: INTER }}>
                          {form.imageUrl ? "Replace image" : "Upload from computer"}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-white/20 mt-1.5" style={{ fontFamily: INTER }}>
                    JPG, PNG, WebP — stored locally in browser
                  </p>
                </div>
              )}

              {imageMode === "url" && (
                <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="Paste image URL..."
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 outline-none placeholder-white/20 text-[13px] focus:border-white/25 transition-colors" />
              )}

              {imageMode === "quick" && (
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_IMAGES.map((img) => (
                    <button key={img.label} onClick={() => setForm((f) => ({ ...f, imageUrl: img.url }))}
                      className="relative overflow-hidden group" style={{ aspectRatio: "16/9" }}>
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                      <div className={`absolute inset-0 border-2 transition-colors ${form.imageUrl === img.url ? "border-white" : "border-transparent"}`} />
                      <span className="absolute bottom-1 left-1 text-[8px] text-white bg-black/50 px-1" style={{ fontFamily: INTER }}>{img.label}</span>
                    </button>
                  ))}
                  <button onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className={`border border-dashed flex items-center justify-center transition-colors ${!form.imageUrl ? "border-white/40" : "border-white/10 hover:border-white/30"}`}
                    style={{ aspectRatio: "16/9" }}>
                    <span className="text-[9px] text-white/30" style={{ fontFamily: INTER }}>None</span>
                  </button>
                </div>
              )}
            </div>

            {/* Publish / Update */}
            <div className="flex items-center gap-3 pt-1 pb-4">
              <button onClick={publish} disabled={!canPublish}
                className={`flex items-center gap-2 px-6 py-3 text-[11px] tracking-[0.15em] uppercase transition-colors ${canPublish ? (editingId ? "bg-[#6D28D9] text-white hover:bg-[#5b21b6]" : "bg-white text-[#0D0D0D] hover:bg-white/90") : "bg-white/10 text-white/30 cursor-not-allowed"}`}
                style={{ fontFamily: GROTESK, fontWeight: 700 }}>
                {editingId ? <Pencil size={13} /> : <Upload size={13} />}
                {editingId ? "Save Changes" : "Publish to Feed"}
              </button>
              {editingId && <button onClick={cancelEdit} className="text-[11px] text-white/30 hover:text-white/60 transition-colors" style={{ fontFamily: GROTESK }}>Cancel</button>}
              {!canPublish && (
                <span className="text-[11px] text-white/25 flex items-center gap-1.5">
                  <AlertCircle size={11} /> Headline and author required
                </span>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="hidden lg:flex flex-col border-l border-white/8 bg-black/20">
            <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
              <Eye size={12} className="text-white/30" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/30" style={{ fontFamily: GROTESK, fontWeight: 600 }}>Feed Preview</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 overflow-y-auto">
              <div className="w-full max-w-[220px]">
                <PreviewCard article={{ headline: form.headline, excerpt: effectiveExcerpt || form.excerpt, author: form.author, category: form.category, categoryColor, image: form.imageUrl || undefined }} />
              </div>
              {form.body && (
                <div className="w-full mt-2">
                  <div className="text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2" style={{ fontFamily: GROTESK }}>Article body</div>
                  <p className="text-white/30 text-[11px] leading-relaxed line-clamp-6" style={{ fontFamily: INTER }}>
                    {form.body}
                  </p>
                  <div className="text-[9px] text-white/20 mt-1.5" style={{ fontFamily: INTER }}>
                    ~{Math.ceil(form.body.split(/\s+/).length / 200)} min read · {form.body.split("\n\n").filter(Boolean).length} paragraphs
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* Manage */
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          {adminArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <Plus size={24} className="text-white/15" />
              <p className="text-white/25 text-[13px]" style={{ fontFamily: INTER }}>No custom articles yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {adminArticles.map((article) => (
                <div key={article.id} className="flex items-start gap-4 bg-white/4 border border-white/8 p-4 hover:border-white/15 transition-colors group">
                  {article.image && (
                    <div className="w-16 h-12 shrink-0 overflow-hidden">
                      <img src={article.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] tracking-[0.2em] uppercase"
                        style={{ fontFamily: GROTESK, fontWeight: 700, color: CATEGORIES.find((c) => c.label === article.category)?.color ?? "#FF2D20" }}>
                        {article.category}
                      </span>
                      <span className="text-[9px] bg-green-500/15 text-green-400 border border-green-500/20 px-1.5 py-0.5 tracking-wider uppercase" style={{ fontFamily: GROTESK }}>Live</span>
                      {article.body && <span className="text-[9px] text-white/25 border border-white/10 px-1.5 py-0.5 tracking-wider uppercase" style={{ fontFamily: GROTESK }}>Full article</span>}
                    </div>
                    <h4 className="text-white text-[14px] leading-snug mb-1" style={{ fontFamily: AVENIR, fontWeight: 700 }}>{article.headline}</h4>
                    {article.excerpt && <p className="text-white/35 text-[11px] leading-relaxed mb-1 line-clamp-1" style={{ fontFamily: INTER }}>{article.excerpt}</p>}
                    <p className="text-white/30 text-[11px]" style={{ fontFamily: INTER }}>{article.author} · {article.time}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(article)} className="text-white/30 hover:text-white transition-colors p-1.5" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onRemove(article.id)} className="text-white/20 hover:text-[#FF2D20] transition-colors p-1.5" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="shrink-0 px-6 py-2.5 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] text-white/15" style={{ fontFamily: INTER }}>
          <kbd className="bg-white/8 px-1 py-0.5 rounded text-white/30">Ctrl</kbd> +{" "}
          <kbd className="bg-white/8 px-1 py-0.5 rounded text-white/30">Shift</kbd> +{" "}
          <kbd className="bg-white/8 px-1 py-0.5 rounded text-white/30">E</kbd> to toggle · Saved in browser storage
        </p>
        <p className="text-[10px] text-white/15" style={{ fontFamily: INTER }}>
          {adminArticles.length} article{adminArticles.length !== 1 ? "s" : ""} live
        </p>
      </div>
    </div>
  );
}

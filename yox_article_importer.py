#!/usr/bin/env python3
import json
import posixpath
import re
from pathlib import Path


SITE_DIR = Path("/root/yox-news-site")
ARTICLES_DIR = SITE_DIR / "articles"
STATE_PATH = SITE_DIR / "site-state.json"
ARTICLES_JSON_PATH = SITE_DIR / "articles.json"

DEFAULT_CATEGORY_COLORS = {
    "World": "#FF2D20",
    "Business": "#0052CC",
    "Tech": "#6D28D9",
    "Climate": "#047857",
    "Opinion": "#B45309",
    "Data": "#0891B2",
    "Investigations": "#FF2D20",
}


def read_json(path: Path, fallback):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=True, indent=2)
    tmp.replace(path)


def parse_scalar(raw: str):
    value = raw.strip()
    if not value:
        return ""
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    lower = value.lower()
    if lower == "true":
        return True
    if lower == "false":
        return False
    if lower in {"null", "none"}:
        return None
    return value


def parse_frontmatter(text: str):
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    raw_meta = text[4:end]
    body = text[end + 5 :]
    meta = {}
    lines = raw_meta.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if ":" not in line:
            i += 1
            continue
        key, raw = line.split(":", 1)
        key = key.strip()
        raw = raw.strip()
        if raw:
            meta[key] = parse_scalar(raw)
            i += 1
            continue
        items = []
        i += 1
        while i < len(lines):
            nested = lines[i]
            stripped = nested.strip()
            if stripped.startswith("- "):
                items.append(parse_scalar(stripped[2:]))
                i += 1
                continue
            if nested.startswith("  - "):
                items.append(parse_scalar(nested[4:]))
                i += 1
                continue
            break
        meta[key] = items
    return meta, body.strip()


def split_language_bodies(body: str):
    text = body.strip()
    if not text:
        return {"en": "", "es": ""}

    marker_re = re.compile(r"^\s*<!--\s*body:(en|es)\s*-->\s*$", re.MULTILINE)
    matches = list(marker_re.finditer(text))
    if not matches:
        return {"en": text, "es": ""}

    sections = {"en": "", "es": ""}
    for idx, match in enumerate(matches):
        lang = match.group(1)
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        sections[lang] = text[start:end].strip()

    if matches[0].start() > 0 and not sections["en"]:
        sections["en"] = text[:matches[0].start()].strip()
    return sections


def slugify(value: str):
    lowered = value.lower()
    lowered = re.sub(r"[^a-z0-9]+", "-", lowered)
    lowered = re.sub(r"-{2,}", "-", lowered)
    return lowered.strip("-") or "article"


def resolve_asset_url(article_dir: Path, raw_path: str):
    if not raw_path:
        return raw_path
    if re.match(r"^(?:[a-z]+:)?//", raw_path) or raw_path.startswith(("/", "#", "mailto:", "data:", "yox-img://")):
        return raw_path
    resolved = (article_dir / raw_path).resolve()
    try:
        rel = resolved.relative_to(SITE_DIR.resolve())
    except ValueError:
        rel = Path(raw_path)
    return "/" + rel.as_posix()


def rewrite_body_paths(body: str, article_dir: Path):
    def repl(match):
        label = match.group(1)
        target = match.group(2).strip()
        rewritten = resolve_asset_url(article_dir, target)
        return f"{label}{rewritten})"

    return re.sub(r"(!?\[[^\]]*\]\()([^)]+)\)", repl, body)


def first_excerpt(body: str):
    for block in re.split(r"\n\s*\n", body):
        text = block.strip()
        if not text:
            continue
        if text.startswith(("#", "![", ">")):
            continue
        return text[:160]
    return None


def load_markdown_parts(article_md: Path):
    raw = article_md.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)
    article_dir = article_md.parent
    lang_bodies = split_language_bodies(body)
    return {
        "meta": meta,
        "body": rewrite_body_paths(lang_bodies.get("en") or "", article_dir),
        "bodyEs": rewrite_body_paths(lang_bodies.get("es") or "", article_dir),
        "path": article_md,
    }


def load_article_dir(article_dir: Path):
    legacy = article_dir / "article.md"
    en_file = article_dir / "article.en.md"
    es_file = article_dir / "article.es.md"

    if en_file.exists() or es_file.exists():
        en = load_markdown_parts(en_file) if en_file.exists() else None
        es = load_markdown_parts(es_file) if es_file.exists() else None

        meta_source = (en or es)["meta"]
        if meta_source.get("published", True) is False:
            return None

        title = (en["meta"].get("title") if en else None) or meta_source.get("title") or article_dir.name.replace("-", " ").title()
        category = meta_source.get("category") or "World"
        cover = meta_source.get("cover") or meta_source.get("image") or ""
        article = {
            "id": meta_source.get("id") or article_dir.name,
            "headline": title,
            "excerpt": (en["meta"].get("excerpt") if en else None) or first_excerpt(en["body"] if en else ""),
            "body": (en["body"] if en else "") or None,
            "headlineEs": (es["meta"].get("title") if es else None) or None,
            "excerptEs": (es["meta"].get("excerpt") if es else None) or first_excerpt(es["body"] if es else "") or None,
            "bodyEs": (es["body"] if es else "") or None,
            "author": meta_source.get("author") or "Unknown",
            "category": category,
            "categoryColor": meta_source.get("categoryColor") or DEFAULT_CATEGORY_COLORS.get(category, "#FF2D20"),
            "image": resolve_asset_url(article_dir, cover) if cover else None,
            "readTime": meta_source.get("readTime") or "4 min",
            "time": meta_source.get("time") or meta_source.get("date") or article_dir.parent.name,
            "date": meta_source.get("date") or article_dir.parent.name,
            "tags": meta_source.get("tags") if isinstance(meta_source.get("tags"), list) else [],
            "sourcePath": "/" + ((en_file if en_file.exists() else es_file).relative_to(SITE_DIR)).as_posix(),
            "sourceType": "file",
        }
        return article

    if not legacy.exists():
        return None

    raw = legacy.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)
    if meta.get("published", True) is False:
        return None

    title = meta.get("title") or meta.get("headline") or article_dir.name.replace("-", " ").title()
    category = meta.get("category") or "World"
    lang_bodies = split_language_bodies(body)
    body_en = rewrite_body_paths(lang_bodies.get("en") or "", article_dir)
    body_es = rewrite_body_paths(lang_bodies.get("es") or "", article_dir)
    cover = meta.get("cover") or meta.get("image") or ""

    article = {
        "id": meta.get("id") or article_dir.name,
        "headline": title,
        "excerpt": meta.get("excerpt") or first_excerpt(body_en),
        "body": body_en or None,
        "headlineEs": meta.get("headlineEs") or meta.get("titleEs") or None,
        "excerptEs": meta.get("excerptEs") or first_excerpt(body_es) or None,
        "bodyEs": body_es or None,
        "author": meta.get("author") or "Unknown",
        "category": category,
        "categoryColor": meta.get("categoryColor") or DEFAULT_CATEGORY_COLORS.get(category, "#FF2D20"),
        "image": resolve_asset_url(article_dir, cover) if cover else None,
        "readTime": meta.get("readTime") or "4 min",
        "time": meta.get("time") or meta.get("date") or article_dir.parent.name,
        "date": meta.get("date") or article_dir.parent.name,
        "tags": meta.get("tags") if isinstance(meta.get("tags"), list) else [],
        "sourcePath": "/" + legacy.relative_to(SITE_DIR).as_posix(),
        "sourceType": "file",
    }
    return article


def build_categories(existing_categories, articles):
    by_label = {}
    for category in existing_categories:
        if isinstance(category, dict) and category.get("label"):
            by_label[category["label"]] = category
    for article in articles:
        label = article.get("category")
        if not label:
            continue
        if label not in by_label:
            by_label[label] = {
                "label": label,
                "color": article.get("categoryColor") or DEFAULT_CATEGORY_COLORS.get(label, "#FF2D20"),
            }
    return sorted(by_label.values(), key=lambda item: item["label"].lower())


def import_articles():
    state = read_json(STATE_PATH, {"articles": [], "categories": [], "deleted": []})
    existing_categories = state.get("categories") if isinstance(state.get("categories"), list) else []
    deleted = state.get("deleted") if isinstance(state.get("deleted"), list) else []

    articles = []
    article_dirs = sorted([p for p in ARTICLES_DIR.glob("*/*") if p.is_dir()])
    for article_dir in article_dirs:
        article = load_article_dir(article_dir)
        if article:
            articles.append(article)
    articles.sort(key=lambda item: (str(item.get("date") or ""), str(item.get("id") or "")), reverse=True)

    next_state = {
        "articles": articles,
        "categories": build_categories(existing_categories, articles),
        "deleted": deleted,
    }
    write_json(STATE_PATH, next_state)
    write_json(ARTICLES_JSON_PATH, articles)
    return next_state


if __name__ == "__main__":
    imported = import_articles()
    print(f"Imported {len(imported['articles'])} articles into {STATE_PATH}")

#!/usr/bin/env python3
import base64
import cgi
import json
import mimetypes
import os
import re
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse
from yox_codex_chat import CodexChatError, ask_codex_about_articles
from yox_leaks import search_leaks
from yox_article_importer import import_articles, parse_frontmatter, slugify


HOST = "127.0.0.1"
PORT = 8001
SITE_DIR = "/root/yox-news-site"
INDEX_PATH = os.path.join(SITE_DIR, "index.html")
SUPPORT_PATH = os.path.join(SITE_DIR, "support.js")
ARTICLES_PATH = os.path.join(SITE_DIR, "articles.json")
STATE_PATH = os.path.join(SITE_DIR, "site-state.json")
MEDIA_DIR = os.path.join(SITE_DIR, "media")
ARTICLES_DIR = os.path.join(SITE_DIR, "articles")

DEFAULT_STATE = {
    "articles": [],
    "categories": [],
    "deleted": [],
}


def ensure_paths():
    os.makedirs(MEDIA_DIR, exist_ok=True)
    if not os.path.exists(ARTICLES_PATH):
        write_json_file(ARTICLES_PATH, [])
    if not os.path.exists(STATE_PATH):
        articles = read_json_file(ARTICLES_PATH, [])
        write_json_file(STATE_PATH, {**DEFAULT_STATE, "articles": articles})


def read_json_file(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception:
        return fallback


def write_json_file(path, payload):
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=True, indent=2)
    os.replace(tmp, path)


def load_state():
    ensure_paths()
    state = read_json_file(STATE_PATH, DEFAULT_STATE.copy())
    if not isinstance(state, dict):
        state = DEFAULT_STATE.copy()
    merged = {
        "articles": state.get("articles") if isinstance(state.get("articles"), list) else [],
        "categories": state.get("categories") if isinstance(state.get("categories"), list) else [],
        "deleted": state.get("deleted") if isinstance(state.get("deleted"), list) else [],
    }
    return merged


def save_state(state):
    ensure_paths()
    clean = {
        "articles": state.get("articles") if isinstance(state.get("articles"), list) else [],
        "categories": state.get("categories") if isinstance(state.get("categories"), list) else [],
        "deleted": state.get("deleted") if isinstance(state.get("deleted"), list) else [],
    }
    write_json_file(STATE_PATH, clean)
    write_json_file(ARTICLES_PATH, clean["articles"])


def category_color(category):
    colors = {
        "World": "#FF2D20",
        "Business": "#0052CC",
        "Tech": "#6D28D9",
        "Climate": "#047857",
        "Opinion": "#B45309",
        "Data": "#0891B2",
        "Investigations": "#FF2D20",
    }
    return colors.get(category or "World", "#FF2D20")


def normalize_article(payload):
    headline = str(payload.get("headline") or "").strip()
    author = str(payload.get("author") or "").strip()
    if not headline or not author:
        raise ValueError("headline and author are required")

    body = str(payload.get("body") or "").strip()
    body_es = str(payload.get("bodyEs") or "").strip()
    excerpt = str(payload.get("excerpt") or "").strip()
    excerpt_es = str(payload.get("excerptEs") or "").strip()
    category = str(payload.get("category") or "World").strip() or "World"

    return {
        "id": str(payload.get("id") or f"admin-{time.time_ns()}").strip(),
        "headline": headline,
        "excerpt": excerpt or (body.split("\n\n")[0][:160] if body else None),
        "body": body or None,
        "headlineEs": str(payload.get("headlineEs") or "").strip() or None,
        "excerptEs": excerpt_es or (body_es.split("\n\n")[0][:160] if body_es else None),
        "bodyEs": body_es or None,
        "author": author,
        "category": category,
        "categoryColor": payload.get("categoryColor") or category_color(category),
        "image": str(payload.get("image") or "").strip() or None,
        "readTime": str(payload.get("readTime") or "4 min").strip() or "4 min",
        "time": str(payload.get("time") or "Just now").strip() or "Just now",
    }


def parse_json_body(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8")) if raw else None


def inject_admin_mode(html):
    marker = '<script src="./support.js"></script>'
    injected = (
        '<script>window.YOX_ADMIN_MODE=true;'
        'window.YOX_ADMIN_API_BASE="";</script>'
        '<script src="./support.js"></script>'
    )
    return html.replace(marker, injected, 1) if marker in html else html


def article_folder_context(payload):
    source_path = str(payload.get("sourcePath") or "").strip()
    if source_path.startswith("/articles/") and (source_path.endswith("/article.md") or source_path.endswith("/article.en.md") or source_path.endswith("/article.es.md")):
        article_dir = (Path(SITE_DIR) / source_path.lstrip("/")).parent
        return article_dir

    date = str(payload.get("date") or current_date_folder()).strip() or current_date_folder()
    title = str(payload.get("headline") or payload.get("title") or "untitled-article").strip() or "untitled-article"
    slug = slugify(title)
    return Path(ARTICLES_DIR) / date / slug


def save_uploaded_image(data_url, payload=None):
    if not data_url.startswith("data:") or "," not in data_url:
        raise ValueError("invalid dataUrl")
    header, encoded = data_url.split(",", 1)
    mime = header.split(";")[0][5:] or "image/jpeg"
    ext = mimetypes.guess_extension(mime) or ".jpg"
    if ext == ".jpe":
        ext = ".jpg"
    binary = base64.b64decode(encoded)
    filename = f"upload-{time.time_ns()}{ext}"
    article_dir = article_folder_context(payload or {})
    media_dir = article_dir / "media"
    media_dir.mkdir(parents=True, exist_ok=True)
    path = media_dir / filename
    with open(path, "wb") as f:
        f.write(binary)
    return "/" + path.relative_to(Path(SITE_DIR)).as_posix()


def current_date_folder():
    return time.strftime("%Y-%m-%d", time.gmtime())


def detect_lang_from_name(name):
    lower = str(name or "").lower()
    if ".es." in lower or lower.endswith(".es.md") or lower.endswith("_es.md") or lower.endswith("-es.md"):
        return "es"
    return "en"


def article_lang_path(article_dir, lang):
    return article_dir / f"article.{lang}.md"


def save_uploaded_article(markdown_name, markdown_bytes, asset_fields, lang_hint=None):
    text = markdown_bytes.decode("utf-8")
    meta, _body = parse_frontmatter(text)
    title = meta.get("title") or meta.get("headline") or Path(markdown_name).stem
    slug = slugify(title)
    date = str(meta.get("date") or current_date_folder())
    article_dir = Path(ARTICLES_DIR) / date / slug
    article_dir.mkdir(parents=True, exist_ok=True)
    lang = lang_hint or detect_lang_from_name(markdown_name)
    article_path = article_lang_path(article_dir, lang)
    article_path.write_text(text, encoding="utf-8")

    saved_assets = []
    for field in asset_fields:
        if not getattr(field, "filename", None):
            continue
        filename = os.path.basename(field.filename)
        if not filename:
            continue
        data = field.file.read()
        if not data:
            continue
        asset_path = article_dir / filename
        with open(asset_path, "wb") as f:
            f.write(data)
        saved_assets.append(filename)

    state = import_articles()
    return {
        "ok": True,
        "articlePath": "/" + article_path.relative_to(SITE_DIR).as_posix(),
        "assets": saved_assets,
        "count": len(state["articles"]),
        "state": state,
    }


def article_to_markdown(article):
    article_dir = article_folder_context(article)
    article_dir.mkdir(parents=True, exist_ok=True)
    article_path_en = article_lang_path(article_dir, "en")
    article_path_es = article_lang_path(article_dir, "es")

    def relativize(value):
        if not value:
            return value
        try:
            path = str(value)
            if not path.startswith("/articles/"):
                return path
            abs_path = Path(SITE_DIR) / path.lstrip("/")
            rel = abs_path.relative_to(article_dir)
            rel_str = rel.as_posix()
            return rel_str if rel_str.startswith(".") else f"./{rel_str}"
        except Exception:
            return value

    shared_frontmatter = [
        ("id", article.get("id")),
        ("author", article.get("author")),
        ("date", article.get("date") or current_date_folder()),
        ("category", article.get("category") or "World"),
        ("readTime", article.get("readTime") or "4 min"),
        ("published", "true"),
    ]
    if article.get("image"):
        shared_frontmatter.append(("cover", relativize(article.get("image"))))
    if article.get("tags") and isinstance(article.get("tags"), list):
        shared_frontmatter.append(("tags", article.get("tags")))

    def build_lines(title, excerpt, body):
        lines = ["---"]
        frontmatter = [("title", title or ""), ("excerpt", excerpt or "")]
        frontmatter = shared_frontmatter[:1] + frontmatter + shared_frontmatter[1:]
        for key, value in frontmatter:
            if value is None:
                continue
            if isinstance(value, list):
                lines.append(f"{key}:")
                for item in value:
                    lines.append(f"  - {item}")
            else:
                lines.append(f"{key}: {value}")
        lines.append("---")
        lines.append("")
        lines.append(body)
        return lines

    body_en = rebase_body_paths(str(article.get("body") or ""), article_dir)
    body_es = rebase_body_paths(str(article.get("bodyEs") or ""), article_dir)

    article_path_en.write_text("\n".join(build_lines(article.get("headline"), article.get("excerpt"), body_en)), encoding="utf-8")
    if article.get("headlineEs") or article.get("excerptEs") or body_es.strip():
        article_path_es.write_text("\n".join(build_lines(article.get("headlineEs") or article.get("headline"), article.get("excerptEs") or article.get("excerpt"), body_es)), encoding="utf-8")
    elif article_path_es.exists():
        article_path_es.unlink()
    return article_path_en


def delete_article_source(article):
    article_dir = article_folder_context(article)
    article_path = article_dir / "article.md"
    if article_path.exists():
        article_path.unlink()
    state = import_articles()
    return state


def rebase_body_paths(body, article_dir):
    if not body:
        return body

    def replace(match):
        prefix = match.group(1)
        target = match.group(2)
        if not target.startswith("/articles/"):
            return match.group(0)
        abs_path = Path(SITE_DIR) / target.lstrip("/")
        try:
            rel = abs_path.relative_to(article_dir)
            rel_str = rel.as_posix()
            target_out = rel_str if rel_str.startswith(".") else f"./{rel_str}"
        except Exception:
            target_out = target
        return f"{prefix}{target_out})"

    return re.sub(r"(!?\[[^\]]*\]\()([^)]+)\)", replace, body)


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body, content_type="text/html; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.wfile.write(body)

    def _send_json(self, status, payload):
        self._send(status, json.dumps(payload, ensure_ascii=True, indent=2), "application/json; charset=utf-8")

    def _serve_file(self, path, content_type=None, transform=None):
        if not os.path.exists(path):
            return self._send(404, "not found", "text/plain; charset=utf-8")
        with open(path, "rb") as f:
            body = f.read()
        if transform is not None:
            body = transform(body.decode("utf-8")).encode("utf-8")
        ctype = content_type or mimetypes.guess_type(path)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/" or path == "/index.html":
            return self._serve_file(INDEX_PATH, "text/html; charset=utf-8", inject_admin_mode)
        if path == "/support.js":
            return self._serve_file(SUPPORT_PATH, "application/javascript; charset=utf-8")
        if path == "/site-state.json":
            return self._send_json(200, load_state())
        if path == "/articles.json":
            return self._send_json(200, load_state()["articles"])
        if path == "/api/state":
            return self._send_json(200, load_state())
        if path == "/api/articles":
            return self._send_json(200, load_state()["articles"])
        if path == "/api/categories":
            return self._send_json(200, load_state()["categories"])
        if path == "/api/deleted":
            return self._send_json(200, load_state()["deleted"])
        if path == "/api/import-articles":
            return self._send_json(200, {"ok": True, "state": load_state()})
        if path == "/api/leaks/search":
            from urllib.parse import parse_qs
            query = parse_qs(parsed.query).get("q", [""])[0]
            return self._send_json(200, {"ok": True, "results": search_leaks(query)})
        if path == "/api/ai-chat":
            return self._send_json(200, {"ok": True, "message": "POST required"})
        if path == "/health":
            return self._send(200, "ok", "text/plain; charset=utf-8")
        if path.startswith("/leaks/"):
            return self._serve_file(os.path.join(SITE_DIR, path.lstrip("/")))
        if path == "/upload":
            default_lang = "es" if "lang=es" in (parsed.query or "") else "en"
            en_selected = " selected" if default_lang == "en" else ""
            es_selected = " selected" if default_lang == "es" else ""
            auto_selected = "" if default_lang in {"en", "es"} else " selected"
            return self._send(
                200,
                f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Upload Article</title><style>
body{margin:0;padding:32px;background:#111;color:#f5f5f5;font:14px/1.5 system-ui,sans-serif}
.wrap{max-width:760px;margin:0 auto}.card{background:#1a1a1a;border:1px solid #2b2b2b;padding:24px}
label{display:block;margin:16px 0 8px;color:#bbb}input,button{font:inherit}input[type=file]{display:block;width:100%;color:#ddd}
button{margin-top:20px;padding:12px 16px;border:0;background:#fff;color:#111;cursor:pointer;font-weight:600}
p,li{color:#bbb}code{color:#9ae6b4}
</style></head><body><div class="wrap"><div class="card">
<h1>Upload Markdown Article</h1>
<p>Upload <code>article.md</code> and optional asset files. The server will save them into <code>/articles/YYYY-MM-DD/slug/</code> and run the importer automatically.</p>
<form method="post" action="/upload-article-md" enctype="multipart/form-data">
<label>Markdown file</label>
<input type="file" name="articleFile" accept=".md,text/markdown" required>
<label>Language for uploaded markdown</label>
<select name="lang" style="display:block;width:100%;box-sizing:border-box;padding:10px 12px;background:#0d0d0d;color:#fff;border:1px solid #333">
  <option value="en"{en_selected}>English</option>
  <option value="es"{es_selected}>Spanish</option>
  <option value="auto"{auto_selected}>Auto-detect from filename</option>
</select>
<label>Optional assets</label>
<input type="file" name="assets" multiple>
<button type="submit">Upload And Import</button>
</form>
</div></div></body></html>""",
            )
        if path.startswith("/media/") or path.startswith("/articles/"):
            return self._serve_file(os.path.join(SITE_DIR, path.lstrip("/")))
        return self._send(404, "not found", "text/plain; charset=utf-8")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path == "/api/upload-image":
                payload = parse_json_body(self) or {}
                url = save_uploaded_image(str(payload.get("dataUrl") or ""), payload)
                return self._send_json(201, {"url": url})

            if path == "/api/articles":
                payload = parse_json_body(self) or {}
                article = normalize_article(payload)
                state = load_state()
                existing = next((i for i, a in enumerate(state["articles"]) if a.get("id") == article["id"]), None)
                if existing is None:
                    state["articles"].insert(0, article)
                else:
                    state["articles"][existing] = {**state["articles"][existing], **article}
                save_state(state)
                return self._send_json(201, article)

            if path == "/api/save-article-source":
                payload = parse_json_body(self) or {}
                article = normalize_article(payload)
                if payload.get("date"):
                    article["date"] = str(payload.get("date"))
                if payload.get("time"):
                    article["time"] = str(payload.get("time"))
                if payload.get("sourcePath"):
                    article["sourcePath"] = str(payload.get("sourcePath"))
                if isinstance(payload.get("tags"), list):
                    article["tags"] = payload.get("tags")
                article_path = article_to_markdown(article)
                state = import_articles()
                saved = next((a for a in state["articles"] if a.get("id") == article["id"]), article)
                return self._send_json(201, {
                    "ok": True,
                    "articlePath": "/" + article_path.relative_to(Path(SITE_DIR)).as_posix(),
                    "article": saved,
                    "state": state,
                    "count": len(state["articles"]),
                })

            if path == "/api/delete-article-source":
                payload = parse_json_body(self) or {}
                state = delete_article_source(payload)
                return self._send_json(200, {"ok": True, "state": state, "count": len(state["articles"])})

            if path == "/api/articles/bulk":
                payload = parse_json_body(self)
                if not isinstance(payload, list):
                    raise ValueError("expected article list")
                state = load_state()
                state["articles"] = payload
                save_state(state)
                return self._send_json(200, {"ok": True})

            if path == "/api/categories":
                payload = parse_json_body(self)
                if not isinstance(payload, list):
                    raise ValueError("expected category list")
                state = load_state()
                state["categories"] = payload
                save_state(state)
                return self._send_json(200, {"ok": True})

            if path == "/api/deleted":
                payload = parse_json_body(self)
                if not isinstance(payload, list):
                    raise ValueError("expected deleted id list")
                state = load_state()
                state["deleted"] = payload
                save_state(state)
                return self._send_json(200, {"ok": True})

            if path == "/api/import-articles":
                state = import_articles()
                return self._send_json(200, {"ok": True, "state": state, "count": len(state["articles"])})

            if path == "/api/ai-chat":
                payload = parse_json_body(self) or {}
                question = str(payload.get("question") or "").strip()
                article = payload.get("article")
                if article is not None and not isinstance(article, dict):
                    raise ValueError("article must be an object")
                result = ask_codex_about_articles(question, article)
                return self._send_json(200, {"ok": True, **result})

            if path in {"/api/upload-article-md", "/upload-article-md"}:
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={
                        "REQUEST_METHOD": "POST",
                        "CONTENT_TYPE": self.headers.get("Content-Type", ""),
                    },
                )
                article_field = form["articleFile"] if "articleFile" in form else None
                if article_field is None or not getattr(article_field, "filename", None):
                    raise ValueError("articleFile is required")
                asset_fields = form["assets"] if "assets" in form else []
                if not isinstance(asset_fields, list):
                    asset_fields = [asset_fields]
                lang_field = form["lang"].value if "lang" in form and getattr(form["lang"], "value", None) else "auto"
                lang_hint = None if lang_field == "auto" else lang_field
                result = save_uploaded_article(article_field.filename, article_field.file.read(), asset_fields, lang_hint)
                if path == "/upload-article-md":
                    self.send_response(303)
                    self.send_header("Location", "/upload")
                    self.end_headers()
                    return
                return self._send_json(201, result)
        except ValueError as exc:
            return self._send_json(400, {"error": str(exc)})
        except CodexChatError as exc:
            return self._send_json(400, {"error": str(exc)})
        except Exception as exc:
            return self._send_json(500, {"error": str(exc)})

        return self._send(404, "not found", "text/plain; charset=utf-8")


if __name__ == "__main__":
    ensure_paths()
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Serving admin on http://{HOST}:{PORT}")
    server.serve_forever()

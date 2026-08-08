#!/usr/bin/env python3
import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

from yox_codex_chat import CodexChatError, ask_codex_about_articles
from yox_leaks import search_leaks


HOST = "0.0.0.0"
PORT = 8000
SITE_DIR = "/root/yox-news-site"
INDEX_PATH = os.path.join(SITE_DIR, "index.html")
SUPPORT_PATH = os.path.join(SITE_DIR, "support.js")
STATE_PATH = os.path.join(SITE_DIR, "site-state.json")
ARTICLES_PATH = os.path.join(SITE_DIR, "articles.json")


def read_json_file(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback


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
        self._send(status, json.dumps(payload, ensure_ascii=False, indent=2), "application/json; charset=utf-8")

    def _serve_file(self, path, content_type=None):
        if not os.path.exists(path):
            return self._send(404, "not found", "text/plain; charset=utf-8")
        with open(path, "rb") as f:
            body = f.read()
        ctype = content_type or mimetypes.guess_type(path)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _parse_json_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8")) if raw else {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/" or path == "/index.html":
            return self._serve_file(INDEX_PATH, "text/html; charset=utf-8")
        if path == "/support.js":
            return self._serve_file(SUPPORT_PATH, "application/javascript; charset=utf-8")
        if path == "/site-state.json":
            return self._send_json(200, read_json_file(STATE_PATH, {}))
        if path == "/articles.json":
            return self._send_json(200, read_json_file(ARTICLES_PATH, []))
        if path == "/api/leaks/search":
            query = parse_qs(parsed.query).get("q", [""])[0]
            return self._send_json(200, {"ok": True, "results": search_leaks(query)})
        if path == "/health":
            return self._send(200, "ok", "text/plain; charset=utf-8")
        if path.startswith("/media/") or path.startswith("/articles/") or path.startswith("/leaks/"):
            return self._serve_file(os.path.join(SITE_DIR, path.lstrip("/")))
        return self._send(404, "not found", "text/plain; charset=utf-8")

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/ai-chat":
            return self._send(404, "not found", "text/plain; charset=utf-8")
        try:
            payload = self._parse_json_body()
            question = str(payload.get("question") or "").strip()
            article = payload.get("article")
            if article is not None and not isinstance(article, dict):
                raise CodexChatError("Article payload must be an object")
            result = ask_codex_about_articles(question, article)
            return self._send_json(200, {"ok": True, **result})
        except CodexChatError as exc:
            return self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            return self._send_json(500, {"ok": False, "error": str(exc)})


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Serving public site on http://{HOST}:{PORT}")
    server.serve_forever()

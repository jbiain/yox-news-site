#!/usr/bin/env python3
import json
import select
import shutil
import subprocess
import time
from pathlib import Path
import csv


SITE_ROOT = Path("/root/yox-news-site")
ARTICLES_ROOT = SITE_ROOT / "articles"
LEAKS_ROOT = SITE_ROOT / "leaks"
IGNORED_LEAK_DIRS = {"offshore_leaks_mixed", "__pycache__"}
CODEX_BIN = shutil.which("codex") or "/root/.codex/packages/standalone/current/codex"
CODEX_CMD = [CODEX_BIN, "app-server", "--listen", "stdio://"]
INIT_TIMEOUT_SECONDS = 10
THREAD_TIMEOUT_SECONDS = 15
TURN_START_TIMEOUT_SECONDS = 15
TURN_COMPLETE_TIMEOUT_SECONDS = 90
MAX_FILE_BYTES = 24000
MAX_ROOT_FILES = 24
MAX_LEAK_SAMPLE_ROWS = 2


class CodexChatError(RuntimeError):
    pass


def _send(proc, payload):
    proc.stdin.write(json.dumps(payload) + "\n")
    proc.stdin.flush()


def _recv_lines(proc, timeout):
    ready, _, _ = select.select([proc.stdout, proc.stderr], [], [], timeout)
    lines = []
    for stream in ready:
        line = stream.readline()
        if line:
            lines.append((stream is proc.stdout, line.rstrip("\n")))
    return lines


def _wait_for_response(proc, request_id, timeout_seconds):
    end = time.time() + timeout_seconds
    while time.time() < end:
        for is_stdout, line in _recv_lines(proc, 0.5):
            if not is_stdout:
                continue
            message = json.loads(line)
            if message.get("id") == request_id:
                if "error" in message:
                    raise CodexChatError(message["error"].get("message") or "Codex request failed")
                return message["result"]
    raise CodexChatError(f"Timed out waiting for Codex response {request_id}")


def _collect_turn(proc, timeout_seconds):
    end = time.time() + timeout_seconds
    final_messages = []
    command_logs = []
    while time.time() < end:
        for is_stdout, line in _recv_lines(proc, 0.5):
            if not is_stdout:
                continue
            message = json.loads(line)
            method = message.get("method")
            params = message.get("params") or {}
            if method == "item/completed":
                item = params.get("item") or {}
                if item.get("type") == "agentMessage" and item.get("phase") == "final_answer":
                    final_messages.append(item.get("text", ""))
                elif item.get("type") == "commandExecution":
                    command_logs.append(
                        {
                            "command": item.get("command"),
                            "cwd": item.get("cwd"),
                            "exitCode": item.get("exitCode"),
                        }
                    )
            elif method == "turn/completed":
                text = "\n\n".join(part for part in final_messages if part.strip()).strip()
                if not text:
                    raise CodexChatError("Codex completed without a final answer")
                return {"text": text, "commandLogs": command_logs}
    raise CodexChatError("Timed out waiting for Codex turn completion")


def _normalize_article_path(article):
    if not article:
        return None
    source_path = str(article.get("sourcePath") or "").strip()
    if not source_path.startswith("/articles/"):
        return None
    path = (Path("/root/yox-news-site") / source_path.lstrip("/")).resolve()
    try:
        path.relative_to(SITE_ROOT)
    except ValueError as exc:
        raise CodexChatError("Article path is outside the allowed site root") from exc
    return path


def _read_text_file(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    if len(text) > MAX_FILE_BYTES:
        return text[:MAX_FILE_BYTES] + "\n\n[truncated]"
    return text


def _build_embedded_corpus(focus_path):
    if focus_path:
        relative = focus_path.relative_to(SITE_ROOT).as_posix()
        return f"File: {relative}\n\n{_read_text_file(focus_path)}"

    markdown_files = sorted(ARTICLES_ROOT.rglob("*.md"))[:MAX_ROOT_FILES]
    chunks = []
    for path in markdown_files:
        relative = path.relative_to(ARTICLES_ROOT).as_posix()
        chunks.append(f"File: {relative}\n\n{_read_text_file(path)}")
    return "\n\n====\n\n".join(chunks)


def _build_leaks_manifest():
    if not LEAKS_ROOT.exists():
        return "No leaks directory is present."

    sections = []
    for leak_dir in sorted(path for path in LEAKS_ROOT.iterdir() if path.is_dir() and path.name not in IGNORED_LEAK_DIRS):
        lines = [f"Leak folder: {leak_dir.relative_to(SITE_ROOT).as_posix()}"]
        for file_path in sorted(path for path in leak_dir.rglob("*") if path.is_file()):
            size = file_path.stat().st_size
            lines.append(f"- File: {file_path.relative_to(SITE_ROOT).as_posix()} ({size} bytes)")
            if file_path.suffix.lower() == ".csv":
                try:
                    with file_path.open("r", encoding="utf-8", errors="replace", newline="") as f:
                        reader = csv.reader(f)
                        header = next(reader, [])
                        lines.append(f"  Header: {header[:12]}")
                        for idx, row in zip(range(MAX_LEAK_SAMPLE_ROWS), reader):
                            lines.append(f"  Sample row {idx + 1}: {row[:12]}")
                except Exception as exc:
                    lines.append(f"  Failed to sample CSV: {exc}")
            elif size:
                try:
                    preview = file_path.read_text(encoding='utf-8', errors='replace')[:400].strip()
                    if preview:
                        lines.append(f"  Preview: {preview}")
                except Exception as exc:
                    lines.append(f"  Failed to preview file: {exc}")
        sections.append("\n".join(lines))
    return "\n\n".join(sections) if sections else "No leak folders are present."


def ask_codex_about_articles(question, article=None):
    question = str(question or "").strip()
    if not question:
        raise CodexChatError("Question is required")

    focus_path = _normalize_article_path(article)
    article_title = str((article or {}).get("headline") or "").strip()
    leaks_manifest = _build_leaks_manifest()

    if focus_path:
        relative_focus = focus_path.relative_to(SITE_ROOT).as_posix()
        embedded_corpus = _build_embedded_corpus(focus_path)
        prompt = (
            "Answer the user's question using only the local site corpus below. "
            f"Primary focus file: {relative_focus}. "
            "Prefer that file for the answer. Only mention other local files if the user explicitly asks for comparison or broader site context. "
            "You may consult local leak files under leaks/ when relevant. "
            "Do not run shell commands or inspect additional files unless the embedded corpus and leak manifest are clearly insufficient. "
            "If the answer is not supported by the local files, say so plainly.\n\n"
            f"Article title: {article_title or relative_focus}\n"
            f"User question: {question}\n\n"
            "Embedded local article corpus:\n\n"
            f"{embedded_corpus}\n\n"
            "Embedded local leaks manifest:\n\n"
            f"{leaks_manifest}"
        )
        sources = [{"title": article_title or relative_focus, "path": f"/{relative_focus}"}]
    else:
        embedded_corpus = _build_embedded_corpus(None)
        prompt = (
            "Answer the user's question using only the local site corpus below. "
            "You may use both articles/ and leaks/. "
            "Do not use network, MCP, web search, shell commands, or any files outside the current working directory unless the embedded corpus is clearly insufficient. "
            "If the answer is not supported by the local files, say so plainly.\n\n"
            f"User question: {question}\n\n"
            "Embedded local article corpus:\n\n"
            f"{embedded_corpus}\n\n"
            "Embedded local leaks manifest:\n\n"
            f"{leaks_manifest}"
        )
        sources = []

    proc = subprocess.Popen(
        CODEX_CMD,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    try:
        _send(
            proc,
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {"clientInfo": {"name": "yox-bridge", "version": "0.1"}, "capabilities": None},
            },
        )
        _wait_for_response(proc, 1, INIT_TIMEOUT_SECONDS)

        _send(
            proc,
            {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "thread/start",
                "params": {
                    "cwd": str(SITE_ROOT),
                    "approvalPolicy": "never",
                    "sandbox": "read-only",
                    "ephemeral": True,
                    "baseInstructions": (
                        "You are a site-local article and leak assistant. Read only local files in the current working directory. "
                        "Use only articles/ and leaks/. Never write files, never use network, never read outside the current working directory, and avoid shell commands when the prompt already includes the needed corpus."
                    ),
                    "developerInstructions": (
                        "Use shell/file inspection only inside the current working directory when absolutely needed. "
                        "If you inspect files, limit yourself to articles/ and leaks/. "
                        "Do not modify files. Do not request permissions. Do not use MCP or web search."
                    ),
                },
            },
        )
        thread_result = _wait_for_response(proc, 2, THREAD_TIMEOUT_SECONDS)
        thread_id = thread_result["thread"]["id"]

        _send(
            proc,
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "turn/start",
                "params": {
                    "threadId": thread_id,
                    "input": [{"type": "text", "text": prompt, "text_elements": []}],
                    "cwd": str(SITE_ROOT),
                    "approvalPolicy": "never",
                    "sandboxPolicy": {"type": "readOnly", "networkAccess": False},
                },
            },
        )
        _wait_for_response(proc, 3, TURN_START_TIMEOUT_SECONDS)
        result = _collect_turn(proc, TURN_COMPLETE_TIMEOUT_SECONDS)
        result["sources"] = sources
        return result
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()

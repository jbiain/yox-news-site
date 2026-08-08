#!/usr/bin/env python3
import csv
import json
import os
import shutil
from pathlib import Path


SITE_ROOT = Path("/root/yox-news-site")
LEAKS_ROOT = SITE_ROOT / "leaks"
MIXED_DIR = LEAKS_ROOT / "offshore_leaks_mixed"
SOURCE_DIR = LEAKS_ROOT / "panama_papers"
SKIP_DIRS = {"offshore_leaks_mixed", "__pycache__"}

LEAK_BUCKETS = {
    "panama_papers": {
        "title": "Panama Papers",
        "classification": "PUBLIC LEAK",
        "matcher": lambda source_id: source_id == "Panama Papers",
        "description": "Offshore entity, officer, intermediary, address, and relationship records sourced from the Panama Papers rows inside the mixed graph archive.",
    },
    "bahamas_leaks": {
        "title": "Bahamas Leaks",
        "classification": "PUBLIC LEAK",
        "matcher": lambda source_id: source_id == "Bahamas Leaks",
        "description": "Bahamas Leaks rows separated from the mixed offshore graph archive.",
    },
    "paradise_papers": {
        "title": "Paradise Papers",
        "classification": "PUBLIC LEAK",
        "matcher": lambda source_id: source_id.startswith("Paradise Papers"),
        "description": "Paradise Papers rows separated from the mixed offshore graph archive.",
    },
}


def _bucket_for_source(source_id):
    for slug, meta in LEAK_BUCKETS.items():
        if meta["matcher"](source_id):
            return slug
    return None


def _ensure_backup_layout():
    if MIXED_DIR.exists():
        return MIXED_DIR
    if SOURCE_DIR.exists():
        SOURCE_DIR.rename(MIXED_DIR)
        return MIXED_DIR
    raise FileNotFoundError("No source leak directory found to split")


def _write_manifest(target_dir, title, description, file_summaries):
    lines = [
        f"# {title}",
        "",
        description,
        "",
        "## Files",
        "",
    ]
    for summary in file_summaries:
        lines.append(f"- `{summary['name']}`")
        lines.append(f"  - rows: {summary['rows']}")
        if summary.get("source_samples"):
            lines.append(f"  - samples: {', '.join(summary['source_samples'])}")
    lines.append("")
    (target_dir / "README.md").write_text("\n".join(lines), encoding="utf-8")


def split_mixed_leaks():
    source_dir = _ensure_backup_layout()
    results = {}

    for slug, meta in LEAK_BUCKETS.items():
        target = LEAKS_ROOT / slug
        if target.exists():
            shutil.rmtree(target)
        target.mkdir(parents=True, exist_ok=True)
        results[slug] = {"path": target, "files": []}

    for source_file in sorted(source_dir.iterdir()):
        if not source_file.is_file():
            continue
        if source_file.suffix.lower() != ".csv":
            for slug in LEAK_BUCKETS:
                target_file = LEAKS_ROOT / slug / source_file.name
                shutil.copy2(source_file, target_file)
                results[slug]["files"].append({"name": source_file.name, "rows": 0, "source_samples": []})
            continue

        with source_file.open("r", encoding="utf-8", errors="replace", newline="") as src:
            reader = csv.DictReader(src)
            fieldnames = reader.fieldnames or []
            has_source = "sourceID" in fieldnames

            writers = {}
            handles = {}
            counters = {}
            samples = {}

            for slug in LEAK_BUCKETS:
                target_file = LEAKS_ROOT / slug / source_file.name
                handle = target_file.open("w", encoding="utf-8", newline="")
                writer = csv.DictWriter(handle, fieldnames=fieldnames)
                writer.writeheader()
                handles[slug] = handle
                writers[slug] = writer
                counters[slug] = 0
                samples[slug] = []

            try:
                for row in reader:
                    if has_source:
                        source_id = (row.get("sourceID") or "").strip()
                        slug = _bucket_for_source(source_id)
                        if not slug:
                            continue
                        writers[slug].writerow(row)
                        counters[slug] += 1
                        if source_id and source_id not in samples[slug] and len(samples[slug]) < 3:
                            samples[slug].append(source_id)
                    else:
                        # Files without sourceID are duplicated into each separated folder.
                        for slug in LEAK_BUCKETS:
                            writers[slug].writerow(row)
                            counters[slug] += 1
                for slug in LEAK_BUCKETS:
                    results[slug]["files"].append(
                        {"name": source_file.name, "rows": counters[slug], "source_samples": samples[slug]}
                    )
            finally:
                for handle in handles.values():
                    handle.close()

    for slug, meta in LEAK_BUCKETS.items():
        _write_manifest(results[slug]["path"], meta["title"], meta["description"], results[slug]["files"])

    return {
        slug: {
            "title": LEAK_BUCKETS[slug]["title"],
            "path": str(results[slug]["path"]),
            "files": results[slug]["files"],
        }
        for slug in LEAK_BUCKETS
    }


def _load_manifest(folder):
    readme = folder / "README.md"
    if readme.exists():
        return readme.read_text(encoding="utf-8", errors="replace")
    return ""


def build_leak_index():
    entries = []
    if not LEAKS_ROOT.exists():
        return entries

    for folder in sorted(path for path in LEAKS_ROOT.iterdir() if path.is_dir() and path.name not in SKIP_DIRS):
        manifest = _load_manifest(folder)
        file_paths = sorted(path for path in folder.rglob("*") if path.is_file())
        rel_names = [path.relative_to(folder).as_posix() for path in file_paths]
        dataset_files = [name for name in rel_names if name.endswith(".csv")]
        bucket_meta = LEAK_BUCKETS.get(folder.name, {})
        bucket_title = bucket_meta.get("title") or folder.name.replace("_", " ").title()
        bucket_class = bucket_meta.get("classification") or "LEAK ARCHIVE"
        entry = {
            "id": folder.name.upper().replace("-", "_"),
            "title": bucket_title,
            "classification": bucket_class,
            "date": "Local archive",
            "pages": f"{len(dataset_files)} dataset files",
            "desc": manifest.splitlines()[2] if manifest.splitlines()[:3] else f"Leak archive in {folder.name}",
            "href": f"/leaks/{folder.name}/README.md" if (folder / "README.md").exists() else "#",
            "path": f"/leaks/{folder.name}",
            "searchText": " ".join([folder.name, bucket_title, manifest, *rel_names]).lower(),
            "classBorder": "1px solid rgba(255,45,32,0.4)",
            "classBg": "rgba(255,45,32,0.15)",
            "classColor": "#FF2D20",
        }
        entries.append(entry)
        for file_path in file_paths:
            rel_path = file_path.relative_to(folder).as_posix()
            if rel_path == "README.md":
                continue
            entries.append(
                {
                    "id": f"{folder.name}:{rel_path}",
                    "title": rel_path,
                    "classification": "DATA FILE",
                    "date": "Local archive",
                    "pages": f"{file_path.stat().st_size:,} bytes",
                    "desc": f"File in {bucket_title}",
                    "href": f"/leaks/{folder.name}/{rel_path}",
                    "path": f"/leaks/{folder.name}/{rel_path}",
                    "searchText": f"{folder.name} {bucket_title} {rel_path} {manifest}".lower(),
                    "classBorder": "1px solid rgba(0,82,204,0.4)",
                    "classBg": "rgba(0,82,204,0.15)",
                    "classColor": "#0052CC",
                }
            )
    return entries


def search_leaks(query="", limit=24):
    query = (query or "").strip().lower()
    entries = build_leak_index()
    if not query:
        return entries[:limit]
    terms = query.split()

    def score(entry):
        text = entry["searchText"]
        hits = sum(1 for term in terms if term in text)
        title_bonus = sum(2 for term in terms if term in entry["title"].lower())
        return hits + title_bonus

    ranked = [entry for entry in entries if all(term in entry["searchText"] for term in terms)]
    ranked.sort(key=score, reverse=True)
    return ranked[:limit]


if __name__ == "__main__":
    print(json.dumps(split_mixed_leaks(), indent=2))

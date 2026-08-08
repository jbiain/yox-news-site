#!/usr/bin/env python3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from yox_article_importer import import_articles


if __name__ == "__main__":
    state = import_articles()
    print(f"Imported {len(state['articles'])} articles.")

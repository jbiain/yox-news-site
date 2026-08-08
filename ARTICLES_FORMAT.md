# Article Format

Store each article in:

```text
/root/yox-news-site/articles/YYYY-MM-DD/article-slug/
  article.en.md
  article.es.md
  cover.jpg
  body-image-01.jpg
```

The importer reads `article.en.md` and `article.es.md` in each folder and rebuilds `site-state.json`.

## Minimal Example

```md
---
id: milei-was-not-simply-elected
title: Milei Was Not Simply Elected
author: Editor in Chief
date: 2026-07-02
category: World
readTime: 12 min
excerpt: The transnational network that turned Argentina's crisis into a laboratory...
cover: ./cover.jpg
published: true
tags:
  - geopolitics
  - argentina
headlineEs:
excerptEs:
---

<!-- body:en -->

## English File Example

```md
---
id: milei-was-not-simply-elected
title: Milei Was Not Simply Elected
author: Editor in Chief
date: 2026-07-02
category: World
readTime: 12 min
excerpt: The transnational network that turned Argentina's crisis into a laboratory...
cover: ./cover.jpg
published: true
tags:
  - geopolitics
  - argentina
---

Javier Milei did not arrive at the end of the world by accident.

## What this article is

Body text here.

![Caption](./body-image-01.jpg)
```

## Spanish File Example

```md
---
id: milei-was-not-simply-elected
title: Milei no fue simplemente elegido
author: Editor in Chief
date: 2026-07-02
category: World
readTime: 12 min
excerpt: La red transnacional que convirtio la crisis argentina en un laboratorio...
cover: ./cover.jpg
published: true
tags:
  - geopolitica
  - argentina
---

Javier Milei no llego al fin del mundo por accidente.

## Que significa este articulo

Texto en espanol aqui.

![Leyenda](./body-image-01.jpg)
```

## Supported Fields

- `id`: optional, defaults to the article folder name
- `title`: required in practice
- `author`: required in practice
- `date`: used for sorting
- `category`: `World`, `Business`, `Tech`, etc.
- `readTime`: display string like `4 min`
- `excerpt`: optional, auto-generated from first paragraph if omitted
- `cover`: optional relative asset path
- `published`: set `false` to skip import
- `tags`: optional list
- `time`: optional display override; defaults to `date`

## Body Rules

- Use normal markdown-like paragraphs and headings.
- Separate paragraphs with blank lines.
- Use `---` on its own line for explicit page breaks.
- Use relative image paths like `![Caption](./body-image-01.jpg)`.
- Relative links and images are rewritten to public `/articles/...` URLs during import.

## Language Rules

- `article.en.md` is the English source
- `article.es.md` is the Spanish source
- uploads are renamed automatically to those filenames
- shared fields should stay aligned across both files:
  - `id`
  - `author`
  - `date`
  - `category`
  - `readTime`
  - `cover`
  - `published`

## Import Command

```bash
python3 /root/yox-news-site/import_articles.py
```

That rebuilds:

- `/root/yox-news-site/site-state.json`
- `/root/yox-news-site/articles.json`

After running the importer, refresh:

- Public site: `http://68.183.37.40:8000/`
- Internal editor: `http://127.0.0.1:8001/`

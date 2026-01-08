# TREF Blog Publishing Guide

A complete guide for publishing multi-language articles with version tracking using TREF blocks.

---

## Understanding TREF IDs

### SHA-256 is for Integrity, Not Identification

The `id` field in a TREF block is a SHA-256 hash of the content:

```
Content: "Hello world"
    ↓
SHA-256: a1b2c3d4e5f6...
    ↓
ID: "sha256:a1b2c3d4e5f6..."
```

**Purpose**: Verify that content hasn't been tampered with.

**NOT for**: Identifying which article this is.

### Why This Matters

Every change to content = new hash = new ID:

```
v1: "Hello world"     → sha256:aaa111...
v2: "Hello world!"    → sha256:bbb222...  (different!)
v3: "Hello World!"    → sha256:ccc333...  (different!)
```

This is intentional. Each version is a unique, verifiable snapshot.

### Verification Process

Anyone can verify a block hasn't been modified:

```python
import hashlib

def verify(block):
    content_hash = hashlib.sha256(block['content'].encode('utf-8')).hexdigest()
    expected_id = f"sha256:{content_hash}"
    return block['id'] == expected_id

verify(block)  # True = untampered, False = modified
```

---

## Multi-Language Articles

### The Problem

You have one article in 6 languages. Each language version has different content, so each gets a unique SHA-256 ID:

```
Danish:  "Hej verden"   → sha256:aaa...
English: "Hello world"  → sha256:bbb...
German:  "Hallo Welt"   → sha256:ccc...
```

**Challenge**: How do you know these are the same article?

### The Solution: articleId + parent

Use two fields together:

| Field | Purpose |
|-------|---------|
| `meta.articleId` | Your article identifier (e.g., "blog-42") |
| `meta.lang` | Language code (e.g., "da", "en", "de") |
| `parent` | Points to original language version |

```json
{
  "id": "sha256:bbb...",
  "content": "Hello world...",
  "meta": {
    "articleId": "blog-42",
    "lang": "en"
  },
  "parent": "sha256:aaa..."
}
```

---

## Hosting Strategies

Choose the strategy that matches your hosting setup:

| Strategy | Server | Database | Client JS | Best For |
|----------|--------|----------|-----------|----------|
| A: Dynamic | Yes | Yes | Optional | CMS, apps |
| B: Static Baked | No | No | No | Simple blogs |
| C: Static + Index | No | No | Yes | Multi-lang sites |
| D: Hybrid | Build-time | Build-time | Minimal | JAMstack |

---

## Strategy A: Dynamic Site with Database

For sites with a backend server and database.

### Architecture

```
┌─────────────────┐
│  Your Server    │
│  (Python/Node)  │
│       │         │
│   Database      │
│       │         │
│   Publisher     │
└───────┬─────────┘
        │
        ▼
    Browser
  (dynamic pages)
```

### Database Schema

```sql
CREATE TABLE articles (
  id          INTEGER PRIMARY KEY,
  article_id  TEXT NOT NULL,      -- Your identifier: "blog-42"
  tref_id     TEXT NOT NULL,      -- SHA-256: "sha256:abc..."
  lang        TEXT NOT NULL,      -- Language: "da", "en", "de"
  version     INTEGER NOT NULL,   -- Version number: 1, 2, 3...
  parent      TEXT,               -- Parent tref_id (null for original)
  created     DATETIME NOT NULL,

  UNIQUE(article_id, lang, version)
);

CREATE INDEX idx_article_lang ON articles(article_id, lang);
```

### Queries

**Get latest version in all languages:**
```sql
SELECT a.*
FROM articles a
INNER JOIN (
  SELECT article_id, lang, MAX(version) as max_version
  FROM articles
  WHERE article_id = 'blog-42'
  GROUP BY article_id, lang
) latest ON a.article_id = latest.article_id
        AND a.lang = latest.lang
        AND a.version = latest.max_version;
```

**Get version history:**
```sql
SELECT * FROM articles
WHERE article_id = 'blog-42' AND lang = 'da'
ORDER BY version DESC;
```

### Python Publisher

```python
import hashlib
import json
import sqlite3
from datetime import datetime, timezone

def create_tref_block(content, article_id, lang, parent=None, refs=None):
    content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()

    return {
        "v": 1,
        "id": f"sha256:{content_hash}",
        "content": content,
        "meta": {
            "created": datetime.now(timezone.utc).isoformat(),
            "license": "TREF-1.0",
            "articleId": article_id,
            "lang": lang
        },
        "refs": refs or [],
        "parent": parent
    }

def publish_article(db, content, article_id, lang, parent=None):
    # Get next version number
    cursor = db.execute(
        "SELECT MAX(version) FROM articles WHERE article_id=? AND lang=?",
        (article_id, lang)
    )
    max_ver = cursor.fetchone()[0] or 0
    version = max_ver + 1

    block = create_tref_block(content, article_id, lang, parent)

    db.execute(
        "INSERT INTO articles (article_id, tref_id, lang, version, parent, created) VALUES (?,?,?,?,?,?)",
        (article_id, block['id'], lang, version, parent, datetime.now())
    )
    db.commit()

    return block
```

---

## Strategy B: Static Site with Baked-In HTML

For pure static sites with no JavaScript. Everything is pre-generated.

### Architecture

```
┌─────────────────┐
│ Python Publisher│
│   (your server) │
└───────┬─────────┘
        │ generates
        ▼
┌─────────────────┐
│  Static Files   │
│  blog-42-da.html│
│  blog-42-en.html│
│  blog-42-de.html│
└───────┬─────────┘
        │ upload
        ▼
┌─────────────────┐
│  Static Host    │
│ (statichost.eu) │
└───────┬─────────┘
        │ serves
        ▼
    Browser
  (pure HTML)
```

### Generated HTML

Publisher generates complete HTML with hardcoded language links:

```html
<!-- blog-42-da.html -->
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <title>Min Artikel</title>
</head>
<body>
  <nav class="languages">
    <a href="blog-42-da.html" class="active">DA</a>
    <a href="blog-42-en.html">EN</a>
    <a href="blog-42-de.html">DE</a>
  </nav>

  <article>
    <h1>Min Artikel</h1>
    <p>Indholdet på dansk...</p>
  </article>

  <!-- TREF block embedded for verification/copy -->
  <script type="application/json" id="tref-block">
  {
    "id": "sha256:aaa123...",
    "content": "# Min Artikel\n\nIndholdet på dansk...",
    "meta": { "articleId": "blog-42", "lang": "da" }
  }
  </script>
</body>
</html>
```

### Python Publisher

```python
import hashlib
import json
from pathlib import Path
import markdown

def create_tref_block(content, article_id, lang, parent=None):
    content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
    return {
        "v": 1,
        "id": f"sha256:{content_hash}",
        "content": content,
        "meta": {
            "articleId": article_id,
            "lang": lang
        },
        "parent": parent
    }

def generate_html(block, all_languages):
    """Generate complete HTML page with baked-in content."""

    article_id = block['meta']['articleId']
    current_lang = block['meta']['lang']

    # Build language links
    lang_links = []
    for lang in all_languages:
        active = 'class="active"' if lang == current_lang else ''
        lang_links.append(f'<a href="{article_id}-{lang}.html" {active}>{lang.upper()}</a>')

    html_content = markdown.markdown(block['content'])

    return f'''<!DOCTYPE html>
<html lang="{current_lang}">
<head>
  <meta charset="utf-8">
  <title>{article_id}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="languages">
    {' '.join(lang_links)}
  </nav>

  <article>
    {html_content}
  </article>

  <script type="application/json" id="tref-block">
{json.dumps(block, indent=2, ensure_ascii=False)}
  </script>
</body>
</html>'''

def build_site(articles, output_dir):
    """Build all HTML pages."""

    output = Path(output_dir)
    output.mkdir(exist_ok=True)

    for article_id, languages in articles.items():
        all_langs = list(languages.keys())

        for lang, content in languages.items():
            # Find parent (original language)
            parent = None
            if lang != all_langs[0]:
                original = languages[all_langs[0]]
                parent_hash = hashlib.sha256(original.encode('utf-8')).hexdigest()
                parent = f"sha256:{parent_hash}"

            block = create_tref_block(content, article_id, lang, parent)
            html = generate_html(block, all_langs)

            filename = output / f"{article_id}-{lang}.html"
            filename.write_text(html, encoding='utf-8')
            print(f"Generated: {filename}")

# Usage
articles = {
    "blog-42": {
        "da": "# Min Artikel\n\nIndholdet på dansk...",
        "en": "# My Article\n\nContent in English...",
        "de": "# Mein Artikel\n\nInhalt auf Deutsch..."
    }
}

build_site(articles, "./public")
```

### Pros & Cons

**Pros:**
- No JavaScript required
- Works everywhere
- Simple and fast

**Cons:**
- Language links hardcoded at build time
- Must rebuild all pages when adding a language
- No version dropdown without JS

---

## Strategy C: Static Site with Shared Index

For static sites that use client-side JavaScript for navigation.

### Architecture

```
┌─────────────────┐
│ Python Publisher│
└───────┬─────────┘
        │ generates
        ▼
┌─────────────────┐
│  Static Files   │
│  tref-index.json│  ← shared index
│  blog-42-da.html│
│  blog-42-en.html│
└───────┬─────────┘
        │ upload
        ▼
┌─────────────────┐
│  Static Host    │
└───────┬─────────┘
        │
        ▼
    Browser
  (fetches index)
```

### The Index File

Publisher generates a single `tref-index.json`:

```json
{
  "blog-42": {
    "languages": {
      "da": {
        "url": "blog-42-da.html",
        "trefId": "sha256:aaa...",
        "updated": "2026-01-08",
        "title": "Min Artikel"
      },
      "en": {
        "url": "blog-42-en.html",
        "trefId": "sha256:bbb...",
        "updated": "2026-01-08",
        "title": "My Article"
      },
      "de": {
        "url": "blog-42-de.html",
        "trefId": "sha256:ccc...",
        "updated": "2026-01-07",
        "title": "Mein Artikel"
      }
    },
    "versions": {
      "da": [
        { "version": 2, "trefId": "sha256:ddd...", "date": "2026-01-08" },
        { "version": 1, "trefId": "sha256:aaa...", "date": "2026-01-05" }
      ]
    }
  },
  "blog-43": { ... }
}
```

### HTML with Dropdown

Each page includes a dropdown that loads from the index:

```html
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <title>Min Artikel</title>
</head>
<body>
  <nav>
    <select id="lang-switcher" data-article="blog-42" data-lang="da">
      <option>Henter...</option>
    </select>

    <select id="version-switcher" data-article="blog-42" data-lang="da">
      <option>v2 (current)</option>
    </select>
  </nav>

  <article>
    <h1>Min Artikel</h1>
    <p>Indholdet på dansk...</p>
  </article>

  <script src="tref-nav.js"></script>
</body>
</html>
```

### Client JavaScript (tref-nav.js)

```javascript
// tref-nav.js - Language and version navigation

(function() {
  const langSelect = document.getElementById('lang-switcher');
  const versionSelect = document.getElementById('version-switcher');

  if (!langSelect) return;

  const articleId = langSelect.dataset.article;
  const currentLang = langSelect.dataset.lang;

  // Fetch the shared index
  fetch('/tref-index.json')
    .then(r => r.json())
    .then(index => {
      const article = index[articleId];
      if (!article) return;

      // Populate language dropdown
      const langs = article.languages;
      langSelect.innerHTML = Object.entries(langs)
        .map(([lang, data]) => {
          const selected = lang === currentLang ? 'selected' : '';
          return `<option value="${data.url}" ${selected}>${lang.upper()} - ${data.title}</option>`;
        })
        .join('');

      // Populate version dropdown (if exists)
      if (versionSelect && article.versions && article.versions[currentLang]) {
        const versions = article.versions[currentLang];
        versionSelect.innerHTML = versions
          .map((v, i) => {
            const current = i === 0 ? ' (current)' : '';
            return `<option value="${v.trefId}">v${v.version}${current} - ${v.date}</option>`;
          })
          .join('');
      }
    });

  // Handle language change
  langSelect.onchange = () => {
    window.location = langSelect.value;
  };

  // Handle version change (optional: could load archived version)
  if (versionSelect) {
    versionSelect.onchange = () => {
      const trefId = versionSelect.value;
      // Option 1: Navigate to archived version URL
      // Option 2: Show modal with old content
      console.log('Selected version:', trefId);
    };
  }
})();
```

### Python Publisher

```python
import hashlib
import json
from pathlib import Path
from datetime import datetime

class TrefPublisher:
    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.index = {}

    def create_block(self, content, article_id, lang, parent=None):
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        return {
            "v": 1,
            "id": f"sha256:{content_hash}",
            "content": content,
            "meta": {
                "articleId": article_id,
                "lang": lang,
                "created": datetime.now().isoformat()
            },
            "parent": parent
        }

    def publish(self, content, article_id, lang, title, parent=None):
        """Publish an article and update the index."""

        block = self.create_block(content, article_id, lang, parent)

        # Initialize article in index
        if article_id not in self.index:
            self.index[article_id] = {
                "languages": {},
                "versions": {}
            }

        # Update language entry
        self.index[article_id]["languages"][lang] = {
            "url": f"{article_id}-{lang}.html",
            "trefId": block["id"],
            "updated": datetime.now().strftime("%Y-%m-%d"),
            "title": title
        }

        # Track version history
        if lang not in self.index[article_id]["versions"]:
            self.index[article_id]["versions"][lang] = []

        # Add to version history
        versions = self.index[article_id]["versions"][lang]
        version_num = len(versions) + 1
        versions.insert(0, {
            "version": version_num,
            "trefId": block["id"],
            "date": datetime.now().strftime("%Y-%m-%d")
        })

        # Generate HTML
        html = self.generate_html(block, title)
        filename = self.output_dir / f"{article_id}-{lang}.html"
        filename.write_text(html, encoding='utf-8')

        return block

    def generate_html(self, block, title):
        article_id = block["meta"]["articleId"]
        lang = block["meta"]["lang"]

        return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <select id="lang-switcher" data-article="{article_id}" data-lang="{lang}">
      <option>Loading...</option>
    </select>
    <select id="version-switcher" data-article="{article_id}" data-lang="{lang}">
      <option>Current</option>
    </select>
  </nav>

  <article>
    {block["content"]}
  </article>

  <script type="application/json" id="tref-block">
{json.dumps(block, indent=2, ensure_ascii=False)}
  </script>
  <script src="tref-nav.js"></script>
</body>
</html>'''

    def save_index(self):
        """Save the index file."""
        index_file = self.output_dir / "tref-index.json"
        index_file.write_text(
            json.dumps(self.index, indent=2, ensure_ascii=False),
            encoding='utf-8'
        )
        print(f"Saved: {index_file}")

# Usage
publisher = TrefPublisher("./public")

# Publish original (Danish)
da_block = publisher.publish(
    content="<h1>Min Artikel</h1><p>Dansk indhold...</p>",
    article_id="blog-42",
    lang="da",
    title="Min Artikel"
)

# Publish translation (English) - parent is Danish block
publisher.publish(
    content="<h1>My Article</h1><p>English content...</p>",
    article_id="blog-42",
    lang="en",
    title="My Article",
    parent=da_block["id"]
)

# Publish update (Danish v2)
publisher.publish(
    content="<h1>Min Artikel (Opdateret)</h1><p>Nyt dansk indhold...</p>",
    article_id="blog-42",
    lang="da",
    title="Min Artikel",
    parent=da_block["id"]
)

# Save the index
publisher.save_index()
```

### Pros & Cons

**Pros:**
- One index file for entire site
- Dropdowns populated dynamically
- Easy to add languages/versions
- Version history accessible

**Cons:**
- Requires JavaScript
- Extra HTTP request for index

---

## Strategy D: Hybrid (JAMstack)

Build-time rendering with minimal client JS.

### Architecture

```
┌─────────────────┐
│ Build Process   │
│ (Python/Node)   │
│       │         │
│  Read JSON DB   │
│       │         │
│  Generate HTML  │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│  Static Files   │
│  (complete HTML │
│   with all data │
│   embedded)     │
└───────┬─────────┘
        │
        ▼
    Static Host
        │
        ▼
    Browser
  (optional JS)
```

### Embedded Data

All navigation data baked into each page:

```html
<!DOCTYPE html>
<html lang="da">
<head>
  <script type="application/json" id="page-data">
  {
    "articleId": "blog-42",
    "currentLang": "da",
    "languages": {
      "da": {"url": "blog-42-da.html", "title": "Min Artikel"},
      "en": {"url": "blog-42-en.html", "title": "My Article"},
      "de": {"url": "blog-42-de.html", "title": "Mein Artikel"}
    },
    "versions": [
      {"version": 2, "date": "2026-01-08", "current": true},
      {"version": 1, "date": "2026-01-05", "url": "archive/blog-42-da-v1.html"}
    ],
    "tref": {
      "id": "sha256:aaa...",
      "content": "...",
      "parent": null
    }
  }
  </script>
</head>
<body>
  <!-- Dropdowns populated from embedded data, no fetch needed -->
</body>
</html>
```

**Pros:**
- No runtime fetching
- All data available immediately
- Works offline

**Cons:**
- Larger HTML files
- Must rebuild all pages on any change

---

## Visual Overview

### Article with Translations

```
                    blog-42
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
      Danish        English       German
   sha256:aaa...  sha256:bbb...  sha256:ccc...
   (original)     parent: aaa    parent: aaa
```

### Article with Version History

```
blog-42 (Danish)

v1: sha256:aaa...  ←── Original
         │
         ▼
v2: sha256:ddd...  ←── parent: aaa (edit)
         │
         ▼
v3: sha256:eee...  ←── parent: ddd (edit)
```

### Combined: Translations + Versions

```
                        blog-42
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
      Danish            English           German
         │                 │                 │
    v1: aaa... ◄──────────┼────────────────┼── (original)
         │                 │                 │
    v2: ddd...        v1: bbb...        v1: ccc...
         │            parent:aaa        parent:aaa
    v3: eee...
    parent:ddd
```

---

## Block Structure Reference

### Original Article

```json
{
  "v": 1,
  "id": "sha256:a1b2c3d4e5f6...",
  "content": "# Min Artikel\n\nDette er indholdet...",
  "meta": {
    "created": "2026-01-08T10:00:00Z",
    "license": "TREF-1.0",
    "articleId": "blog-42",
    "lang": "da"
  },
  "refs": [
    { "type": "url", "url": "https://example.eu/blog/42" }
  ],
  "parent": null
}
```

### Translation

```json
{
  "v": 1,
  "id": "sha256:f6e5d4c3b2a1...",
  "content": "# My Article\n\nThis is the content...",
  "meta": {
    "created": "2026-01-08T11:00:00Z",
    "license": "TREF-1.0",
    "articleId": "blog-42",
    "lang": "en"
  },
  "refs": [
    { "type": "url", "url": "https://example.eu/blog/42" },
    { "type": "url", "url": "https://example.eu/en/blog/42" }
  ],
  "parent": "sha256:a1b2c3d4e5f6..."
}
```

### Updated Version

```json
{
  "v": 1,
  "id": "sha256:1a2b3c4d5e6f...",
  "content": "# Min Artikel (Opdateret)\n\nNyt indhold...",
  "meta": {
    "created": "2026-01-09T10:00:00Z",
    "license": "TREF-1.0",
    "articleId": "blog-42",
    "lang": "da"
  },
  "parent": "sha256:a1b2c3d4e5f6..."
}
```

---

## Summary

| Concept | Field | Purpose |
|---------|-------|---------|
| Integrity | `id` (SHA-256) | Verify content unchanged |
| Article grouping | `meta.articleId` | Your identifier |
| Language | `meta.lang` | Language code |
| Lineage | `parent` | Links translations/versions |

**Choose your strategy:**

| If you have... | Use Strategy |
|----------------|--------------|
| Server + database | A: Dynamic |
| Static host, no JS | B: Baked HTML |
| Static host + JS | C: Shared Index |
| Build step, minimal JS | D: Hybrid |

---

## History Feature

The TrefWrapper includes a History button that shows version history in a popup.

### Setup

1. **Create history JSON file** in your article folder:

```
/my-article/
  index.html
  history-42.json    ← version history
```

2. **history-42.json** (Google-crawlable):

```json
{
  "current": "sha256:ddd...",
  "versions": [
    { "v": 3, "id": "sha256:ddd...", "date": "2026-01-08" },
    { "v": 2, "id": "sha256:bbb...", "date": "2026-01-06" },
    { "v": 1, "id": "sha256:aaa...", "date": "2026-01-04" }
  ]
}
```

3. **Add `data-history` attribute** to wrapper element:

```html
<div class="tref-wrapper"
     data-tref-id="sha256:ddd..."
     data-history="history-42.json">
  ...
</div>
```

### Publisher generates history

```python
def update_history(article_id, block, history_file):
    """Update history.json with new version."""

    # Load existing or create new
    if Path(history_file).exists():
        history = json.loads(Path(history_file).read_text())
    else:
        history = {"current": None, "versions": []}

    # Add new version
    version_num = len(history["versions"]) + 1
    history["versions"].insert(0, {
        "v": version_num,
        "id": block["id"],
        "date": datetime.now().strftime("%Y-%m-%d")
    })

    # Update current
    history["current"] = block["id"]

    # Save
    Path(history_file).write_text(json.dumps(history, indent=2))

# Usage
update_history("42", block, "./my-article/history-42.json")
```

### SEO benefit

The `current` field always points to newest version, so Google can verify it's crawling the latest:

```json
{
  "current": "sha256:ddd...",  ← Always newest
  "versions": [...]
}
```

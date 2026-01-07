# AIBlocks Format Specification v1.0

**AIBlocks - Traceable Knowledge Format**

A JSON-based format for knowledge exchange where references are structural, not optional.

---

## Overview

An AIBlock is a JSON object containing:

* **Content** – Markdown text (the article/document)
* **Metadata** – Author, timestamps, license
* **Origin** – Where this block is published
* **References** – Sources, archives, search prompts, hashes
* **Lineage** – Parent block if derived

---

## Format

```json
{
  "v": 1,
  "id": "sha256:a1b2c3d4e5f6...",
  "content": "# My Article\n\nMarkdown content here...",
  "meta": {
    "author": "Name or identifier",
    "created": "2025-01-06T12:00:00Z",
    "modified": "2025-01-06T14:30:00Z",
    "license": "AIBlocks-1.0",
    "lang": "en"
  },
  "origin": {
    "url": "https://example.com/articles/my-article",
    "title": "My Article Title"
  },
  "refs": [
    { "type": "url", "url": "https://source.com/page", "title": "Source Title" },
    { "type": "archive", "snippet": "Archived text...", "from": "https://..." },
    { "type": "search", "query": "search terms to refind" },
    { "type": "hash", "alg": "sha256", "value": "abc123...", "of": "https://..." }
  ],
  "parent": "sha256:9f8e7d6c5b4a..."
}
```

---

## Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `v` | number | Format version (currently `1`) |
| `id` | string | Content-based hash: `sha256:<hash>` |
| `content` | string | Markdown content |
| `meta` | object | Metadata object |
| `meta.created` | string | ISO 8601 timestamp |
| `meta.license` | string | License identifier |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `meta.author` | string | Author name/identifier |
| `meta.modified` | string | ISO 8601 timestamp |
| `meta.lang` | string | ISO 639-1 language code |
| `origin` | object | Where block is published |
| `origin.url` | string | Canonical URL |
| `origin.title` | string | Document title |
| `refs` | array | Reference objects |
| `parent` | string | Parent block ID if derived |

---

## Reference Types

### URL Reference

Classic web link with optional metadata.

```json
{
  "type": "url",
  "url": "https://example.com/source",
  "title": "Source Title",
  "accessed": "2025-01-06T12:00:00Z"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"url"` |
| `url` | yes | Valid URL |
| `title` | no | Human-readable title |
| `accessed` | no | When link was accessed |

### Archive Reference

Preserved content for when links die (RAG snippet).

```json
{
  "type": "archive",
  "snippet": "The relevant text content preserved...",
  "from": "https://original-url.com/page",
  "archived": "2025-01-06T12:00:00Z",
  "context": "Surrounding context if relevant"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"archive"` |
| `snippet` | yes | Preserved text content |
| `from` | no | Original URL |
| `archived` | no | When archived |
| `context` | no | Additional context |

### Search Reference

Query to refind content if links die.

```json
{
  "type": "search",
  "query": "exact phrase or search terms",
  "engine": "google",
  "expect": "Expected page title"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"search"` |
| `query` | yes | Search query string |
| `engine` | no | Suggested search engine |
| `expect` | no | Expected result title |

### Hash Reference

Cryptographic verification of content.

```json
{
  "type": "hash",
  "alg": "sha256",
  "value": "a1b2c3d4e5f6...",
  "of": "https://example.com/file.pdf"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"hash"` |
| `alg` | yes | `sha256`, `sha384`, or `sha512` |
| `value` | yes | Hash value (hex) |
| `of` | no | What was hashed |

---

## ID Generation

The `id` field is a content-based hash ensuring:

* Same content = same ID
* Different content = different ID
* Publisher-independent identity

### Algorithm

1. Create canonical JSON with fields in order: `v`, `content`, `meta`, `origin`, `refs`, `parent`
2. Remove `id` field if present
3. Serialize to JSON with:
   * No whitespace
   * Keys sorted alphabetically within objects
   * UTF-8 encoding
4. Hash with SHA-256
5. Format as `sha256:<hex>`

### Example

```javascript
const canonical = JSON.stringify(block, Object.keys(block).sort());
const hash = sha256(canonical);
const id = `sha256:${hash}`;
```

---

## Lineage

When deriving a block from another:

1. Edit the `content`
2. Set `parent` to the source block's `id`
3. Preserve relevant `refs` from source
4. Run through Publisher to get new `id`

```
Block A (id: sha256:aaa)
    ↓ derived
Block B (id: sha256:bbb, parent: sha256:aaa)
    ↓ derived
Block C (id: sha256:ccc, parent: sha256:bbb)
```

The lineage tree can be followed back to the original.

---

## Content Format

The `content` field contains Markdown following CommonMark specification.

* Standard Markdown syntax
* No embedded HTML required
* Can include code blocks, lists, tables
* Should be self-contained

---

## File Extension

The format uses the `.tref` extension (Traceable Reference):

```
my-article.tref
```

Or `.tref.json` for explicit JSON:

```
my-article.tref.json
```

Note: The project is called "AIBlocks" but the file format is generic and not AI-specific.

---

## MIME Type

```
application/vnd.tref+json
```

---

## Security

AIBlocks is designed to be safe by construction:

### No Executable Code

* JSON is pure data – no functions, no eval
* Markdown is text only – no embedded scripts
* No binary content – everything is human-readable
* No auto-executing links or embeds

### Schema Validation

* Unknown fields are rejected
* URLs are validated but not fetched automatically
* Content is treated as plain text/markdown
* No file system access from format

### Safe for AI

* AI can read blocks without security risk
* AI can generate blocks safely
* No injection attacks possible via format
* Content is isolated from execution context

### What Blocks Cannot Do

* Execute code
* Access file system
* Make network requests
* Modify system state
* Include binary data
* Run scripts

This makes AIBlocks safe for:

* Drag-and-drop between applications
* AI ingestion and generation
* Automated processing pipelines
* User-generated content

---

## Validation Rules

A valid AIBlock must:

1. Have `v` equal to `1`
2. Have `id` matching content hash
3. Have non-empty `content`
4. Have `meta.created` as valid ISO 8601
5. Have `meta.license` (recommend `AIBlocks-1.0`)
6. Have valid reference objects if `refs` present
7. Have valid block ID format if `parent` present

---

## Examples

### Minimal Block

```json
{
  "v": 1,
  "id": "sha256:abc123...",
  "content": "# Hello\n\nThis is a minimal block.",
  "meta": {
    "created": "2025-01-06T12:00:00Z",
    "license": "AIBlocks-1.0"
  }
}
```

### Full Article Block

```json
{
  "v": 1,
  "id": "sha256:def456...",
  "content": "# Understanding AI Safety\n\n## Introduction\n\nAI safety is...",
  "meta": {
    "author": "Jane Researcher",
    "created": "2025-01-06T12:00:00Z",
    "modified": "2025-01-06T18:00:00Z",
    "license": "AIBlocks-1.0",
    "lang": "en"
  },
  "origin": {
    "url": "https://janeresearcher.com/ai-safety",
    "title": "Understanding AI Safety"
  },
  "refs": [
    {
      "type": "url",
      "url": "https://arxiv.org/abs/2301.00001",
      "title": "AI Safety Paper"
    },
    {
      "type": "archive",
      "snippet": "Key finding: safety measures reduce risk by 40%...",
      "from": "https://oldsite.com/study"
    }
  ]
}
```

### Derived Block

```json
{
  "v": 1,
  "id": "sha256:ghi789...",
  "content": "# AI Safety Summary\n\nBased on Jane's research...",
  "meta": {
    "author": "Bob Writer",
    "created": "2025-01-07T10:00:00Z",
    "license": "AIBlocks-1.0",
    "lang": "en"
  },
  "refs": [
    {
      "type": "url",
      "url": "https://arxiv.org/abs/2301.00001",
      "title": "AI Safety Paper"
    }
  ],
  "parent": "sha256:def456..."
}
```

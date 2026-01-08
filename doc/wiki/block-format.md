---
title: Block Format
slug: block-format
section: Basics
---

# Block Format

Understanding the TREF block structure.

## Block Anatomy

A TREF block is a JSON object with these fields:

```json
{
  "v": 1,
  "id": "sha256:abc123...",
  "content": "The actual text content",
  "meta": {
    "created": "2026-01-08T12:00:00Z",
    "license": "CC-BY-4.0",
    "author": "Author Name"
  },
  "refs": [...],
  "parent": "sha256:parent..."
}
```

## Required Fields

### v (version)

Always `1` for the current format version.

### id

SHA-256 hash of the content, prefixed with `sha256:`.

```
sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

### content

The actual text content. Can be plain text, Markdown, or any text format.

### meta

Metadata object containing:

* `created` - ISO 8601 timestamp
* `license` - License identifier (e.g., CC-BY-4.0)
* `author` - Optional author name
* `modified` - Optional modification timestamp
* `lang` - Optional language code

## Optional Fields

### refs

Array of reference objects. Each reference has a `type`:

**URL Reference**

```json
{
  "type": "url",
  "url": "https://example.com/source",
  "title": "Source Title"
}
```

**Archive Reference** (for dead link recovery)

```json
{
  "type": "archive",
  "url": "https://example.com/source",
  "snippet": "Relevant text excerpt...",
  "title": "Source Title"
}
```

**Search Reference** (for refinding)

```json
{
  "type": "search",
  "query": "search terms to find source"
}
```

**Hash Reference** (for verification)

```json
{
  "type": "hash",
  "alg": "sha256",
  "value": "abc123..."
}
```

### parent

ID of the parent block when this block is derived from another.

```json
{
  "parent": "sha256:original-block-id..."
}
```

## ID Generation

The block ID is generated from the **content only**, not including metadata. This ensures:

* Same content always produces same ID
* Metadata changes don't break validation
* Easy to verify integrity

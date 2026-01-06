# AI-Blocks – Publisher

## Role and Purpose

An **AI-Blocks Publisher** is the minimal software layer that makes it possible to **publish, distribute, and preserve AI-Blocks**, without controlling their content or use.

The publisher is not a platform and not a gatekeeper. It is a **publishing mechanism**.

It has one responsibility: to make blocks **accessible, consistent, and verifiable**.

---

## Two Outputs

The publisher takes a draft and produces two outputs:

```
                    ┌──────────────┐
Draft markdown ───► │   PUBLISHER  │
+ refs              └──────┬───────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    AIBlock (.aiblock)           HTML article + wrapper
    - pure JSON data             - rendered markdown
    - transportable              - embedded block data
    - AI-readable                - drag/copy/download
```

### Output 1: AIBlock File

Pure JSON data for transport and AI consumption:

```json
{
  "v": 1,
  "id": "sha256:...",
  "content": "# Article\n\nMarkdown...",
  "meta": { "author": "...", "created": "..." },
  "refs": [ ... ],
  "parent": "sha256:..."
}
```

- No JavaScript, no HTML, no CSS
- Machine-readable
- Content-addressable (ID from hash)
- Safe for drag-and-drop

### Output 2: HTML Article with Wrapper

Website-ready article with embedded block:

```html
<article class="aiblock-article">
  <!-- Rendered markdown as HTML -->
  <h1>Article</h1>
  <p>Content...</p>
</article>

<div class="aiblock-wrapper" data-block-id="sha256:...">
  <svg class="aiblock-icon">...</svg>
  <script type="application/json" class="aiblock-data">
    { "v": 1, "id": "sha256:...", ... }
  </script>
</div>

<script src="aiblock-wrapper.js"></script>
```

- Text is 1:1 identical to block content
- Wrapper enables drag/copy/download
- Site adds its own styling
- Block data embedded or linked

---

## Publisher Functions

### Core Functions

| Function | Input | Output |
|----------|-------|--------|
| `publish(draft)` | Draft block | AIBlock with ID |
| `render(block)` | AIBlock | HTML article |
| `wrap(block)` | AIBlock | HTML wrapper snippet |
| `bundle(block)` | AIBlock | Complete HTML file |

### ID Generation

1. Take draft (without ID)
2. Serialize to canonical JSON (sorted keys, no whitespace)
3. Hash with SHA-256
4. Format as `sha256:<hex>`

Same content always produces same ID.

### Derive Function

When creating a derived block:

1. Take source block
2. Modify content
3. Set `parent` to source block's ID
4. Preserve relevant `refs`
5. Publish → new ID

---

## Design Philosophy

### Minimalism

The publisher should be implementable:

* As a small JS script on a static site
* As a Python module in a build or data flow
* As a CLI tool (stdio)
* As an MCP server for AI integration

No databases required. No login. No sessions.

### Determinism

Given the same input block, the publisher must always produce:

* Same output
* Same ID
* Same hash

This enables:

* Caching
* Comparison across sites
* Independent validation

### Publishing ≠ Ownership

The publisher:

* Does not change block content
* Does not rewrite references
* Does not interpret truth

It **exposes** – it does not edit.

---

## Wrapper Component

The wrapper is a small JS component that:

1. **Displays** an AI-Block icon
2. **Enables** drag-and-drop of block data
3. **Enables** copy to clipboard
4. **Enables** download as .aiblock file

### Interactions

| Action | Result |
|--------|--------|
| Click icon | Show block info |
| Drag icon | Transfer block JSON |
| Right-click | Context menu (copy/download) |
| Keyboard | Accessible alternatives |

### Data Transfer

On drag/copy, the wrapper provides:

* `application/json` – full block JSON
* `text/plain` – markdown content only
* `text/uri-list` – link to .aiblock file

---

## Implementation Targets

### JS Publisher (Runtime)

For static websites and browsers:

* Validates blocks
* Generates wrapper HTML
* Handles drag/copy/download
* No server required

### Python Publisher (Build-time)

For static site generators and pipelines:

* Generates blocks from markdown files
* Batch processing
* CI/CD integration
* File output

### CLI Publisher (stdio/MCP)

For terminal and AI integration:

* `aiblock publish < draft.md > block.aiblock`
* `aiblock render < block.aiblock > article.html`
* MCP server for Claude/AI tools
* Pipe-friendly

---

## Security

The publisher:

* Does not log users
* Does not track behavior
* Collects no personal data
* Executes no remote code
* Only processes local data

Responsibility lies in **block content**, not in the mechanism.

---

## Interplay with Other Publishers

Multiple publishers can publish **the same block**.

Identity is determined by content – not domain.

This enables:

* Mirroring
* Archiving
* Independent confirmation

---

## Summary

The publisher is deliberately boring. The less it does, the stronger the format becomes.

It exists to ensure that knowledge can be published **once** – and used **many places** without losing itself.

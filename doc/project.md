# TREF

**Traceable Reference Format**

## Purpose

TREF is an open, transportable, and verifiable JSON format designed to solve a core problem in the AI era: **preservation, validation, and reuse of knowledge with traceable source origin** – across websites, editors, chats, LLMs, and tools.

The format combines content, metadata, license, references, and lineage in a single self-contained unit that can be copied, dragged, shared, and rewritten – without losing origin, context, or accountability.

TREF is not a CMS, a social network, or an AI model. It is a **knowledge exchange format**.

---

## The Core Idea

### From Reference Block to Article Block

The original idea was simple: a small data package (TREF block) embedded in a website article containing:

* A link back to the article it's embedded in
* References to all source materials mentioned in the article
* Draggable/copyable from its wrapper to anywhere else

Then came the insight: **why not put the entire article in the block?**

Now the article on the website IS the block. The block is the source, not an attachment.

### Two Modes, One Format

| | Reference Block | Article Block |
|---|---|---|
| `content` | Empty/minimal | Full markdown article |
| `refs` | The main payload | Sources for the article |
| Use case | Attach to existing content | Block IS the content |
| Wrapper | Icon next to article | Renders the article |

Both use the same format. The difference is what you put in `content`.

---

## License as Format

### The Problem with Traditional Licenses

Traditional open content licenses rely on:

* Legal text that users must read
* Manual attribution that users must remember
* Trust that users will comply
* Difficult enforcement after the fact

### The TREF Solution

**The format IS the license.**

When you use a TREF block correctly:

* References cannot be removed without breaking the format
* Attribution is automatic and structural
* Lineage is preserved by the Publisher
* AI can verify compliance

**Simple license principle:**
> Use freely. Preserve the format. References follow automatically.

### How It Works

1. You write an article → run through Publisher → Block A
2. Someone rewrites your article → runs through Publisher → Block B
3. Block B automatically contains:
   * New content-based ID
   * `parent` pointing to Block A
   * All original `refs` preserved
   * Their additions clearly marked

The reference tree grows automatically. No manual citation needed.

### AI as Enforcer

AI systems can:

* Validate that refs are intact
* Follow lineage to original source
* Reject "broken" blocks with missing refs
* Produce correctly formatted blocks themselves

This makes legitimate reuse trivial and illegitimate use detectable.

---

## Core Principles

### 1. The Block is the Atom of Truth

A TREF block is the smallest meaningful unit of knowledge.

* It can stand alone
* It can be embedded in other systems
* It can be transformed without losing origin

Content is secondary; *structure* is the carrying element.

---

### 2. Reference Lineage

Each block has a unique ID and can point to:

* Source blocks (parents)
* Derived blocks (children)
* Its own history

Rewriting, translation, condensation, or synthesis creates **new blocks**, not overwrites.

This creates a family tree of knowledge, not a linear version history.

---

### 3. Preserve References – Even When Links Die

References are not just URLs.
A block can contain:

* Classic links
* Archived text excerpts (RAG snippets)
* Search prompts for refinding
* Hashes or checksums

Thus, a reference can be *restored*, not just clicked.

---

### 4. AI-First, Human-Readable

The format is designed for:

* LLM validation
* Machine parsing
* Automatic source control

…but remains readable and editable by humans (JSON / YAML / Markdown).

TREF blocks can be used directly as:

* Chat input (drag and drop)
* RAG sources
* Documentation
* Articles

---

### 5. Use Without Trust – Verifiability Over Authority

The system does not assume trust in the publisher.

Instead, anyone can:

* Validate references
* Follow the lineage tree
* Compare parallel blocks
* Reject or accept blocks

Truth emerges through *transparency*, not central control.

---

### 6. Copy = Citation

Copying a block is an action with semantics:

* Origin is preserved
* References are preserved
* License is preserved

Use *as-is* provides automatic correct attribution and backlinks.

---

## Workflow

### Creating a Block

```
Write markdown → Publisher → TREF block with ID
```

### Using Someone's Block

```
Their block → Edit markdown → Publisher → New block with lineage
```

### AI Interaction

```
Drag block to chat → AI reads markdown + refs → AI creates new block → Publisher
```

---

## AI Canvas

TREF is ideal as an AI Canvas format – a collaborative workspace where humans and AI work together with full traceability.

### How It Works

```
User writes draft
       ↓
   [block A]
       ↓
AI expands content → adds refs to sources used
       ↓
   [block B, parent: A]
       ↓
User edits → verifies refs → accepts/rejects
       ↓
   [block C, parent: B]
```

Each iteration creates a new block. The lineage tree shows exactly who contributed what.

### Why TREF for Canvas

| Feature | Canvas Benefit |
|---------|----------------|
| `content` | Markdown canvas – universal, portable |
| `refs` | AI's sources visible and verifiable |
| `parent` | Version history without version control |
| `id` | Snapshot verification – detect tampering |
| No executable code | Safe to share, safe to open |

### Detecting AI Hallucinations

When AI generates content:

* **Good**: AI adds `refs` pointing to real sources
* **Suspicious**: AI writes claims without `refs`
* **Verifiable**: Human can check if `refs` support the claims

The format makes AI's work transparent. Missing or incorrect refs reveal where AI is guessing.

### Canvas Scenarios

1. **Research Assistant**: AI summarizes papers → refs link to original PDFs/arxiv
2. **Writing Partner**: AI expands outline → parent chain shows evolution
3. **Fact Checker**: AI reviews claims → adds hash refs for verification
4. **Translation**: AI translates → parent points to original language block

---

## Non-Goals

TREF is **not**:

* A payment platform
* A blockchain
* A social medium
* A DRM system
* A truth authority

It is a *format and a practice*.

---

## Vision

If TREF is widely used:

* Articles become composed of verifiable parts
* AI can cross-check AI
* Knowledge regains origin
* References survive rewriting
* Legitimate reuse becomes frictionless
* Attribution becomes automatic

TREF is an attempt to give knowledge **backbone** in a world of probabilistic models.

---

## Visual Identity

### Theme: Purple-Mint

| Element | Value |
|---------|-------|
| Primary background | `#2D1B4E` (deep purple) |
| Primary accent | `#5CCCCC` (mint) |
| Icon | Chain link (traceable reference) |

### Assets

```
assets/
├── SVG/
│   ├── tref-link.svg                    (base)
│   ├── tref-link-purple-mint.svg        (primary)
│   └── tref-link-purple-mint-square.svg (square)
├── PNG/
│   └── tref-link-{16,32,48,64,128,256,512}.png
├── favicon/
│   ├── favicon.ico
│   └── apple-touch-icon.png
└── origin/
    └── source files
```

### Icon Meaning

The chain link represents:

* **Traceability** – references are linked, not lost
* **Connection** – knowledge connects to its sources
* **Integrity** – the chain is unbroken

---

## Repository Architecture

### Single Source Principle

**One source, many outputs.** All UI components live in `src/` and are built to `dist/`. Nothing is hardcoded or copied.

```
src/wrapper/wrapper.js    ← SINGLE SOURCE OF TRUTH
        │
        ▼
    npm run build
        │
        ▼
dist/tref-block.js        ← Built (not copied)
        │
        ├──> CDN (jsdelivr/unpkg)
        │        │
        │        ├──> demo/
        │        ├──> docs/ (tref.lpmwfx.com)
        │        └──> External sites
        │
        └──> npm install tref-block

Change design once → rebuild → all consumers updated
```

### Directory Structure

```
TRefBlocks/
├── src/                  # SOURCE - the only place code is written
│   ├── wrapper/          #   UI components (wrapper.js)
│   ├── builder/          #   Block creation logic
│   └── index.js          #   Main entry, schemas
│
├── dist/                 # BUILT - generated by npm, never edited
│   ├── tref-block.js     #   ES module bundle
│   ├── tref-block.min.js #   Minified for production
│   └── tref-block.css    #   Extracted styles (optional)
│
├── demo/                 # DEMO - imports from dist/ or CDN
│   └── index.html        #   Visual testing page
│
├── docs/                 # SITE - GitHub Pages (tref.lpmwfx.com)
│   └── ...               #   Imports from CDN
│
├── doc/                  # DOCUMENTATION - project docs (not site)
│   ├── project.md        #   This file
│   └── TrefBlockUIUX.md  #   UI/UX specification
│
└── assets/               # ASSETS - icons, images
    └── ...
```

### Build Workflow

```bash
# Development: edit src/, test in demo/
npm run dev           # Watch mode, serves demo/

# Production: build to dist/
npm run build         # Bundles src/ → dist/

# Publish: push to npm, CDN auto-updates
npm publish           # Publishes to npm registry
                      # jsdelivr/unpkg serve from npm automatically
```

### Integration Options

**CDN (recommended for websites):**
```html
<script type="module">
  import { TrefWrapper } from 'https://cdn.jsdelivr.net/npm/tref-block';
</script>
```

**npm (for JS projects):**
```bash
npm install tref-block
```
```javascript
import { TrefWrapper } from 'tref-block';
```

**Local development:**
```javascript
import { TrefWrapper } from './src/wrapper/wrapper.js';
```

---

## Status

TREF is an open, experimental format under active development.
Standardization emerges through use – not through prior committees.

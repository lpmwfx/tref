# AIBlocks

**Traceable Knowledge Format**

## Purpose

AIBlocks is an open, transportable, and verifiable JSON format designed to solve a core problem in the AI era: **preservation, validation, and reuse of knowledge with traceable source origin** – across websites, editors, chats, LLMs, and tools.

The format combines content, metadata, license, references, and lineage in a single self-contained unit that can be copied, dragged, shared, and rewritten – without losing origin, context, or accountability.

AIBlocks is not a CMS, a social network, or an AI model. It is a **knowledge exchange format**.

---

## The Core Idea

### From Reference Block to Article Block

The original idea was simple: a small data package (AIBlock) embedded in a website article containing:

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

### The AIBlocks Solution

**The format IS the license.**

When you use an AIBlock correctly:

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

An AIBlock is the smallest meaningful unit of knowledge.

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

AIBlocks can be used directly as:

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
Write markdown → Publisher → AIBlock with ID
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

## Non-Goals

AIBlocks is **not**:

* A payment platform
* A blockchain
* A social medium
* A DRM system
* A truth authority

It is a *format and a practice*.

---

## Vision

If AIBlocks is widely used:

* Articles become composed of verifiable parts
* AI can cross-check AI
* Knowledge regains origin
* References survive rewriting
* Legitimate reuse becomes frictionless
* Attribution becomes automatic

AIBlocks is an attempt to give knowledge **backbone** in a world of probabilistic models.

---

## Status

AIBlocks is an open, experimental format under active development.
Standardization emerges through use – not through prior committees.

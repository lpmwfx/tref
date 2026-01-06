# AI-Blocks

## Purpose

AI-Blocks is an open, transportable, and verifiable block format designed to solve a core problem in the AI era: **preservation, validation, and reuse of knowledge with traceable source origin** – across websites, editors, chats, LLMs, and tools.

The project introduces a *block-based article and data format*, where content, metadata, license, references, and history are combined in a single self-contained unit that can be copied, dragged, shared, and rewritten – without losing origin, context, or accountability.

AI-Blocks is not a CMS, a social network, or an AI model. It is a **knowledge-bearing object format**.

---

## Core Principles

### 1. The Block is the Atom of Truth

An AI-Block is the smallest meaningful unit of knowledge.

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

…but remains readable and editable by humans (JSON / YAML / MD).

AI-Blocks can be used directly as:

* Chat input
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

## Conceptual Design

### Block Types

AI-Blocks is type-agnostic but not structure-less.
Examples:

* Article block
* Data block
* Reference node
* Prompt block
* Summary / abstract

All share the same core principles.

---

### Wrapper & Visual Representation

On websites, the block is represented by:

* A simple AI-Block icon (SVG or other)
* A JS wrapper that:

  * Loads block data
  * Allows drag / copy / download
  * Delivers data file (not icon)

The user interacts visually – the system delivers semantics.

---

### Transportability

An AI-Block can move between:

* Website → chat
* Chat → editor
* Editor → repo
* Repo → site

Without changing the content's identity.

---

## Intentions

### For Humans

* Easy correct source attribution
* Simple knowledge reuse
* No complex license handling

### For AI Systems

* Machine-readable references
* Verifiable statements
* Clear origin

### For Publishers

* Built-in attribution
* Backlinks with correct use
* Less scraping, more citation

---

## Non-Goals

AI-Blocks is **not**:

* A payment platform
* A blockchain
* A social medium
* A DRM system
* A truth authority

It is a *format and a practice*.

---

## Vision

If AI-Blocks is widely used:

* Articles become composed of verifiable parts
* AI can cross-check AI
* Knowledge regains origin
* References survive rewriting

AI-Blocks is an attempt to give knowledge **backbone** in a world of probabilistic models.

---

## Status

AI-Blocks is an open, experimental format under active conceptual development.
Standardization emerges through use – not through prior committees.

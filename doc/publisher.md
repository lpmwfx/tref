# AI-Blocks – Publisher

## Role and Purpose

An **AI-Blocks Publisher** is the minimal software layer that makes it possible to **publish, distribute, and preserve AI-Blocks**, without controlling their content or use.

The publisher is not a platform and not a gatekeeper. It is a **publishing mechanism**.

It has one responsibility: to make blocks **accessible, consistent, and verifiable**.

---

## Design Philosophy

### Minimalism

The publisher should be implementable:

* As a small JS script on a static site
* As a Python module in a build or data flow

No databases required. No login. No sessions.

---

### Determinism

Given the same input block, the publisher must always produce:

* Same output
* Same ID
* Same hash

This enables:

* Caching
* Comparison across sites
* Independent validation

---

### Publishing ≠ Ownership

The publisher:

* Does not change block content
* Does not rewrite references
* Does not interpret truth

It **exposes** – it does not edit.

---

## Core Responsibilities

### 1. Block Serialization

The publisher must be able to:

* Load a block (JSON / YAML / MD)
* Normalize structure (field order, encoding)
* Serialize to a stable format

This is the foundation for hash and ID.

---

### 2. Identity & Stable ID

Each block is assigned an identity layer based on:

* Normalized content
* Metadata
* References

The ID is **content-dependent**, not publisher-dependent.

---

### 3. Hash & Integrity

The publisher generates:

* A cryptographic hash of the serialized block

This enables:

* Integrity control
* Manipulation detection
* Comparison of copies

---

### 4. Distribution

The publisher makes the block available via:

* Static file (e.g., `/ai-blocks/<id>.json`)
* Inline embed
* Download trigger (drag / copy)

How it is served is secondary – **access** is central.

---

### 5. Visual Wrapper (JS)

In JS context, the publisher provides:

* A visual icon (AI-Block)
* An interaction interface
* A data output on action

The icon is only affordance – data is payload.

---

### 6. Build-time Publishing (Python)

In Python context, the publisher is typically used:

* During site build
* In document generation
* In data pipelines

The publisher functions as a *purity filter* between raw content and public block.

---

## JS Publisher – Conceptual Role

The JS version is **runtime-oriented**:

* Loads block data
* Validates structure
* Delivers the block on user action

It has no persistent state.

Typical environments:

* Static website
* Docs sites
* Blogs
* Knowledge bases

---

## Python Publisher – Conceptual Role

The Python version is **build and pipeline-oriented**:

* Generates blocks from sources
* Normalizes and signs output
* Exports to files

Typical environments:

* Static site generators
* CI/CD
* Data pipelines
* Archiving

---

## Security & Responsibility

The publisher:

* Does not log users
* Does not track behavior
* Collects no personal data

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

## Design Consequence

The publisher is deliberately boring.

The less it does, the stronger the format becomes.

---

## Positioning

AI-Blocks Publisher is:

* A library, not a service
* A tool, not a platform
* A principle, not a policy

It exists to ensure that knowledge can be published **once** – and used **many places** without losing itself.

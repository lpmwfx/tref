# AIBlocks

**Traceable Knowledge Format**

A JSON-based format for knowledge exchange where references are structural, not optional.

## What is AIBlocks?

AIBlocks is a **knowledge exchange format** – not a CMS, not an AI model, not a platform. It's a JSON format for creating self-contained units of knowledge that preserve:

- **Content** – the actual information
- **Metadata** – author, timestamps, source
- **License** – attribution requirements
- **References** – URLs, archived snippets, search prompts, hashes
- **Lineage** – parent/child relationships, version history

## Core Principles

1. **The Block is the Atom of Truth** – smallest meaningful unit of knowledge
2. **Reference Lineage** – modifications create new blocks, preserving history
3. **References Survive** – not just URLs, but archived snippets and search prompts
4. **AI-First, Human-Readable** – JSON format readable by both machines and humans
5. **Verifiability Over Authority** – trust through transparency, not central control
6. **Copy = Citation** – copying preserves origin, references, and license

## Quick Start

```bash
npm install
npm run check   # typecheck + lint + format
npm test        # run tests
```

## Development

This project uses **TypeScript-level safety in pure JavaScript**:

- JSDoc type annotations
- TypeScript CLI for type checking (no transpilation)
- ESLint with type-aware rules
- Zod for runtime validation
- Prettier for formatting

```bash
npm run typecheck     # type check
npm run lint          # lint
npm run format        # format code
npm run check         # all checks
npm test              # run tests
```

## Project Structure

```
src/
  schemas/
    block.js          # Block schema with Zod
    reference.js      # Reference types (URL, archive, search, hash)
    block.test.js     # Tests
doc/
  format.md           # Format specification v1.0
  license.md          # License philosophy (format-as-license)
  project.md          # Project vision and principles
  publisher.md        # Publisher specification
  TS-like-JS.md       # TypeScript-in-JS approach
```

## Documentation

- [Format Specification](doc/format.md) – complete AIBlocks v1.0 format spec
- [License Philosophy](doc/license.md) – format-as-license concept
- [Project Vision](doc/project.md) – core principles and design philosophy
- [Publisher Spec](doc/publisher.md) – publishing mechanism specification
- [TS-like-JS](doc/TS-like-JS.md) – how we achieve TypeScript safety in JavaScript

## Status

Format specification complete. Phase 2: Publisher Core.

## License

MIT

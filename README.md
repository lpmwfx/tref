# AIBlocks (TREF)

**Traceable Reference Format**

A JSON-based format for knowledge exchange where references are structural, not optional.

## What is TREF?

TREF is a **knowledge exchange format** – not a CMS, not an AI model, not a platform. It's a JSON format for creating self-contained units of knowledge that preserve:

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

## Browser Components

Two components enable TREF exchange between websites and AI chats.
See [src/wrapper/README.md](src/wrapper/README.md) for full design guide.

### TrefWrapper – Display and Share

```javascript
const wrapper = new TrefWrapper(block);
container.innerHTML = wrapper.toHTML();
wrapper.attachEvents(container.querySelector('.tref-wrapper'));
```

- ICON is the drag handle (only the icon, not the entire block)
- Actions appear on hover: "drag me" hint, copy, download
- Status feedback in the shortId badge

### TrefReceiver – Accept TREF Blocks

```javascript
const receiver = new TrefReceiver(element, {
  onReceive: wrapper => console.log('Got block:', wrapper.block),
  onError: err => console.error(err),
});
```

### Drag-and-Drop Flow

```
┌─────────────────┐                    ┌─────────────────┐
│   Site A        │                    │   Site B / Chat │
│                 │     drag TREF      │                 │
│  [TREF icon] ──────────────────────► │  [Drop Zone]    │
│   TrefWrapper   │                    │   TrefReceiver  │
└─────────────────┘                    └─────────────────┘
```

The entire block (content, refs, license, lineage) transfers with the drag.

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
  wrapper/
    wrapper.js        # TrefWrapper + TrefReceiver (browser components)
    wrapper.test.js   # Tests
  schemas/
    block.js          # Block schema with Zod
    reference.js      # Reference types (URL, archive, search, hash)
  publisher/
    publish.js        # Block publishing (ID generation)
    io.js             # File I/O operations
    registry.js       # Block registry
  browser.js          # Browser bundle entry point (window.TREF)
  cli/
    index.js          # CLI tool (tref publish, validate, etc.)
  mcp/
    server.js         # MCP server for Claude Code integration
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

**MVP Complete** – CLI, MCP server, and browser components ready.

- Format specification v1.0
- TrefWrapper + TrefReceiver for browser drag-and-drop
- CLI tool (`tref publish`, `tref validate`, `tref derive`)
- MCP server for Claude Code integration
- Live demo at [tref.lpmwfx.com](https://tref.lpmwfx.com)

## License

MIT

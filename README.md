# TREF

**Traceable Reference Format**

A JSON-based format for knowledge exchange where references are structural, not optional.

## What is TREF?

TREF is a **knowledge exchange format** – not a CMS, not an AI model, not a platform. It's a JSON format for creating self-contained units of knowledge that preserve:

- **Content** – the actual information
- **Metadata** – author, timestamps, source
- **License** – attribution requirements
- **References** – URLs, archived snippets, search prompts, hashes
- **Lineage** – parent/child relationships, version history

## Install

```bash
npm install tref-block
```

Or use CDN:
```html
<script type="module">
  import { TrefWrapper } from 'https://cdn.jsdelivr.net/npm/tref-block';
</script>
```

## Core Principles

1. **The Block is the Atom of Truth** – smallest meaningful unit of knowledge
2. **Reference Lineage** – modifications create new blocks, preserving history
3. **References Survive** – not just URLs, but archived snippets and search prompts
4. **AI-First, Human-Readable** – JSON format readable by both machines and humans
5. **Verifiability Over Authority** – trust through transparency, not central control
6. **Copy = Citation** – copying preserves origin, references, and license
7. **The Icon IS the Block** – no extra containers, just the draggable icon

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
npm run build         # build browser bundle
npm run dev           # start dev server (http://localhost:8080)
npm run check         # typecheck + lint + format
npm test              # run tests
```

## Architecture

**Single source, many outputs:**

```
src/wrapper/wrapper.js    ← Write code here
        │
    npm run build
        ▼
dist/tref-block.js        ← Built output (10kb)
        │
        ├──> CDN (jsdelivr/unpkg)
        ├──> npm install
        └──> demo/
```

## Development

This project uses **TypeScript-level safety in pure JavaScript**:

- JSDoc type annotations
- TypeScript CLI for type checking (no transpilation)
- ESLint with type-aware rules
- Zod for runtime validation
- Prettier for formatting

```bash
npm run build:browser # build browser bundle
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
    wrapper.js        # TrefWrapper + TrefReceiver (single source)
  cli/
    index.js          # CLI tool
  mcp/
    server.js         # MCP server for Claude Code
dist/
  tref-block.js       # Built browser bundle
demo/
  index.html          # Visual testing
doc/
  project.md          # Vision & architecture
  TrefBlockUIUX.md    # UI/UX specification
```

## Documentation

- [Project & Architecture](doc/project.md) – vision, principles, single-source architecture
- [UI/UX Specification](doc/TrefBlockUIUX.md) – complete UI/UX design guide

## Status

**MVP Complete** – Single-source architecture with browser bundle.

- TrefWrapper + TrefReceiver (drag-and-drop)
- Accessibility: ARIA, keyboard, focus-visible
- Mobile/touch support: tap-to-toggle, long-press
- Dropdown action menu with SVG icons
- CLI tool (`tref publish`, `tref validate`, `tref derive`)
- MCP server for Claude Code integration
- Live demo at [tref.lpmwfx.com](https://tref.lpmwfx.com)

## License

AGPL-3.0-or-later

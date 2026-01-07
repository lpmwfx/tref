---
title: TREF Developer Guide
author: TREF Documentation
---

# TREF Developer Guide

CLI commands, API reference, and integration patterns.

## Quick Start (CLI)

### Install

Download and install the TREF CLI tool.

```
curl -sSL https://tref.lpmwfx.com/install.sh | bash
```

### Create a block

Publish your first TREF block from the command line.

```
tref publish "The speed of light is 299,792,458 m/s"
```

### Add references

Include source URLs for verifiability.

```
tref publish "Fact here" --refs '[{"type":"url","url":"https://source.com"}]'
```

### Derive from existing

Create a new block based on an existing one, preserving lineage.

```
tref derive sha256:abc123... "Updated content with corrections"
```

## CLI Commands

### tref publish

Create a new TREF block.

```
tref publish "content"
tref publish -f file.md
echo "content" | tref publish --stdin
tref publish "content" --refs '[...]' --license CC-BY-4.0
```

### tref derive

Create a child block from a parent, preserving lineage.

```
tref derive <parent-id> "new content"
tref derive sha256:abc... "Updated" --refs '[{"type":"url","url":"..."}]'
```

### tref validate

Verify a block's integrity (ID matches content hash).

```
tref validate block.tref
tref validate published/ab/abc123...def.tref
```

### tref list / info / cat

Browse and read published blocks.

```
tref list                    # List all blocks
tref info sha256:abc...      # Show metadata
tref cat sha256:abc...       # Output content
tref cat sha256:abc... --format json
```

## JavaScript API (Browser)

### Include the script

```html
<script src="https://cdn.jsdelivr.net/npm/tref-block/dist/tref-block.js"></script>
```

### Create and display a block

```javascript
const block = await TREF.publish("My knowledge", {
  author: "Jane",
  refs: [{ type: "url", url: "https://source.com", title: "Source" }]
});

const wrapper = new TREF.TrefWrapper(block);
document.body.innerHTML = wrapper.toHTML();
wrapper.attachEvents(document.querySelector('.tref-wrapper'));
```

### Derive from existing

```javascript
const child = await TREF.derive(parentBlock, "New content based on parent");
```

### Validate integrity

```javascript
const isValid = await TREF.validate(block);
console.log(isValid ? "Block is authentic" : "Block has been tampered with");
```

### Drag and drop

TREF blocks are draggable by default. Create a receiver:

```javascript
const receiver = new TREF.TrefReceiver(dropZoneElement, {
  onReceive: (wrapper) => {
    console.log("Received block:", wrapper.block);
  }
});
```

## Claude Code MCP

Use TREF directly from Claude Code with the MCP server.

### Install

```
claude mcp add tref -- tref-mcp
```

### Available tools

- tref_publish - Create a new block
- tref_derive - Derive from parent
- tref_validate - Check block integrity
- tref_list - List all blocks
- tref_info - Get block metadata
- tref_cat - Read block content

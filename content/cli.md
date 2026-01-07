---
title: CLI Reference
author: TREF Documentation
---

# CLI Reference

Command-line tools for creating and managing TREF blocks.

## Quick Start

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

## Commands

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

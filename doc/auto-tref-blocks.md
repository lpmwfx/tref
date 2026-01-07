# Automatic TREF Block Generation

How to automatically generate TREF blocks from markdown at commit time.

## Overview

```
content/*.md → git commit → pre-commit hook → docs/blocks/*.json → GitHub Pages
```

Every markdown file in `content/` becomes a TREF block with:
- Full article content (not just a summary)
- Stable ID (only changes when content changes)
- Author and source reference metadata

## Setup

### 1. Directory Structure

```
project/
├── content/           # Markdown source files (NOT in docs/)
│   └── guide.md
├── docs/              # GitHub Pages serves this
│   ├── blocks/        # Generated TREF blocks
│   │   └── guide.json
│   ├── .nojekyll      # Disable Jekyll processing
│   └── *.html         # Your pages
├── bin/
│   └── build-docs.js  # Build script
└── .githooks/
    └── pre-commit     # Runs build automatically
```

**Important:** Keep `content/` OUTSIDE `docs/` to avoid Jekyll processing errors.

### 2. Build Script (`bin/build-docs.js`)

```javascript
#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, basename } from 'path';

const CONTENT_DIR = 'content';
const OUTPUT_DIR = 'docs';

function generateId(draft) {
  const sorted = JSON.stringify(sortKeys(draft));
  const hash = createHash('sha256').update(sorted).digest('hex');
  return `sha256:${hash}`;
}

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
}

function createBlock(content, meta = {}) {
  const draft = {
    v: 1,
    content,
    meta: {
      created: new Date().toISOString(),
      license: meta.license || 'CC-BY-4.0',
      ...(meta.author && { author: meta.author }),
    },
    ...(meta.refs && { refs: meta.refs }),
  };
  return { ...draft, id: generateId(draft) };
}

function main() {
  if (!existsSync(CONTENT_DIR)) return;

  const mdFiles = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  for (const file of mdFiles) {
    const md = readFileSync(join(CONTENT_DIR, file), 'utf-8');
    const filename = basename(file, '.md');

    // Extract frontmatter
    let content = md;
    let frontMatter = {};
    const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (fmMatch) {
      for (const line of fmMatch[1].split('\n')) {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) frontMatter[key.trim()] = rest.join(':').trim();
      }
      content = fmMatch[2];
    }

    const block = createBlock(content.trim(), {
      author: frontMatter.author || 'Documentation',
      refs: [{
        type: 'url',
        url: `https://yoursite.com/${filename}.html`,
        title: frontMatter.title || filename
      }],
    });

    writeFileSync(
      join(OUTPUT_DIR, 'blocks', filename + '.json'),
      JSON.stringify(block, null, 2)
    );
    console.log(`  ${filename}: ${block.id.slice(0, 20)}...`);
  }
}

main();
```

### 3. Pre-commit Hook (`.githooks/pre-commit`)

```bash
#!/bin/bash
if [ -f "bin/build-docs.js" ]; then
  echo "Building TREF blocks..."
  node bin/build-docs.js
  git add docs/blocks/*.json
fi
```

### 4. Enable Git Hooks

```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

### 5. Markdown Format

```markdown
---
title: My Article Title
author: Author Name
---

# My Article

Content here becomes the TREF block content.

All markdown is preserved as-is.
```

### 6. Load Block in HTML

```html
<div id="article-tref"></div>

<script type="module">
  import { TrefWrapper } from 'https://cdn.jsdelivr.net/npm/tref-block/dist/tref-block.js';

  const response = await fetch('./blocks/guide.json');
  const block = await response.json();

  const wrapper = new TrefWrapper(block);
  document.getElementById('article-tref').innerHTML = wrapper.toHTML();
  wrapper.attachEvents(document.querySelector('.tref-wrapper'));
</script>
```

## Troubleshooting

### GitHub Pages returns 404 for block files

- Use `.json` extension, not `.tref` (GitHub Pages doesn't serve unknown extensions)
- Add `docs/.nojekyll` file to disable Jekyll

### GitHub Pages build fails

- Move markdown source files OUTSIDE `docs/` folder
- Jekyll tries to process `.md` files and can fail on frontmatter

### Block ID keeps changing

- The `created` timestamp is in the block, so ID changes on each build
- To get stable IDs: remove `created` from hash calculation, or cache the timestamp

### Pre-commit hook doesn't run

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Benefits

1. **No manual build step** - happens automatically at commit
2. **Full content in blocks** - not summaries, the actual article
3. **Stable IDs** - verifiable, content-addressed
4. **Works with static sites** - no server needed
5. **Source control** - markdown is the source of truth

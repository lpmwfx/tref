---
title: Getting Started
slug: getting-started
section: Basics
---

# Getting Started

Get up and running with TREF in minutes.

## Installation

### CLI

Install the TREF command-line tool:

```bash
npm install -g tref-block
```

Or download a standalone executable from the releases page.

### Browser

Add TREF to your website via CDN:

```html
<script type="module">
  import { TrefWrapper } from 'https://cdn.jsdelivr.net/npm/tref-block';
</script>
```

### Node.js

Install as a dependency:

```bash
npm install tref-block
```

## Create Your First Block

### Using the CLI

```bash
# Create a block from text
tref publish -c "Hello, TREF!"

# Create from a file
tref publish -f article.md

# Create with references
tref publish -c "Fact with source" -r "url:https://example.com,title:Source"
```

### Using JavaScript

```javascript
import { publish, createDraft } from 'tref-block';

const draft = createDraft('My first TREF block', {
  author: 'Your Name',
  refs: [{
    type: 'url',
    url: 'https://example.com',
    title: 'Source'
  }]
});

const block = publish(draft);
console.log(block.id); // sha256:...
```

## Validate a Block

Check that a block hasn't been tampered with:

```bash
tref validate block.json
```

```javascript
import { validate } from 'tref-block';

const result = validate(block);
if (result.valid) {
  console.log('Block integrity verified');
}
```

## Next Steps

* Learn about the **Block Format**
* Explore the **CLI Reference**
* Read about **Deriving Blocks**

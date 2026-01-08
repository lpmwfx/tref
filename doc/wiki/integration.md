---
title: Integration Guide
slug: integration
section: Guides
---

# Integration Guide

How to correctly display TREF blocks with proper UI/UX.

## The Problem

TREF blocks are JSON data. To display them with the correct UI (icon, hover menu, drag-drop, validation), you need `wrapper.js`. Without it, you just have raw JSON.

## Required Steps

Every TREF integration needs three things:

1. **Import TrefWrapper** from the library
2. **Inject CSS** from `TrefWrapper.getStyles()`
3. **Attach events** after rendering HTML

Miss any step and the UI breaks.

## Correct Pattern

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. Empty style tag for CSS injection -->
  <style id="tref-styles"></style>
</head>
<body>
  <!-- Container for the block -->
  <div id="my-block"></div>

  <script type="module">
    import { TrefWrapper } from 'https://cdn.jsdelivr.net/npm/tref-block';

    // 2. Inject CSS (MUST be done before rendering)
    document.getElementById('tref-styles').textContent = TrefWrapper.getStyles();

    // Your TREF block data
    const block = {
      v: 1,
      id: 'sha256:abc123...',
      content: '# Hello World',
      meta: { created: '2026-01-08', license: 'CC-BY-4.0' }
    };

    // 3. Create wrapper, render HTML, attach events
    const wrapper = new TrefWrapper(block);
    const container = document.getElementById('my-block');
    container.innerHTML = wrapper.toHTML();
    wrapper.attachEvents(container.querySelector('.tref-wrapper'));
  </script>
</body>
</html>
```

## What Each Step Does

### Step 1: Style Tag

```html
<style id="tref-styles"></style>
```

An empty style element in `<head>`. CSS is injected here dynamically.

### Step 2: Inject CSS

```javascript
document.getElementById('tref-styles').textContent = TrefWrapper.getStyles();
```

`getStyles()` returns all CSS needed for:
- Icon appearance (purple-mint theme)
- Hover menu styling
- Action button states
- Validation indicators (red X for tampered)
- Dark mode support

**Without this**: Icon appears but menu is unstyled or invisible.

### Step 3: Attach Events

```javascript
wrapper.attachEvents(container.querySelector('.tref-wrapper'));
```

Binds all interactive behavior:
- Drag-and-drop on icon
- Click handlers on action buttons
- Touch support (tap, long-press)
- Keyboard navigation
- **Auto-validation** (checks SHA-256 hash)

**Without this**: Icon is static, no hover menu, no drag, no validation.

## Common Mistakes

### Mistake 1: Missing CSS

```javascript
// WRONG - no CSS injection
const wrapper = new TrefWrapper(block);
container.innerHTML = wrapper.toHTML();
wrapper.attachEvents(container.querySelector('.tref-wrapper'));
```

Result: Icon appears but hover menu is invisible or broken.

### Mistake 2: Missing attachEvents

```javascript
// WRONG - no event binding
document.getElementById('tref-styles').textContent = TrefWrapper.getStyles();
const wrapper = new TrefWrapper(block);
container.innerHTML = wrapper.toHTML();
// Forgot attachEvents!
```

Result: Icon looks correct but nothing happens on click/hover/drag.

### Mistake 3: Wrong Element for attachEvents

```javascript
// WRONG - attaching to container instead of .tref-wrapper
wrapper.attachEvents(container);
```

Result: Events don't work. Must attach to `.tref-wrapper` element.

### Mistake 4: Using CDN Without Building

```javascript
// May fail if version not published
import { TrefWrapper } from 'https://cdn.jsdelivr.net/npm/tref-block@0.3.0';
```

For local development, use relative path to built file:

```javascript
import { TrefWrapper } from './js/tref-block.js';
```

## Drop Zone Integration

If you also need to receive TREF blocks:

```javascript
import { TrefWrapper, TrefReceiver } from 'tref-block';

// Include both CSS
document.getElementById('tref-styles').textContent =
  TrefWrapper.getStyles() + TrefReceiver.getStyles();

// Create receiver
const receiver = new TrefReceiver(dropZoneElement, {
  onReceive: (wrapper) => {
    console.log('Received block:', wrapper.block);
  },
  onError: (err) => {
    console.error('Drop error:', err);
  }
});
```

## Build-Time Integration

For static site generators, the pattern is the same but in your build script:

```javascript
// build.js
import { TrefWrapper } from 'tref-block';

function generatePage(block) {
  return `<!DOCTYPE html>
<html>
<head>
  <style id="tref-styles"></style>
</head>
<body>
  <div id="block-container"></div>
  <script type="module">
    import { TrefWrapper } from '/js/tref-block.js';
    document.getElementById('tref-styles').textContent = TrefWrapper.getStyles();

    const block = ${JSON.stringify(block)};
    const wrapper = new TrefWrapper(block);
    document.getElementById('block-container').innerHTML = wrapper.toHTML();
    wrapper.attachEvents(document.querySelector('.tref-wrapper'));
  </script>
</body>
</html>`;
}
```

## Validation Indicator

When `attachEvents()` runs, it automatically validates the block's SHA-256 hash.

- **Valid**: Normal purple-mint icon
- **Invalid**: Red X overlay, "Modified content" warning

You can also validate manually:

```javascript
const result = await wrapper.validate();
if (!result.valid) {
  console.log('Content was modified!');
  console.log('Expected:', result.expected);
  console.log('Actual:', result.actual);
}
```

## Checklist

Before deploying TREF blocks, verify:

- [ ] `<style id="tref-styles"></style>` in `<head>`
- [ ] `TrefWrapper.getStyles()` injected into style tag
- [ ] `wrapper.toHTML()` renders the block
- [ ] `wrapper.attachEvents()` called on `.tref-wrapper` element
- [ ] Using correct import path (CDN or local build)
- [ ] Testing hover menu appears and works
- [ ] Testing drag-and-drop works
- [ ] Testing on mobile (tap toggles menu)

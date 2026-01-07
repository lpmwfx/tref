# TREF Block UI/UX

Documentation for `src/wrapper/wrapper.js` - the TREF block display and interaction system.

---

## Core Design Principle

**The icon IS the block. Nothing else.**

```
CORRECT:                    WRONG:
┌──────┐                    ┌──────────────────────┐
│ TREF │  ← Only this       │ TREF │ #a3f8b2c1     │
│ icon │                    │ icon │ "Article..."  │
└──────┘                    └──────────────────────┘
```

### Rules

| Rule | Reason |
|------|--------|
| No visible ID/serial number | The block is self-contained |
| No content preview | Content is inside the block, not beside it |
| No persistent labels | Hover reveals actions, nothing else |
| No wrapper chrome | Icon stands alone |

### What IS allowed

- **Hover menu** – action buttons appear on hover
- **Drag feedback** – cursor change, scale on hover
- **Drop zone** – receiver is separate component

### Why

The TREF block is a **portable knowledge atom**. Visual simplicity ensures:
- Drag-and-drop works anywhere
- No context-dependent UI
- Universal recognition
- Clean embedding in any layout

---

## Overview

The wrapper provides two main components:
1. **TrefWrapper** - Displays a TREF block with drag/copy/download actions
2. **TrefReceiver** - Drop zone for receiving TREF blocks

---

## TrefWrapper

### Visual Design

The icon stands ALONE. No space is reserved for the hover menu.

```
Default state:           On hover:
┌──────┐                 ┌──────┐
│ TREF │                 │ TREF │
└──────┘                 └──────┘
   ↑                        │
   Only the icon            ▼
                      ┌───────────┐
                      │ 📋 { } 💾 │  ← dropdown overlay
                      └───────────┘
```

### Elements

| Element | Purpose | Behavior |
|---------|---------|----------|
| Icon | Chain link SVG (purple-mint theme) | Drag handle - only draggable element |
| Actions | Dropdown menu | Hidden by default, appears as overlay on hover |

### Hover Menu (Dropdown)

The action menu is a **dropdown overlay** that:
- Appears BELOW the icon (not beside it)
- Has its own dark background (#1f2937)
- Floats above page content (z-index)
- Does NOT reserve space in the layout

### Icon (Drag Handle)

- Size: 32x32px
- Cursor: `grab` (→ `grabbing` when active)
- Hover: Scales to 110%
- The icon is the ONLY draggable element

### Action Buttons

Appear on hover over the wrapper:

| Button | Action | Feedback |
|--------|--------|----------|
| 📋 | Copy markdown content to clipboard | ✓ (1 sec) |
| { } | Copy full JSON block to clipboard | ✓ (1 sec) |
| 💾 | Download as `.tref` file | ✓ (1 sec) |

On error: Shows ✗ for 1 second.

### Drag Data

When dragged, the icon sets three MIME types:
1. `application/vnd.tref+json` (primary)
2. `application/json` (fallback)
3. `text/plain` (universal fallback)

---

## TrefReceiver

### Design Intent

The receiver is designed to match the TREF icon size (32x32px) for visual consistency. Multiple receivers can be added dynamically using a Plus icon.

**Optimal scenario:**
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ TREF │ │ TREF │ │ TREF │ │  +   │
│ icon │ │ icon │ │ drop │ │ add  │
└──────┘ └──────┘ └──────┘ └──────┘
   ▲         ▲         ▲        ▲
   │         │         │        └── Plus icon adds new receiver
   │         │         └── Empty receiver (same size as icon)
   │         └── Filled receiver with block
   └── Existing TREF block
```

### Visual Design (Current Implementation)

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                          │
│     Drop TREF here       │  ← Dashed border
│                          │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Compact Mode (Target)

For inline use, receiver should be 32x32px to match icon size:

```
┌──────┐
│  ○   │  ← 32x32px dashed box
└──────┘
```

### States

| State | Border | Background | Color |
|-------|--------|------------|-------|
| Default | Dashed mint (#5CCCCC) | Light gray (#f9fafb) | Gray |
| Active (dragover) | Purple (#8B5CF6) | Light purple (#f3e8ff) | Purple |
| Success | Green (#10B981) | Light green (#ecfdf5) | - |
| Error | Red (#ef4444) | Light red (#fef2f2) | - |
| Has block | Solid | White | - |

### Events

- `dragover` - Shows active state, sets `dropEffect: copy`
- `dragleave` - Returns to default state
- `drop` - Parses TREF data, calls `onReceive` or `onError`

---

## CSS Classes

### TrefWrapper
- `.tref-wrapper` - Container
- `.tref-icon` - Drag handle
- `.tref-actions` - Button container
- `.tref-action` - Individual button

### TrefReceiver
- `.tref-receiver` - Drop zone
- `.tref-receiver-active` - Drag hover state
- `.tref-receiver-success` - Valid drop (1 sec)
- `.tref-receiver-error` - Invalid drop (1 sec)
- `.tref-receiver-has-block` - Contains a block

---

## API

### TrefWrapper

```javascript
const wrapper = new TrefWrapper(block);

// Properties
wrapper.block       // Full block object
wrapper.id          // Block ID (sha256:...)
wrapper.shortId     // First 8 chars of hash
wrapper.content     // Markdown content

// Methods
wrapper.toJSON({ pretty: true })  // JSON string
wrapper.toBlob()                  // Blob for download
wrapper.toDataURL()               // Base64 data URL
wrapper.toObjectURL()             // Blob URL
wrapper.getFilename()             // {hash}.tref

// Clipboard
await wrapper.copyToClipboard()        // Copy JSON
await wrapper.copyContentToClipboard() // Copy content

// Rendering
wrapper.toHTML({ interactive: true })  // HTML string
wrapper.attachEvents(element)          // Bind handlers
TrefWrapper.getStyles()                // CSS string
```

### TrefReceiver

```javascript
const receiver = new TrefReceiver(element, {
  onReceive: (wrapper) => { /* handle valid block */ },
  onError: (error) => { /* handle error */ }
});

receiver.element         // DOM element
receiver.showBlock(wrapper)  // Display a block
receiver.clear()             // Reset to placeholder
TrefReceiver.getStyles()     // CSS string
```

### Helper Functions

```javascript
// Create wrapper from data
const wrapper = wrap(blockData);

// Parse from DataTransfer or string
const wrapper = unwrap(dataTransfer);  // or unwrap(jsonString)
```

---

## Theme

### Color Scheme

The icon uses a fixed purple-mint scheme that works in both light and dark contexts:

| Element | Color |
|---------|-------|
| Icon background | #2D1B4E (deep purple) |
| Icon accent | #5CCCCC (mint) |
| Active state | #8B5CF6 (violet) |

### Light / Dark / Custom Modes

UI elements (action buttons, receivers) adapt to context via CSS custom properties:

```css
:root {
  /* Light mode (default) */
  --tref-action-bg: #f3f4f6;
  --tref-action-bg-hover: #e5e7eb;
  --tref-action-text: #374151;
  --tref-receiver-bg: #f9fafb;
  --tref-receiver-border: #5CCCCC;
  --tref-receiver-text: #6b7280;
}

@media (prefers-color-scheme: dark) {
  :root {
    --tref-action-bg: #374151;
    --tref-action-bg-hover: #4b5563;
    --tref-action-text: #e5e7eb;
    --tref-receiver-bg: #1f2937;
    --tref-receiver-border: #5CCCCC;
    --tref-receiver-text: #9ca3af;
  }
}

/* Custom theme override */
.theme-custom {
  --tref-action-bg: /* your color */;
  --tref-action-bg-hover: /* your color */;
  /* etc. */
}
```

### Theme Variables Reference

| Variable | Purpose | Light | Dark |
|----------|---------|-------|------|
| `--tref-action-bg` | Action button background | #f3f4f6 | #374151 |
| `--tref-action-bg-hover` | Action button hover | #e5e7eb | #4b5563 |
| `--tref-action-text` | Action button text | #374151 | #e5e7eb |
| `--tref-receiver-bg` | Receiver background | #f9fafb | #1f2937 |
| `--tref-receiver-border` | Receiver border | #5CCCCC | #5CCCCC |
| `--tref-receiver-text` | Receiver placeholder | #6b7280 | #9ca3af |
| `--tref-success` | Success state | #10B981 | #10B981 |
| `--tref-error` | Error state | #ef4444 | #ef4444 |

### Icon Consistency

The TREF icon (#2D1B4E + #5CCCCC) is intentionally fixed - not themed. This ensures:
- Universal recognition across sites
- Works on both light and dark backgrounds
- Brand consistency

---

## Iconography

### Symbol: Chain Link

The TREF icon is a **chain link** representing:

- **Traceability** – references are linked, not lost
- **Connection** – knowledge connects to its sources
- **Integrity** – the chain is unbroken

### Design

- Square format (works in all contexts)
- Purple-mint theme (#2D1B4E background, #5CCCCC link)
- Rounded corners (rx=12)
- Minimal, recognizable at small sizes

### Icon Assets

All icons are square and can be chosen based on project needs and context.

### Available Formats

```
assets/
├── SVG/
│   └── tref-link-purple-mint-square.svg   (scalable, web)
├── PNG/
│   ├── tref-link-square-16x16.png         (tiny, toolbars)
│   ├── tref-link-square-32x32.png         (standard UI)
│   ├── tref-link-square-48x48.png         (medium)
│   ├── tref-link-square-64x64.png         (large UI)
│   ├── tref-link-square-128x128.png       (thumbnails)
│   ├── tref-link-square-256x256.png       (preview)
│   ├── tref-link-square-512x512.png       (high-res)
│   └── tref-link-transparent.png          (256px, no background)
└── favicon/
    ├── favicon.ico                        (browser tab)
    └── apple-touch-icon.png               (iOS/mobile)
```

### Usage Guidelines

| Context | Recommended |
|---------|-------------|
| Web component (wrapper.js) | SVG (embedded) |
| Toolbar / small UI | PNG 16x16 or 32x32 |
| Drop zone / receiver | PNG 32x32 or 48x48 |
| Documentation | PNG 64x64 or 128x128 |
| Website favicon | favicon.ico |
| Mobile bookmark | apple-touch-icon.png |
| Print / high-res | PNG 512x512 or SVG |

---

## File Format

- Extension: `.tref`
- MIME type: `application/vnd.tref+json`
- Filename: `{sha256-hash}.tref`

---

## Interaction Flows

### Flow 1: Drag Block to External Target

```
1. User hovers icon
   └─► Icon scales 110%, cursor: grab

2. User starts drag
   └─► cursor: grabbing
   └─► DataTransfer set (3 MIME types)

3. User drags over target
   └─► Target shows drop indicator (if compatible)

4. User drops
   └─► Target receives JSON
   └─► Block data transferred
```

### Flow 2: Copy Content

```
1. User hovers wrapper
   └─► Action buttons fade in (opacity 0→1, 150ms)

2. User clicks 📋
   └─► Content copied to clipboard
   └─► Button shows ✓ (1 sec)
   └─► Button returns to 📋
```

### Flow 3: Drop Block into Receiver

```
1. User drags block over receiver
   └─► Border: dashed mint → solid purple
   └─► Background: gray → light purple

2. User drops
   ├─► Valid: Border green, onReceive() called
   └─► Invalid: Border red, onError() called

3. Feedback clears after 1 sec
```

### Flow 4: Add New Receiver (Plus Icon)

```
1. User clicks [+] button
   └─► New 32x32 receiver appears

2. New receiver ready for drop
   └─► Same states as existing receivers
```

---

## Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus icon → focus action buttons |
| `Enter` / `Space` | Activate focused button |
| `Escape` | Cancel drag operation |

### Focus States

```css
.tref-icon:focus-visible {
  outline: 2px solid #5CCCCC;
  outline-offset: 2px;
}
.tref-action:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 1px;
}
```

### ARIA Labels

```html
<span class="tref-icon"
      role="button"
      aria-label="TREF block - drag to share"
      tabindex="0"
      draggable="true">

<button class="tref-action"
        aria-label="Copy content to clipboard">

<div class="tref-receiver"
     role="region"
     aria-label="Drop zone for TREF blocks"
     aria-dropeffect="copy">
```

### Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Copy success | "Content copied to clipboard" |
| Copy error | "Failed to copy" |
| Drop success | "TREF block received" |
| Drop error | "Invalid TREF data" |

---

## Mobile / Touch

### Touch Interactions

| Gesture | Action |
|---------|--------|
| Tap icon | Show action menu (toggle) |
| Long-press icon (500ms) | Start drag |
| Tap action button | Execute action |
| Tap outside | Hide action menu |

### Responsive Sizing

| Viewport | Icon Size | Action Buttons |
|----------|-----------|----------------|
| Desktop (>768px) | 32x32px | Hover to show |
| Tablet (481-768px) | 40x40px | Tap to toggle |
| Mobile (≤480px) | 48x48px | Tap to toggle |

### Touch-Friendly Hit Areas

```css
@media (pointer: coarse) {
  .tref-icon {
    min-width: 44px;
    min-height: 44px;
  }
  .tref-action {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
}
```

### Mobile Drop Zone

On touch devices, receiver expands slightly for easier targeting:

```css
@media (pointer: coarse) {
  .tref-receiver {
    min-width: 48px;
    min-height: 48px;
  }
}
```

---

## Error Handling

### Error Types

| Error | Cause | User Feedback |
|-------|-------|---------------|
| `Invalid TREF data` | Dropped data not valid JSON or missing required fields | Receiver border red (1 sec) |
| `Clipboard failed` | Browser denied clipboard access | Button shows ✗ (1 sec) |
| `No data` | DataTransfer empty on drop | Receiver border red (1 sec) |

### Validation Errors (on parse)

| Check | Error |
|-------|-------|
| `v !== 1` | "Invalid TREF version" |
| Missing `id` | "Missing block ID" |
| ID not `sha256:` | "Invalid block ID format" |
| Missing `content` | "Missing block content" |
| Missing `meta` | "Missing block metadata" |

### Error Recovery

```
User drops invalid data
    │
    ▼
Receiver shows red border (1 sec)
    │
    ▼
onError(error) callback fired
    │
    ▼
Receiver returns to default state
    │
    ▼
Ready for next drop attempt
```

### Graceful Degradation

| Feature | Fallback |
|---------|----------|
| Drag not supported | Show copy button only |
| Clipboard API missing | Show download button only |
| Touch without long-press | Tap toggles action menu |

---

## Implementation Guide

### Minimal HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <style id="tref-styles"></style>
</head>
<body>
  <!-- Block display -->
  <div id="my-block"></div>

  <!-- Drop zone -->
  <div id="drop-zone" data-placeholder="Drop TREF here"></div>

  <script type="module">
    import { TrefWrapper, TrefReceiver, wrap } from './wrapper.js';

    // Inject styles once
    document.getElementById('tref-styles').textContent =
      TrefWrapper.getStyles() + TrefReceiver.getStyles();

    // Display a block
    const block = { v: 1, id: 'sha256:abc123...', content: '# Hello', meta: { license: 'CC0', created: '2025-01-07' } };
    const wrapper = wrap(block);
    const el = document.getElementById('my-block');
    el.innerHTML = wrapper.toHTML();
    wrapper.attachEvents(el);

    // Setup receiver
    const receiver = new TrefReceiver(
      document.getElementById('drop-zone'),
      {
        onReceive: (w) => console.log('Received:', w.id),
        onError: (e) => console.error('Error:', e.message)
      }
    );
  </script>
</body>
</html>
```

### Multiple Blocks with Add Button

```html
<div id="block-list" style="display: flex; gap: 8px; align-items: center;">
  <!-- Blocks inserted here -->
  <button id="add-receiver" style="width: 32px; height: 32px;">+</button>
</div>

<script type="module">
  import { TrefWrapper, TrefReceiver, wrap } from './wrapper.js';

  const list = document.getElementById('block-list');
  const addBtn = document.getElementById('add-receiver');

  function addReceiver() {
    const zone = document.createElement('div');
    zone.style.cssText = 'width: 32px; height: 32px;';
    list.insertBefore(zone, addBtn);

    new TrefReceiver(zone, {
      onReceive: (wrapper) => {
        // Replace receiver with block display
        zone.innerHTML = wrapper.toHTML();
        zone.style.cssText = '';
        wrapper.attachEvents(zone);
      }
    });
  }

  addBtn.addEventListener('click', addReceiver);
  addReceiver(); // Start with one
</script>
```

### Embedding in Article

```html
<article>
  <h1>My Article</h1>
  <p>Content here...</p>

  <!-- TREF block at end of article -->
  <footer class="article-tref">
    <div id="article-block"></div>
  </footer>
</article>

<style>
  .article-tref {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
</style>
```

### Complete CSS (Copy-Paste Ready)

```css
/* TrefWrapper */
.tref-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
}
.tref-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  cursor: grab;
  transition: transform 0.15s;
}
.tref-icon:hover { transform: scale(1.1); }
.tref-icon:active { cursor: grabbing; }
.tref-icon:focus-visible {
  outline: 2px solid #5CCCCC;
  outline-offset: 2px;
}
.tref-icon svg { width: 100%; height: 100%; }
.tref-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.tref-wrapper:hover .tref-actions { opacity: 1; }
.tref-action {
  background: #f3f4f6;
  border: none;
  outline: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #374151;
  transition: background 0.15s;
}
.tref-action:hover { background: #e5e7eb; }
.tref-action:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 1px;
}

/* TrefReceiver */
.tref-receiver {
  border: 2px dashed #5CCCCC;
  border-radius: 8px;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: #f9fafb;
  transition: all 0.2s;
}
.tref-receiver-active {
  border-color: #8B5CF6;
  background: #f3e8ff;
  color: #8B5CF6;
}
.tref-receiver-success {
  border-color: #10B981;
  background: #ecfdf5;
}
.tref-receiver-error {
  border-color: #ef4444;
  background: #fef2f2;
}
.tref-receiver-has-block {
  border-style: solid;
  background: white;
}

/* Compact receiver (32x32) */
.tref-receiver-compact {
  width: 32px;
  height: 32px;
  min-height: 32px;
  padding: 0;
  border-radius: 4px;
}

/* Touch devices */
@media (pointer: coarse) {
  .tref-icon { min-width: 44px; min-height: 44px; }
  .tref-action { min-width: 44px; min-height: 44px; padding: 10px; }
  .tref-receiver-compact { width: 48px; height: 48px; min-height: 48px; }
}
```

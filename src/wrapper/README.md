# TREF Wrapper Design Guide

## Overview

The wrapper is how TREF blocks are displayed and interacted with in browsers.
There are two components:

1. **TrefWrapper** - Displays a single TREF block
2. **TrefReceiver** - Drop zone for receiving TREF blocks

## TrefWrapper Design

### Visual Structure

```
┌─────────────────────────────────────────┐
│ [ICON] abc123f4  2024-01-06  [actions]  │  ← header
├─────────────────────────────────────────┤
│ Content preview text goes here...       │  ← content
│                                         │
├─────────────────────────────────────────┤
│ Refs: Wikipedia, NASA                   │  ← refs (optional)
└─────────────────────────────────────────┘
```

### Interaction Rules

1. **ICON is the drag handle**
   - Only the TREF icon (top-left) is draggable
   - NOT the entire block
   - Cursor: grab → grabbing when dragging
   - Hover: scale(1.1) to indicate interactivity

2. **Actions appear on hover**
   - Hidden by default (opacity: 0)
   - Fade in when hovering the wrapper
   - Located at top-right of header
   - Contains:
     a. "drag me" hint text (subtle gray)
     b. Copy icon button (copies JSON)
     c. Download icon button (downloads .tref file)

3. **Status feedback**
   - The shortId badge shows feedback: "Copied!", "Saved!", "Error"
   - Reverts to original after 1.5s

### CSS Classes

```css
.tref-wrapper      /* Main container */
.tref-header       /* Header row with icon, id, meta, actions */
.tref-icon         /* Draggable TREF icon */
.tref-id           /* Short hash badge */
.tref-meta         /* Date */
.tref-actions      /* Action buttons container (hidden until hover) */
.tref-hint         /* "drag me" text */
.tref-btn          /* Action button (copy, download) */
.tref-content      /* Content preview */
.tref-refs         /* Reference links */
```

### Color Palette (Purple-Mint Theme)

- Purple: #8B5CF6
- Mint: #5CCCCC
- Dark Purple: #2D1B4E
- Gray-100: #f1f5f9
- Gray-200: #e5e7eb
- Gray-500: #6b7280
- Gray-700: #374151

## TrefReceiver Design

### Visual Structure

```
┌───────────────────────────────────────┐
│                                       │
│       Drop a TREF block here          │  ← placeholder text
│                                       │
└───────────────────────────────────────┘
```

When a block is dropped:

```
┌───────────────────────────────────────┐
│ [Rendered TrefWrapper appears here]   │
└───────────────────────────────────────┘
```

### CSS Classes

```css
.tref-receiver         /* Drop zone container */
.tref-receiver-active  /* When dragging over */
.tref-receiver-success /* Flash green on valid drop */
.tref-receiver-error   /* Flash red on invalid drop */
.tref-receiver-has-block /* Contains a dropped block */
```

### States

1. **Empty** - Dashed mint border, gray placeholder text
2. **Drag over** - Purple border, light purple background
3. **Success** - Green flash (1s)
4. **Error** - Red flash (1s)
5. **Has block** - Solid border, white background, shows TrefWrapper

## Usage

```javascript
// Create and display a wrapper
const wrapper = new TrefWrapper(block);
container.innerHTML = wrapper.toHTML();
wrapper.attachEvents(container.querySelector('.tref-wrapper'));

// Create a receiver
const receiver = new TrefReceiver(element, {
  onReceive: wrapper => console.log('Got block:', wrapper.block),
  onError: err => console.error(err),
});
```

## Files

- wrapper.js - TrefWrapper and TrefReceiver classes
- wrapper.test.js - Tests
- README - This file

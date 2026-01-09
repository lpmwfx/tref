---
title: UI/UX Design
slug: ui-ux
---

# TREF Block UI/UX

How TREF blocks look and behave in the browser.

## Core Principle

**The icon IS the block.** No visible ID, no content preview, no chrome. Just the chain link icon.

```
CORRECT:         WRONG:
┌──────┐        ┌────────────────┐
│ TREF │        │ TREF │ #a3f8.. │
└──────┘        └────────────────┘
```

## TrefWrapper (Sender)

The wrapper displays a TREF block with drag/copy/download actions.

### Icon
* Size: 32×32px
* Draggable (cursor changes to grab/grabbing)
* Scales to 110% on hover

### Hover Menu

Actions appear below the icon on hover:

| Button | Action |
|--------|--------|
| Copy | Copy content to clipboard |
| JSON | Copy full block as JSON |
| Download | Save as .tref file |
| History | Show version history (if available) |

### Smart Positioning

The menu adapts to screen boundaries:

* **Default**: Centered below icon
* **Near left edge**: Aligns to left
* **Near right edge**: Aligns to right
* **Near bottom**: Appears above icon

This prevents the menu from being cut off at screen edges.

### Invalid Block

When SHA-256 validation fails:
* Red X overlay on icon
* "Modified content" warning text

## TrefReceiver (Drop Zone)

Receives TREF blocks via drag-and-drop or clipboard paste.

### States

| State | Appearance |
|-------|------------|
| Default | Dashed mint border, gray background |
| Dragover | Purple border, light purple background |
| Success | Green border (1 sec) |
| Error | Red border (1 sec) |
| Has block | Solid border, white background |

### Compact Mode

For inline use, receivers can be 32×32px to match icon size.

## Touch / Mobile

### Gestures

| Gesture | Action |
|---------|--------|
| Tap icon | Toggle menu |
| Long-press (300ms) | Copy to clipboard |
| Tap receiver | "Tap to paste" state |
| Tap receiver again | Paste from clipboard |

Touch devices get larger hit areas (minimum 44×44px).

## Theme

### Icon Colors (Fixed)
* Background: #2D1B4E (deep purple)
* Accent: #5CCCCC (mint)

The icon color is intentionally not themed for universal recognition.

### UI Elements

CSS variables control theming:
* `--tref-menu-bg` / `--tref-menu-text`
* `--tref-receiver-bg` / `--tref-accent`
* Automatic light/dark mode support

## Accessibility

* Tab navigation through interactive elements
* Enter/Space to activate buttons
* ARIA labels for screen readers
* Visible focus indicators

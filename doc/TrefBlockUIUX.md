# TREF Block UI/UX Specification

UI/UX design for TREF block display and interaction.

---

## Core Principle

**The icon IS the block. Nothing else.**

```
CORRECT:                    WRONG:
┌──────┐                    ┌──────────────────────┐
│ TREF │  ← Only this       │ TREF │ #a3f8b2c1     │
│ icon │                    │ icon │ "Article..."  │
└──────┘                    └──────────────────────┘
```

| Rule | Reason |
|------|--------|
| No visible ID | Block is self-contained |
| No content preview | Content is inside, not beside |
| No persistent labels | Hover reveals actions |
| No wrapper chrome | Icon stands alone |

---

## TrefWrapper (Sender)

### Visual States

```
Default:                 On hover:
┌──────┐                 ┌──────┐
│ TREF │                 │ TREF │ (scale 110%)
└──────┘                 └──────┘
                            │
                            ▼
                      ┌───────────┐
                      │ 📋 {} 💾 🔄│  ← dropdown
                      └───────────┘
```

### Icon
- Size: 32×32px
- Cursor: `grab` → `grabbing` when dragging
- Hover: Scale 110%
- Only draggable element

### Hover Menu (Actions)
| Button | Action |
|--------|--------|
| 📋 | Copy content |
| {} | Copy JSON |
| 💾 | Download .tref |
| 🔄 | Version history (if available) |

### Smart Menu Positioning

Menu adapts to viewport boundaries:

```
Near left edge:          Centered (default):       Near right edge:
┌──────┐                    ┌──────┐                    ┌──────┐
│ TREF │                    │ TREF │                    │ TREF │
└──────┘                    └──────┘                    └──────┘
│                              │                              │
▼                              ▼                              ▼
┌─────────┐              ┌─────────┐              ┌─────────┐
│ menu    │              │  menu   │              │    menu │
└─────────┘              └─────────┘              └─────────┘
(left-aligned)           (centered)              (right-aligned)

Near bottom: Menu appears ABOVE icon instead of below.
```

### Invalid Block State
- Red X overlay on icon
- "Modified content" warning text
- Triggered when SHA-256 validation fails

---

## TrefReceiver (Drop Zone)

### Visual States

| State | Border | Background |
|-------|--------|------------|
| Default | Dashed mint | Light gray |
| Dragover | Solid purple | Light purple |
| Success | Solid green | Light green |
| Error | Solid red | Light red |
| Has block | Solid | White |

### Compact Mode (32×32px)
For inline use, matches icon size:
```
┌──────┐ ┌──────┐ ┌──────┐
│ TREF │ │ drop │ │  +   │
└──────┘ └──────┘ └──────┘
```

---

## Touch / Mobile

### Touch Interactions

| Gesture | Action |
|---------|--------|
| Tap icon | Toggle menu |
| Long-press (300ms) | Copy to clipboard + "Copied ✓" |
| Tap receiver | "Tap to paste" state |
| Tap receiver again | Paste from clipboard |

### Touch-Friendly Sizing
- Minimum touch target: 44×44px
- Icon scales up on `pointer: coarse` devices

---

## Color Theme

Icon uses fixed purple-mint scheme (not themed):
- Background: #2D1B4E (deep purple)
- Accent: #5CCCCC (mint)

UI elements adapt via CSS variables:
- `--tref-menu-bg`, `--tref-menu-text`
- `--tref-receiver-bg`, `--tref-accent`
- Automatic light/dark mode support

---

## Accessibility

- ARIA labels on all interactive elements
- Keyboard: Tab navigation, Enter/Space to activate
- Focus-visible outlines
- Screen reader announcements for actions

---

## Iconography

The chain link symbol represents:
- **Traceability** – references linked
- **Connection** – knowledge to sources
- **Integrity** – unbroken chain

Square format, works at all sizes, universal recognition.

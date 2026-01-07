---
title: JavaScript API
author: TREF Documentation
---

# JavaScript API

Browser library for creating and interacting with TREF blocks.

## Include the script

```html
<script src="https://cdn.jsdelivr.net/npm/tref-block/dist/tref-block.js"></script>
```

Or install from npm:

```
npm install tref-block
```

## Create and display a block

```javascript
const block = await TREF.publish("My knowledge", {
  author: "Jane",
  refs: [{ type: "url", url: "https://source.com", title: "Source" }]
});

const wrapper = new TREF.TrefWrapper(block);
document.body.innerHTML = wrapper.toHTML();
wrapper.attachEvents(document.querySelector('.tref-wrapper'));
```

## Derive from existing

Create a child block that links back to its parent, preserving lineage.

```javascript
const child = await TREF.derive(parentBlock, "New content based on parent");
```

## Validate integrity

Verify that a block's ID matches its content hash (tamper detection).

```javascript
const isValid = await TREF.validate(block);
console.log(isValid ? "Block is authentic" : "Block has been tampered with");
```

## Drag and drop

TREF blocks are draggable by default. Create a receiver:

```javascript
const receiver = new TREF.TrefReceiver(dropZoneElement, {
  onReceive: (wrapper) => {
    console.log("Received block:", wrapper.block);
  }
});
```

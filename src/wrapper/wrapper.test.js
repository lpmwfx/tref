/**
 * @fileoverview Tests for TREF wrapper
 */

/* global atob */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TrefWrapper,
  TrefReceiver,
  wrap,
  unwrap,
  TREF_ICON_SVG,
  TREF_ICON_DATA_URL,
  TREF_MIME_TYPE,
} from './wrapper.js';
import { publish } from '../publisher/publish.js';
import { createDraft } from '../schemas/block.js';

describe('TrefWrapper', () => {
  it('wraps a valid block', () => {
    const block = publish(createDraft('Test content'));
    const wrapper = new TrefWrapper(block);

    assert.equal(wrapper.id, block.id);
    assert.equal(wrapper.content, block.content);
  });

  it('throws on invalid block', () => {
    assert.throws(() => {
      new TrefWrapper(/** @type {any} */ ({ v: 1, content: 'test' }));
    }, /Invalid block/);
  });

  it('provides block getter', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    assert.deepEqual(wrapper.block, block);
  });

  it('provides shortId', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    assert.equal(wrapper.shortId.length, 8);
    assert.ok(block.id.includes(wrapper.shortId));
  });
});

describe('toJSON', () => {
  it('serializes to compact JSON by default', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const json = wrapper.toJSON();

    assert.ok(!json.includes('\n'));
    assert.ok(json.includes(block.id));
  });

  it('serializes to pretty JSON when requested', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const json = wrapper.toJSON({ pretty: true });

    assert.ok(json.includes('\n'));
  });

  it('produces valid JSON', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const json = wrapper.toJSON();
    const raw = /** @type {unknown} */ (JSON.parse(json));
    const parsed = /** @type {{ id: string }} */ (raw);

    assert.equal(parsed.id, block.id);
  });
});

describe('getFilename', () => {
  it('returns hash with .tref extension', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const filename = wrapper.getFilename();

    assert.ok(filename.endsWith('.tref'));
    assert.ok(!filename.includes('sha256:'));
    assert.equal(filename.length, 64 + 5); // 64 hex + .tref
  });
});

describe('toDataURL', () => {
  it('returns data URL with correct MIME type', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const url = wrapper.toDataURL();

    assert.ok(url.startsWith('data:'));
    assert.ok(url.includes(TREF_MIME_TYPE));
    assert.ok(url.includes('base64'));
  });

  it('encodes block data correctly', () => {
    const block = publish(createDraft('Test content'));
    const wrapper = new TrefWrapper(block);

    const url = wrapper.toDataURL();
    const base64 = url.split('base64,')[1];
    const decoded = decodeURIComponent(escape(atob(base64)));

    assert.ok(decoded.includes(block.id));
    assert.ok(decoded.includes('Test content'));
  });
});

describe('getDragData', () => {
  it('returns array of type/data pairs', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const dragData = wrapper.getDragData();

    assert.ok(Array.isArray(dragData));
    assert.equal(dragData.length, 3);
  });

  it('includes TREF MIME type', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const dragData = wrapper.getDragData();
    const trefData = dragData.find(d => d.type === TREF_MIME_TYPE);

    assert.ok(trefData);
    assert.ok(trefData.data.includes(block.id));
  });

  it('includes application/json', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const dragData = wrapper.getDragData();
    const jsonData = dragData.find(d => d.type === 'application/json');

    assert.ok(jsonData);
  });

  it('includes text/plain with full JSON', () => {
    const block = publish(createDraft('My content'));
    const wrapper = new TrefWrapper(block);

    const dragData = wrapper.getDragData();
    const textData = dragData.find(d => d.type === 'text/plain');

    assert.ok(textData);
    assert.equal(textData.data, wrapper.toJSON()); // Same as .tref file
  });
});

describe('toHTML', () => {
  it('generates HTML with wrapper class', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML();

    assert.ok(html.includes('class="tref-wrapper"'));
    assert.ok(html.includes(`data-tref-id="${block.id}"`));
  });

  it('includes icon by default', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML();

    assert.ok(html.includes('class="tref-icon"'));
    assert.ok(html.includes('<svg'));
  });

  it('excludes icon when requested', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML({ includeIcon: false });

    assert.ok(!html.includes('class="tref-icon"'));
  });

  it('includes content preview by default', () => {
    const block = publish(createDraft('My test content'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML();

    assert.ok(html.includes('class="tref-content"'));
    assert.ok(html.includes('My test content'));
  });

  it('truncates long content', () => {
    const longContent = 'A'.repeat(300);
    const block = publish(createDraft(longContent));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML({ maxContentLength: 100 });

    assert.ok(html.includes('...'));
    assert.ok(!html.includes('A'.repeat(300)));
  });

  it('escapes HTML in content', () => {
    const block = publish(createDraft('<script>alert("xss")</script>'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML();

    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  it('includes short ID', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML();

    assert.ok(html.includes(wrapper.shortId));
  });

  it('includes date from meta', () => {
    const block = publish(createDraft('Test'));
    const wrapper = new TrefWrapper(block);

    const html = wrapper.toHTML();
    const date = block.meta.created.split('T')[0];

    assert.ok(html.includes(date));
  });
});

describe('getStyles', () => {
  it('returns CSS string', () => {
    const styles = TrefWrapper.getStyles();

    assert.ok(typeof styles === 'string');
    assert.ok(styles.includes('.tref-wrapper'));
    assert.ok(styles.includes('.tref-icon'));
    assert.ok(styles.includes('.tref-content'));
  });
});

describe('wrap', () => {
  it('creates wrapper from valid data', () => {
    const block = publish(createDraft('Test'));
    const wrapper = wrap(block);

    assert.ok(wrapper instanceof TrefWrapper);
    assert.equal(wrapper.id, block.id);
  });

  it('throws on invalid data', () => {
    assert.throws(() => {
      wrap({ v: 1, content: 'no id' });
    });
  });
});

describe('unwrap', () => {
  it('parses JSON string to wrapper', () => {
    const block = publish(createDraft('Test'));
    const json = JSON.stringify(block);

    const wrapper = unwrap(json);

    assert.ok(wrapper instanceof TrefWrapper);
    assert.equal(wrapper?.id, block.id);
  });

  it('returns null for invalid JSON', () => {
    const wrapper = unwrap('not json');

    assert.equal(wrapper, null);
  });

  it('returns null for invalid block data', () => {
    const wrapper = unwrap('{"foo": "bar"}');

    assert.equal(wrapper, null);
  });

  it('returns null for empty string', () => {
    const wrapper = unwrap('');

    assert.equal(wrapper, null);
  });
});

describe('TREF_ICON_SVG', () => {
  it('is valid SVG', () => {
    assert.ok(TREF_ICON_SVG.startsWith('<svg'));
    assert.ok(TREF_ICON_SVG.includes('</svg>'));
  });

  it('includes brand colors', () => {
    assert.ok(TREF_ICON_SVG.includes('#2D1B4E')); // Dark purple
    assert.ok(TREF_ICON_SVG.includes('#5CCCCC')); // Mint/teal
  });
});

describe('TREF_ICON_DATA_URL', () => {
  it('is valid data URL', () => {
    assert.ok(TREF_ICON_DATA_URL.startsWith('data:image/svg+xml,'));
  });

  it('is URL encoded', () => {
    assert.ok(TREF_ICON_DATA_URL.includes('%3Csvg'));
  });
});

describe('TREF_MIME_TYPE', () => {
  it('is vendor MIME type', () => {
    assert.ok(TREF_MIME_TYPE.startsWith('application/vnd.'));
    assert.ok(TREF_MIME_TYPE.includes('tref'));
  });
});

describe('TrefReceiver', () => {
  it('has getStyles static method', () => {
    const styles = TrefReceiver.getStyles();
    assert.ok(typeof styles === 'string');
    assert.ok(styles.includes('.tref-receiver'));
  });

  it('styles include all states', () => {
    const styles = TrefReceiver.getStyles();
    assert.ok(styles.includes('.tref-receiver-active'));
    assert.ok(styles.includes('.tref-receiver-success'));
    assert.ok(styles.includes('.tref-receiver-error'));
    assert.ok(styles.includes('.tref-receiver-has-block'));
  });

  it('styles use brand colors', () => {
    const styles = TrefReceiver.getStyles();
    assert.ok(styles.includes('#5CCCCC')); // Mint border
    assert.ok(styles.includes('#8B5CF6')); // Purple active
    assert.ok(styles.includes('#10B981')); // Green success
  });
});

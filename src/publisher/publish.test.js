/**
 * @fileoverview Tests for publishing functions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { publish, derive, validate } from './publish.js';
import { createDraft } from '../schemas/block.js';
import { urlRef } from '../schemas/reference.js';

describe('publish', () => {
  it('adds ID to draft block', () => {
    const draft = createDraft('# Test\n\nContent here.');
    const block = publish(draft);

    assert.ok(block.id);
    assert.match(block.id, /^sha256:[a-f0-9]{64}$/);
  });

  it('preserves all draft fields', () => {
    const draft = createDraft('# Test', {
      author: 'Test Author',
      refs: [urlRef('https://example.com', 'Example')],
    });
    const block = publish(draft);

    assert.equal(block.content, '# Test');
    assert.equal(block.meta.author, 'Test Author');
    assert.equal(block.refs.length, 1);
    assert.equal(block.refs[0].type, 'url');
  });

  it('produces deterministic IDs', () => {
    const draft1 = {
      v: /** @type {1} */ (1),
      content: '# Test',
      meta: {
        created: '2025-01-06T12:00:00Z',
        license: 'AIBlocks-1.0',
      },
      refs: [],
    };
    const draft2 = { ...draft1 };

    const block1 = publish(draft1);
    const block2 = publish(draft2);

    assert.equal(block1.id, block2.id);
  });

  it('throws on invalid draft', () => {
    assert.throws(() => {
      publish({ v: 1, content: '' }); // empty content
    });
  });

  it('returns valid AIBlock', () => {
    const draft = createDraft('Test content');
    const block = publish(draft);

    // Should have all required fields
    assert.equal(block.v, 1);
    assert.ok(block.id);
    assert.ok(block.content);
    assert.ok(block.meta);
    assert.ok(block.meta.created);
    assert.ok(block.meta.license);
  });
});

describe('derive', () => {
  it('creates new block with parent reference', () => {
    const original = publish(createDraft('Original content'));
    const derived = derive(original, 'Derived content');

    assert.equal(derived.parent, original.id);
    assert.equal(derived.content, 'Derived content');
  });

  it('generates new ID for derived block', () => {
    const original = publish(createDraft('Original'));
    const derived = derive(original, 'Different content');

    assert.notEqual(derived.id, original.id);
  });

  it('preserves refs from source', () => {
    const ref = urlRef('https://example.com', 'Example');
    const original = publish(
      createDraft('Original', {
        refs: [ref],
      })
    );
    const derived = derive(original, 'Derived');

    assert.equal(derived.refs.length, 1);
    assert.equal(derived.refs[0].url, 'https://example.com');
  });

  it('adds additional refs', () => {
    const original = publish(
      createDraft('Original', {
        refs: [urlRef('https://a.com', 'A')],
      })
    );
    const derived = derive(original, 'Derived', {
      additionalRefs: [urlRef('https://b.com', 'B')],
    });

    assert.equal(derived.refs.length, 2);
  });

  it('allows author override', () => {
    const original = publish(
      createDraft('Original', {
        author: 'Author A',
      })
    );
    const derived = derive(original, 'Derived', {
      author: 'Author B',
    });

    assert.equal(derived.meta.author, 'Author B');
  });

  it('sets new created timestamp', () => {
    const original = publish({
      v: /** @type {1} */ (1),
      content: 'Original',
      meta: {
        created: '2020-01-01T00:00:00Z', // Old timestamp
        license: 'AIBlocks-1.0',
      },
      refs: [],
    });
    const derived = derive(original, 'Derived');

    // Derived should have a newer timestamp
    assert.notEqual(derived.meta.created, '2020-01-01T00:00:00Z');
    assert.ok(new Date(derived.meta.created) > new Date('2020-01-01T00:00:00Z'));
  });

  it('creates valid block that passes validation', () => {
    const original = publish(createDraft('Original'));
    const derived = derive(original, 'Derived');

    const result = validate(derived);
    assert.equal(result.valid, true);
  });
});

describe('validate', () => {
  it('returns valid for correct block', () => {
    const block = publish(createDraft('Test content'));
    const result = validate(block);

    assert.equal(result.valid, true);
    assert.equal(result.error, undefined);
  });

  it('returns invalid for tampered content', () => {
    const block = publish(createDraft('Original content'));
    const tampered = { ...block, content: 'Tampered content' };

    const result = validate(tampered);

    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('ID does not match'));
  });

  it('returns invalid for tampered ID', () => {
    const block = publish(createDraft('Test'));
    const tampered = {
      ...block,
      id: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    };

    const result = validate(tampered);

    assert.equal(result.valid, false);
  });

  it('returns invalid for missing fields', () => {
    const result = validate({ v: 1, content: 'test' });

    assert.equal(result.valid, false);
    assert.ok(result.error?.includes('Invalid block structure'));
  });

  it('returns invalid for wrong version', () => {
    const block = publish(createDraft('Test'));
    const tampered = { ...block, v: 2 };

    const result = validate(tampered);

    assert.equal(result.valid, false);
  });

  it('returns invalid for non-object', () => {
    const result = validate('not a block');

    assert.equal(result.valid, false);
  });

  it('returns invalid for null', () => {
    const result = validate(null);

    assert.equal(result.valid, false);
  });
});

describe('publish → derive → validate chain', () => {
  it('full workflow produces valid blocks', () => {
    // Create original
    const original = publish(
      createDraft('# Original Article\n\nThis is the original.', {
        author: 'Alice',
        refs: [urlRef('https://source.com', 'Source')],
      })
    );

    // Derive from original
    const derived = derive(original, "# Summary\n\nBased on Alice's work.", {
      author: 'Bob',
      additionalRefs: [urlRef('https://bob.com', "Bob's Site")],
    });

    // Validate both
    assert.equal(validate(original).valid, true);
    assert.equal(validate(derived).valid, true);

    // Check lineage
    assert.equal(derived.parent, original.id);
    assert.equal(derived.refs.length, 2);
  });
});

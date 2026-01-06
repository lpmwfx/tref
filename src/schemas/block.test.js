import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseBlock, safeParseBlock, isValidBlock, createDraft } from './block.js';
import { urlRef, archiveRef, searchRef, hashRef } from './reference.js';

// Valid block ID for testing
const validId = 'sha256:' + 'a'.repeat(64);
const validParentId = 'sha256:' + 'b'.repeat(64);

describe('AIBlock Schema', () => {
  describe('parseBlock', () => {
    it('parses a minimal valid block', () => {
      const block = parseBlock({
        v: 1,
        id: validId,
        content: '# Hello\n\nWorld',
        meta: {
          created: '2025-01-06T12:00:00Z',
          license: 'AIBlocks-1.0',
        },
      });

      assert.strictEqual(block.v, 1);
      assert.strictEqual(block.id, validId);
      assert.strictEqual(block.content, '# Hello\n\nWorld');
      assert.strictEqual(block.meta.license, 'AIBlocks-1.0');
    });

    it('parses a full block with all fields', () => {
      const block = parseBlock({
        v: 1,
        id: validId,
        content: '# Full Article\n\nContent here...',
        meta: {
          author: 'Test Author',
          created: '2025-01-06T12:00:00Z',
          modified: '2025-01-06T14:00:00Z',
          license: 'AIBlocks-1.0',
          lang: 'en',
        },
        origin: {
          url: 'https://example.com/article',
          title: 'Full Article',
        },
        refs: [{ type: 'url', url: 'https://source.com' }],
        parent: validParentId,
      });

      assert.strictEqual(block.meta.author, 'Test Author');
      assert.strictEqual(block.origin?.url, 'https://example.com/article');
      assert.strictEqual(block.refs.length, 1);
      assert.strictEqual(block.parent, validParentId);
    });

    it('throws on invalid version', () => {
      assert.throws(() => {
        parseBlock({
          v: 2,
          id: validId,
          content: 'Test',
          meta: { created: '2025-01-06T12:00:00Z' },
        });
      });
    });

    it('throws on invalid ID format', () => {
      assert.throws(() => {
        parseBlock({
          v: 1,
          id: 'invalid-id',
          content: 'Test',
          meta: { created: '2025-01-06T12:00:00Z' },
        });
      });
    });

    it('throws on empty content', () => {
      assert.throws(() => {
        parseBlock({
          v: 1,
          id: validId,
          content: '',
          meta: { created: '2025-01-06T12:00:00Z' },
        });
      });
    });
  });

  describe('safeParseBlock', () => {
    it('returns success for valid block', () => {
      const result = safeParseBlock({
        v: 1,
        id: validId,
        content: '# Test',
        meta: { created: '2025-01-06T12:00:00Z' },
      });

      assert.strictEqual(result.success, true);
    });

    it('returns error for invalid block', () => {
      const result = safeParseBlock({ invalid: 'data' });

      assert.strictEqual(result.success, false);
    });
  });

  describe('isValidBlock', () => {
    it('returns true for valid block', () => {
      assert.strictEqual(
        isValidBlock({
          v: 1,
          id: validId,
          content: '# Test',
          meta: { created: '2025-01-06T12:00:00Z' },
        }),
        true
      );
    });

    it('returns false for invalid block', () => {
      assert.strictEqual(isValidBlock({ invalid: 'data' }), false);
    });
  });

  describe('createDraft', () => {
    it('creates a draft block without ID', () => {
      const draft = createDraft('# My Article\n\nContent...');

      assert.strictEqual(draft.v, 1);
      assert.strictEqual(draft.content, '# My Article\n\nContent...');
      assert.strictEqual(draft.meta.license, 'AIBlocks-1.0');
      assert.ok(draft.meta.created);
      // @ts-expect-error - draft should not have id
      assert.strictEqual(draft.id, undefined);
    });

    it('creates draft with options', () => {
      const draft = createDraft('# Test', {
        author: 'Test Author',
        license: 'CC-BY-4.0',
        lang: 'da',
        parent: validParentId,
      });

      assert.strictEqual(draft.meta.author, 'Test Author');
      assert.strictEqual(draft.meta.license, 'CC-BY-4.0');
      assert.strictEqual(draft.meta.lang, 'da');
      assert.strictEqual(draft.parent, validParentId);
    });
  });
});

describe('Reference Types', () => {
  describe('urlRef', () => {
    it('creates valid URL reference', () => {
      const ref = urlRef('https://example.com', 'Example');

      assert.strictEqual(ref.type, 'url');
      assert.strictEqual(ref.url, 'https://example.com');
      assert.strictEqual(ref.title, 'Example');
      assert.ok(ref.accessed);
    });

    it('throws on invalid URL', () => {
      assert.throws(() => {
        urlRef('not-a-url');
      });
    });
  });

  describe('archiveRef', () => {
    it('creates valid archive reference', () => {
      const ref = archiveRef('Archived content...', 'https://dead-link.com', 'Context');

      assert.strictEqual(ref.type, 'archive');
      assert.strictEqual(ref.snippet, 'Archived content...');
      assert.strictEqual(ref.from, 'https://dead-link.com');
      assert.strictEqual(ref.context, 'Context');
      assert.ok(ref.archived);
    });

    it('works without optional fields', () => {
      const ref = archiveRef('Just the snippet');

      assert.strictEqual(ref.type, 'archive');
      assert.strictEqual(ref.snippet, 'Just the snippet');
    });
  });

  describe('searchRef', () => {
    it('creates valid search reference', () => {
      const ref = searchRef('how to validate blocks', { engine: 'google', expect: 'Guide' });

      assert.strictEqual(ref.type, 'search');
      assert.strictEqual(ref.query, 'how to validate blocks');
      assert.strictEqual(ref.engine, 'google');
      assert.strictEqual(ref.expect, 'Guide');
    });

    it('works with just query', () => {
      const ref = searchRef('find this content');

      assert.strictEqual(ref.type, 'search');
      assert.strictEqual(ref.query, 'find this content');
    });
  });

  describe('hashRef', () => {
    it('creates valid hash reference', () => {
      const ref = hashRef('abc123def456', 'sha256', 'https://example.com/doc');

      assert.strictEqual(ref.type, 'hash');
      assert.strictEqual(ref.alg, 'sha256');
      assert.strictEqual(ref.value, 'abc123def456');
      assert.strictEqual(ref.of, 'https://example.com/doc');
    });

    it('defaults to sha256', () => {
      const ref = hashRef('abc123');

      assert.strictEqual(ref.alg, 'sha256');
    });

    it('accepts sha384 and sha512', () => {
      const ref384 = hashRef('hash384', 'sha384');
      const ref512 = hashRef('hash512', 'sha512');

      assert.strictEqual(ref384.alg, 'sha384');
      assert.strictEqual(ref512.alg, 'sha512');
    });
  });
});

describe('Block with References', () => {
  it('creates block with multiple reference types', () => {
    const block = parseBlock({
      v: 1,
      id: validId,
      content: '# Article with refs',
      meta: { created: '2025-01-06T12:00:00Z' },
      refs: [
        { type: 'url', url: 'https://source.com' },
        { type: 'archive', snippet: 'Backup content' },
        { type: 'search', query: 'find original' },
        { type: 'hash', alg: 'sha256', value: 'abc123' },
      ],
    });

    assert.strictEqual(block.refs.length, 4);
    assert.strictEqual(block.refs[0]?.type, 'url');
    assert.strictEqual(block.refs[1]?.type, 'archive');
    assert.strictEqual(block.refs[2]?.type, 'search');
    assert.strictEqual(block.refs[3]?.type, 'hash');
  });
});

describe('Lineage', () => {
  it('accepts parent ID for derived blocks', () => {
    const block = parseBlock({
      v: 1,
      id: validId,
      content: '# Derived Article',
      meta: { created: '2025-01-06T12:00:00Z' },
      parent: validParentId,
    });

    assert.strictEqual(block.parent, validParentId);
  });

  it('rejects invalid parent ID format', () => {
    assert.throws(() => {
      parseBlock({
        v: 1,
        id: validId,
        content: '# Test',
        meta: { created: '2025-01-06T12:00:00Z' },
        parent: 'invalid-parent',
      });
    });
  });
});

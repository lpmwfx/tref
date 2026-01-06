import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createBlock, safeCreateBlock, isValidBlock } from './block.js';
import {
  createUrlReference,
  createArchiveReference,
  createSearchReference,
  createHashReference,
} from './reference.js';

describe('Block Schema', () => {
  describe('createBlock', () => {
    it('creates a valid block with minimal required fields', () => {
      const block = createBlock({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'article',
        content: 'Test content',
        metadata: {
          createdAt: new Date(),
        },
      });

      assert.strictEqual(block.type, 'article');
      assert.strictEqual(block.content, 'Test content');
      assert.strictEqual(block.lineage.version, 1);
      assert.deepStrictEqual(block.lineage.childIds, []);
    });

    it('creates a block with all fields', () => {
      const parentId = '550e8400-e29b-41d4-a716-446655440001';
      const block = createBlock({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'data',
        content: 'Full block content',
        title: 'Test Block',
        license: {
          type: 'CC-BY-4.0',
          url: 'https://creativecommons.org/licenses/by/4.0/',
          attribution: 'Test Author',
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Test Author',
          source: 'https://example.com',
        },
        lineage: {
          parentId,
          version: 2,
          childIds: [],
        },
        references: [],
      });

      assert.strictEqual(block.title, 'Test Block');
      assert.strictEqual(block.license?.type, 'CC-BY-4.0');
      assert.strictEqual(block.lineage.parentId, parentId);
      assert.strictEqual(block.lineage.version, 2);
    });

    it('throws on invalid block type', () => {
      assert.throws(() => {
        createBlock({
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'invalid',
          content: 'Test',
          metadata: { createdAt: new Date() },
        });
      });
    });

    it('throws on invalid UUID', () => {
      assert.throws(() => {
        createBlock({
          id: 'not-a-uuid',
          type: 'article',
          content: 'Test',
          metadata: { createdAt: new Date() },
        });
      });
    });
  });

  describe('safeCreateBlock', () => {
    it('returns success for valid block', () => {
      const result = safeCreateBlock({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'prompt',
        content: 'Test prompt',
        metadata: { createdAt: new Date() },
      });

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.type, 'prompt');
      }
    });

    it('returns error for invalid block', () => {
      const result = safeCreateBlock({
        id: 'invalid',
        type: 'unknown',
      });

      assert.strictEqual(result.success, false);
    });
  });

  describe('isValidBlock', () => {
    it('returns true for valid block', () => {
      assert.strictEqual(
        isValidBlock({
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'summary',
          content: 'Summary content',
          metadata: { createdAt: new Date() },
        }),
        true
      );
    });

    it('returns false for invalid block', () => {
      assert.strictEqual(isValidBlock({ invalid: 'data' }), false);
    });
  });

  describe('Block types', () => {
    const types = ['article', 'data', 'reference', 'prompt', 'summary'];

    for (const type of types) {
      it(`accepts type: ${type}`, () => {
        const result = safeCreateBlock({
          id: '550e8400-e29b-41d4-a716-446655440000',
          type,
          content: `${type} content`,
          metadata: { createdAt: new Date() },
        });
        assert.strictEqual(result.success, true);
      });
    }
  });

  describe('Lineage', () => {
    it('defaults version to 1', () => {
      const block = createBlock({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'article',
        content: 'Test',
        metadata: { createdAt: new Date() },
      });

      assert.strictEqual(block.lineage.version, 1);
    });

    it('defaults childIds to empty array', () => {
      const block = createBlock({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'article',
        content: 'Test',
        metadata: { createdAt: new Date() },
      });

      assert.deepStrictEqual(block.lineage.childIds, []);
    });

    it('accepts parentId for derived blocks', () => {
      const parentId = '550e8400-e29b-41d4-a716-446655440001';
      const block = createBlock({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'article',
        content: 'Derived content',
        metadata: { createdAt: new Date() },
        lineage: {
          parentId,
          version: 2,
          childIds: [],
        },
      });

      assert.strictEqual(block.lineage.parentId, parentId);
      assert.strictEqual(block.lineage.version, 2);
    });
  });
});

describe('Reference Types', () => {
  describe('URL Reference', () => {
    it('creates valid URL reference', () => {
      const ref = createUrlReference('https://example.com', 'Example');
      assert.strictEqual(ref.type, 'url');
      assert.strictEqual(ref.url, 'https://example.com');
      assert.strictEqual(ref.title, 'Example');
      assert.ok(ref.accessedAt instanceof Date);
    });

    it('throws on invalid URL', () => {
      assert.throws(() => {
        createUrlReference('not-a-url');
      });
    });
  });

  describe('Archive Reference', () => {
    it('creates valid archive reference', () => {
      const ref = createArchiveReference(
        'Archived content snippet',
        'https://dead-link.com',
        'Context around the snippet'
      );
      assert.strictEqual(ref.type, 'archive');
      assert.strictEqual(ref.snippet, 'Archived content snippet');
      assert.strictEqual(ref.originalUrl, 'https://dead-link.com');
      assert.ok(ref.archivedAt instanceof Date);
    });

    it('works without optional fields', () => {
      const ref = createArchiveReference('Just the snippet');
      assert.strictEqual(ref.type, 'archive');
      assert.strictEqual(ref.snippet, 'Just the snippet');
    });
  });

  describe('Search Reference', () => {
    it('creates valid search reference', () => {
      const ref = createSearchReference('how to validate blocks', {
        engine: 'google',
        expectedTitle: 'Block Validation Guide',
        expectedDomain: 'example.com',
      });
      assert.strictEqual(ref.type, 'search');
      assert.strictEqual(ref.query, 'how to validate blocks');
      assert.strictEqual(ref.engine, 'google');
    });

    it('works with just query', () => {
      const ref = createSearchReference('find this content');
      assert.strictEqual(ref.type, 'search');
      assert.strictEqual(ref.query, 'find this content');
    });
  });

  describe('Hash Reference', () => {
    it('creates valid hash reference', () => {
      const ref = createHashReference('abc123def456', 'sha256', 'https://example.com/doc');
      assert.strictEqual(ref.type, 'hash');
      assert.strictEqual(ref.algorithm, 'sha256');
      assert.strictEqual(ref.value, 'abc123def456');
      assert.strictEqual(ref.target, 'https://example.com/doc');
    });

    it('defaults to sha256', () => {
      const ref = createHashReference('abc123');
      assert.strictEqual(ref.algorithm, 'sha256');
    });

    it('accepts sha384 and sha512', () => {
      const ref384 = createHashReference('hash384', 'sha384');
      const ref512 = createHashReference('hash512', 'sha512');
      assert.strictEqual(ref384.algorithm, 'sha384');
      assert.strictEqual(ref512.algorithm, 'sha512');
    });
  });
});

describe('Block with References', () => {
  it('creates block with multiple reference types', () => {
    const block = createBlock({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'article',
      content: 'Article with references',
      metadata: { createdAt: new Date() },
      references: [
        { type: 'url', url: 'https://source.com' },
        { type: 'archive', snippet: 'Backup content', archivedAt: new Date() },
        { type: 'search', query: 'find original' },
        { type: 'hash', algorithm: 'sha256', value: 'abc123' },
      ],
    });

    assert.strictEqual(block.references.length, 4);
    assert.strictEqual(block.references[0]?.type, 'url');
    assert.strictEqual(block.references[1]?.type, 'archive');
    assert.strictEqual(block.references[2]?.type, 'search');
    assert.strictEqual(block.references[3]?.type, 'hash');
  });
});

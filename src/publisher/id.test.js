/**
 * @fileoverview Tests for ID generation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toCanonicalJson, sha256, generateId, verifyId } from './id.js';

describe('toCanonicalJson', () => {
  it('sorts keys alphabetically', () => {
    const block = { z: 1, a: 2, m: 3 };
    const json = toCanonicalJson(block);
    assert.equal(json, '{"a":2,"m":3,"z":1}');
  });

  it('sorts nested object keys', () => {
    const block = { outer: { z: 1, a: 2 } };
    const json = toCanonicalJson(block);
    assert.equal(json, '{"outer":{"a":2,"z":1}}');
  });

  it('handles arrays without sorting elements', () => {
    const block = { arr: [3, 1, 2] };
    const json = toCanonicalJson(block);
    assert.equal(json, '{"arr":[3,1,2]}');
  });

  it('sorts keys inside array objects', () => {
    const block = { arr: [{ z: 1, a: 2 }] };
    const json = toCanonicalJson(block);
    assert.equal(json, '{"arr":[{"a":2,"z":1}]}');
  });

  it('removes id field', () => {
    const block = { id: 'sha256:abc', content: 'test' };
    const json = toCanonicalJson(block);
    assert.equal(json, '{"content":"test"}');
  });

  it('produces no whitespace', () => {
    const block = { a: 1, b: { c: 2 } };
    const json = toCanonicalJson(block);
    assert.ok(!json.includes(' '));
    assert.ok(!json.includes('\n'));
  });
});

describe('sha256', () => {
  it('produces 64 character hex string', () => {
    const hash = sha256('test');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[a-f0-9]{64}$/);
  });

  it('is deterministic', () => {
    const hash1 = sha256('hello');
    const hash2 = sha256('hello');
    assert.equal(hash1, hash2);
  });

  it('produces different hashes for different input', () => {
    const hash1 = sha256('hello');
    const hash2 = sha256('world');
    assert.notEqual(hash1, hash2);
  });

  it('matches known SHA-256 value', () => {
    // echo -n "test" | sha256sum
    const hash = sha256('test');
    assert.equal(hash, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });
});

describe('generateId', () => {
  it('returns id in sha256:<hash> format', () => {
    const block = { v: 1, content: 'test' };
    const id = generateId(block);
    assert.match(id, /^sha256:[a-f0-9]{64}$/);
  });

  it('is deterministic for same content', () => {
    const block = { v: 1, content: 'test', meta: { created: '2025-01-06' } };
    const id1 = generateId(block);
    const id2 = generateId(block);
    assert.equal(id1, id2);
  });

  it('is deterministic regardless of key order', () => {
    const block1 = { v: 1, content: 'test', meta: { a: 1 } };
    const block2 = { meta: { a: 1 }, content: 'test', v: 1 };
    const id1 = generateId(block1);
    const id2 = generateId(block2);
    assert.equal(id1, id2);
  });

  it('produces different IDs for different content', () => {
    const block1 = { v: 1, content: 'hello' };
    const block2 = { v: 1, content: 'world' };
    const id1 = generateId(block1);
    const id2 = generateId(block2);
    assert.notEqual(id1, id2);
  });

  it('ignores existing id field', () => {
    const block1 = { v: 1, content: 'test' };
    const block2 = { v: 1, content: 'test', id: 'sha256:wrong' };
    const id1 = generateId(block1);
    const id2 = generateId(block2);
    assert.equal(id1, id2);
  });
});

describe('verifyId', () => {
  it('returns true for valid ID', () => {
    const block = { v: 1, content: 'test' };
    const id = generateId(block);
    const blockWithId = { ...block, id };
    assert.equal(verifyId(blockWithId), true);
  });

  it('returns false for invalid ID', () => {
    const block = {
      v: 1,
      content: 'test',
      id: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    };
    assert.equal(verifyId(block), false);
  });

  it('returns false for missing ID', () => {
    const block = { v: 1, content: 'test' };
    assert.equal(verifyId(block), false);
  });

  it('returns false for non-string ID', () => {
    const block = { v: 1, content: 'test', id: 123 };
    assert.equal(verifyId(block), false);
  });
});

describe('ID generation determinism', () => {
  it('produces same ID for realistic block', () => {
    const block = {
      v: 1,
      content: '# Test Article\n\nThis is content.',
      meta: {
        author: 'Test Author',
        created: '2025-01-06T12:00:00Z',
        license: 'AIBlocks-1.0',
        lang: 'en',
      },
      refs: [{ type: 'url', url: 'https://example.com', title: 'Example' }],
    };

    const id1 = generateId(block);
    const id2 = generateId(block);
    const id3 = generateId({ ...block }); // shallow copy

    assert.equal(id1, id2);
    assert.equal(id2, id3);
  });

  it('produces same ID when fields reordered', () => {
    const block1 = {
      v: 1,
      content: 'test',
      meta: { created: '2025-01-06', license: 'MIT' },
      refs: [],
    };

    const block2 = {
      refs: [],
      meta: { license: 'MIT', created: '2025-01-06' },
      v: 1,
      content: 'test',
    };

    assert.equal(generateId(block1), generateId(block2));
  });
});

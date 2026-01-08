/**
 * @fileoverview Tests for ID generation (content-only hashing)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sha256, generateId, verifyId } from './id.js';

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

  it('hashes content only - metadata changes do not affect ID', () => {
    const block1 = { v: 1, content: 'test', meta: { a: 1 } };
    const block2 = { v: 1, content: 'test', meta: { b: 2, c: 3 } };
    const id1 = generateId(block1);
    const id2 = generateId(block2);
    assert.equal(id1, id2, 'same content should produce same ID regardless of metadata');
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

  it('ID equals sha256 of content string', () => {
    const content = 'The sky is blue.';
    const block = { v: 1, content };
    const id = generateId(block);
    const expectedId = `sha256:${sha256(content)}`;
    assert.equal(id, expectedId);
  });
});

describe('verifyId', () => {
  it('returns true for valid ID', () => {
    const content = 'test';
    const id = `sha256:${sha256(content)}`;
    const block = { v: 1, content, id };
    assert.equal(verifyId(block), true);
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

  it('returns false for missing content', () => {
    const block = { v: 1, id: 'sha256:abc' };
    assert.equal(verifyId(block), false);
  });
});

describe('ID generation for validation', () => {
  it('validates correctly when content matches ID', () => {
    const content = '# Test Article\n\nThis is content.';
    const id = `sha256:${sha256(content)}`;
    const block = {
      v: 1,
      id,
      content,
      meta: {
        author: 'Test Author',
        created: '2025-01-06T12:00:00Z',
        license: 'TREF-1.0',
      },
    };

    assert.equal(verifyId(block), true);
  });

  it('detects tampered content', () => {
    const originalContent = 'The sky is blue.';
    const id = `sha256:${sha256(originalContent)}`;
    const block = {
      v: 1,
      id,
      content: 'The sky is green.', // tampered!
      meta: { created: '2025-01-06' },
    };

    assert.equal(verifyId(block), false);
  });
});

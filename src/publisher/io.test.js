/**
 * @fileoverview Tests for file I/O
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { save, load, exportBlock, exists, loadById, TREF_EXTENSION } from './io.js';
import { publish, createDraft } from './publish.js';

/** @type {string} */
let testDir;

before(async () => {
  testDir = join(tmpdir(), `tref-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });
});

after(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('save', () => {
  it('saves block to file', async () => {
    const block = publish(createDraft('Test content'));
    const path = join(testDir, 'test1.tref');

    const savedPath = await save(block, path);

    assert.equal(savedPath, path);
    const content = await readFile(path, 'utf8');
    assert.ok(content.includes(block.id));
  });

  it('adds .tref extension if missing', async () => {
    const block = publish(createDraft('Test'));
    const path = join(testDir, 'test2');

    const savedPath = await save(block, path);

    assert.equal(savedPath, path + TREF_EXTENSION);
  });

  it('creates directory if needed', async () => {
    const block = publish(createDraft('Test'));
    const path = join(testDir, 'subdir', 'nested', 'test3.tref');

    await save(block, path);

    const content = await readFile(path, 'utf8');
    assert.ok(content.includes(block.id));
  });

  it('saves pretty JSON when requested', async () => {
    const block = publish(createDraft('Test'));
    const path = join(testDir, 'pretty.tref');

    await save(block, path, { pretty: true });

    const content = await readFile(path, 'utf8');
    assert.ok(content.includes('\n')); // Pretty JSON has newlines
  });

  it('throws on invalid block', async () => {
    const invalidBlock = { v: 1, content: 'test', id: 'sha256:wrong' };
    const path = join(testDir, 'invalid.tref');

    await assert.rejects(
      async () => save(/** @type {any} */ (invalidBlock), path),
      /Invalid block/
    );
  });

  it('skips validation when requested', async () => {
    const block = publish(createDraft('Test'));
    // Tamper with content (would fail validation)
    const tampered = { ...block, content: 'Tampered' };
    const path = join(testDir, 'no-validate.tref');

    // Should not throw with validate: false
    await save(/** @type {any} */ (tampered), path, { validate: false });

    const content = await readFile(path, 'utf8');
    assert.ok(content.includes('Tampered'));
  });
});

describe('load', () => {
  it('loads block from file', async () => {
    const block = publish(createDraft('Load test'));
    const path = join(testDir, 'load-test.tref');
    await save(block, path);

    const loaded = await load(path);

    assert.equal(loaded.id, block.id);
    assert.equal(loaded.content, block.content);
  });

  it('validates loaded block by default', async () => {
    const block = publish(createDraft('Test'));
    const path = join(testDir, 'tampered-load.tref');

    // Save valid block then tamper with file
    await save(block, path);
    const tampered = { ...block, content: 'Tampered' };
    await import('node:fs/promises').then(fs =>
      fs.writeFile(path, JSON.stringify(tampered), 'utf8')
    );

    await assert.rejects(async () => load(path), /Invalid block/);
  });

  it('skips validation when requested', async () => {
    const block = publish(createDraft('Test'));
    const path = join(testDir, 'skip-validate-load.tref');

    // Save tampered block directly
    const tampered = { ...block, content: 'Tampered' };
    await import('node:fs/promises').then(fs =>
      fs.writeFile(path, JSON.stringify(tampered), 'utf8')
    );

    const loaded = await load(path, { validate: false });
    assert.equal(loaded.content, 'Tampered');
  });

  it('throws on invalid JSON', async () => {
    const path = join(testDir, 'invalid-json.tref');
    await import('node:fs/promises').then(fs => fs.writeFile(path, 'not json', 'utf8'));

    await assert.rejects(async () => load(path));
  });

  it('throws on missing file', async () => {
    await assert.rejects(async () => load(join(testDir, 'nonexistent.tref')));
  });
});

describe('exportBlock', () => {
  it('exports to publish directory with subdirectory', async () => {
    const block = publish(createDraft('Export test'));
    const publishDir = join(testDir, 'publish');

    const path = await exportBlock(block, publishDir);

    const hash = block.id.replace('sha256:', '');
    const expectedPath = join(publishDir, hash.slice(0, 2), hash + TREF_EXTENSION);
    assert.equal(path, expectedPath);

    const content = await readFile(path, 'utf8');
    assert.ok(content.includes(block.id));
  });

  it('uses first 2 chars of hash as subdirectory', async () => {
    const block = publish(createDraft('Subdir test'));
    const publishDir = join(testDir, 'publish2');

    const path = await exportBlock(block, publishDir);

    const hash = block.id.replace('sha256:', '');
    assert.ok(path.includes(`/${hash.slice(0, 2)}/`));
  });

  it('throws on invalid block', async () => {
    const invalidBlock = { v: 1, content: 'test', id: 'sha256:bad', meta: {} };
    const publishDir = join(testDir, 'publish-invalid');

    await assert.rejects(
      async () => exportBlock(/** @type {any} */ (invalidBlock), publishDir),
      /Invalid block/
    );
  });
});

describe('exists', () => {
  it('returns true for existing block', async () => {
    const block = publish(createDraft('Exists test'));
    const publishDir = join(testDir, 'exists-test');
    await exportBlock(block, publishDir);

    const result = await exists(block.id, publishDir);

    assert.equal(result, true);
  });

  it('returns false for non-existing block', async () => {
    const publishDir = join(testDir, 'exists-test2');
    await mkdir(publishDir, { recursive: true });

    const result = await exists(
      'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      publishDir
    );

    assert.equal(result, false);
  });
});

describe('loadById', () => {
  it('loads block by ID from publish directory', async () => {
    const block = publish(createDraft('LoadById test'));
    const publishDir = join(testDir, 'load-by-id');
    await exportBlock(block, publishDir);

    const loaded = await loadById(block.id, publishDir);

    assert.equal(loaded.id, block.id);
    assert.equal(loaded.content, block.content);
  });

  it('throws for non-existing ID', async () => {
    const publishDir = join(testDir, 'load-by-id2');
    await mkdir(publishDir, { recursive: true });

    await assert.rejects(async () =>
      loadById(
        'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        publishDir
      )
    );
  });
});

describe('roundtrip', () => {
  it('save → load preserves block data', async () => {
    const original = publish(createDraft('Roundtrip test'));
    const path = join(testDir, 'roundtrip.tref');

    await save(original, path);
    const loaded = await load(path);

    // Check all defined fields match
    assert.equal(loaded.v, original.v);
    assert.equal(loaded.id, original.id);
    assert.equal(loaded.content, original.content);
    assert.equal(loaded.meta.created, original.meta.created);
    assert.equal(loaded.meta.license, original.meta.license);
    assert.deepEqual(loaded.refs, original.refs);
  });

  it('export → loadById preserves block data', async () => {
    const original = publish(createDraft('Export roundtrip'));
    const publishDir = join(testDir, 'roundtrip-publish');

    await exportBlock(original, publishDir);
    const loaded = await loadById(original.id, publishDir);

    // Check all defined fields match
    assert.equal(loaded.v, original.v);
    assert.equal(loaded.id, original.id);
    assert.equal(loaded.content, original.content);
    assert.equal(loaded.meta.created, original.meta.created);
    assert.equal(loaded.meta.license, original.meta.license);
    assert.deepEqual(loaded.refs, original.refs);
  });
});

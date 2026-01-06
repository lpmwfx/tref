/**
 * @fileoverview Tests for registry
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadRegistry,
  saveRegistry,
  addToRegistry,
  isRegistered,
  listRegistered,
  removeFromRegistry,
  getRegistryStats,
  REGISTRY_FILE,
} from './registry.js';
import { publish } from './publish.js';
import { createDraft } from '../schemas/block.js';

/** @type {string} */
let testDir;

before(async () => {
  testDir = join(tmpdir(), `tref-registry-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });
});

after(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('loadRegistry', () => {
  it('returns empty registry for new directory', async () => {
    const dir = join(testDir, 'new-dir');
    await mkdir(dir, { recursive: true });

    const registry = await loadRegistry(dir);

    assert.equal(registry.v, 1);
    assert.deepEqual(registry.blocks, []);
  });

  it('loads existing registry', async () => {
    const dir = join(testDir, 'existing');
    await mkdir(dir, { recursive: true });

    const existing = {
      v: 1,
      blocks: [{ id: 'sha256:abc123', added: '2025-01-01T00:00:00Z' }],
    };
    await import('node:fs/promises').then(fs =>
      fs.writeFile(join(dir, REGISTRY_FILE), JSON.stringify(existing), 'utf8')
    );

    const registry = await loadRegistry(dir);

    assert.equal(registry.blocks.length, 1);
    assert.equal(registry.blocks[0].id, 'sha256:abc123');
  });

  it('throws on invalid registry format', async () => {
    const dir = join(testDir, 'invalid-format');
    await mkdir(dir, { recursive: true });
    await import('node:fs/promises').then(fs =>
      fs.writeFile(join(dir, REGISTRY_FILE), '{"foo": "bar"}', 'utf8')
    );

    await assert.rejects(async () => loadRegistry(dir), /Invalid registry/);
  });

  it('throws on invalid JSON', async () => {
    const dir = join(testDir, 'invalid-json');
    await mkdir(dir, { recursive: true });
    await import('node:fs/promises').then(fs =>
      fs.writeFile(join(dir, REGISTRY_FILE), 'not json', 'utf8')
    );

    await assert.rejects(async () => loadRegistry(dir));
  });
});

describe('saveRegistry', () => {
  it('saves registry to file', async () => {
    const dir = join(testDir, 'save-test');
    const registry = {
      v: /** @type {1} */ (1),
      blocks: [{ id: 'sha256:test123', added: '2025-01-06T12:00:00Z' }],
    };

    const path = await saveRegistry(registry, dir);

    assert.equal(path, join(dir, REGISTRY_FILE));
    const content = await readFile(path, 'utf8');
    const parsed = /** @type {unknown} */ (JSON.parse(content));
    const loaded = /** @type {{ blocks: Array<{ id: string }> }} */ (parsed);
    assert.equal(loaded.blocks[0].id, 'sha256:test123');
  });

  it('creates directory if needed', async () => {
    const dir = join(testDir, 'nested', 'save', 'dir');
    const registry = { v: /** @type {1} */ (1), blocks: [] };

    await saveRegistry(registry, dir);

    const content = await readFile(join(dir, REGISTRY_FILE), 'utf8');
    assert.ok(content.includes('"v"'));
  });

  it('saves with pretty formatting', async () => {
    const dir = join(testDir, 'pretty-save');
    const registry = { v: /** @type {1} */ (1), blocks: [] };

    await saveRegistry(registry, dir);

    const content = await readFile(join(dir, REGISTRY_FILE), 'utf8');
    assert.ok(content.includes('\n')); // Pretty JSON has newlines
  });
});

describe('addToRegistry', () => {
  it('adds new ID to registry', async () => {
    const dir = join(testDir, 'add-test');
    const block = publish(createDraft('Test'));

    const added = await addToRegistry(block.id, dir);

    assert.equal(added, true);
    const registry = await loadRegistry(dir);
    assert.equal(registry.blocks.length, 1);
    assert.equal(registry.blocks[0].id, block.id);
  });

  it('returns false for duplicate ID', async () => {
    const dir = join(testDir, 'duplicate-test');
    const block = publish(createDraft('Test'));

    await addToRegistry(block.id, dir);
    const added = await addToRegistry(block.id, dir);

    assert.equal(added, false);
    const registry = await loadRegistry(dir);
    assert.equal(registry.blocks.length, 1); // Still only one
  });

  it('adds timestamp to entry', async () => {
    const dir = join(testDir, 'timestamp-test');
    const block = publish(createDraft('Test'));
    const before = new Date();

    await addToRegistry(block.id, dir);

    const registry = await loadRegistry(dir);
    const added = new Date(registry.blocks[0].added);
    assert.ok(added >= before);
  });
});

describe('isRegistered', () => {
  it('returns true for registered ID', async () => {
    const dir = join(testDir, 'is-registered-true');
    const block = publish(createDraft('Test'));
    await addToRegistry(block.id, dir);

    const result = await isRegistered(block.id, dir);

    assert.equal(result, true);
  });

  it('returns false for unregistered ID', async () => {
    const dir = join(testDir, 'is-registered-false');
    await mkdir(dir, { recursive: true });

    const result = await isRegistered('sha256:nonexistent', dir);

    assert.equal(result, false);
  });
});

describe('listRegistered', () => {
  it('returns all registered IDs', async () => {
    const dir = join(testDir, 'list-test');
    const block1 = publish(createDraft('Test 1'));
    const block2 = publish(createDraft('Test 2'));

    await addToRegistry(block1.id, dir);
    await addToRegistry(block2.id, dir);

    const ids = await listRegistered(dir);

    assert.equal(ids.length, 2);
    assert.ok(ids.includes(block1.id));
    assert.ok(ids.includes(block2.id));
  });

  it('returns empty array for empty registry', async () => {
    const dir = join(testDir, 'list-empty');
    await mkdir(dir, { recursive: true });

    const ids = await listRegistered(dir);

    assert.deepEqual(ids, []);
  });
});

describe('removeFromRegistry', () => {
  it('removes registered ID', async () => {
    const dir = join(testDir, 'remove-test');
    const block = publish(createDraft('Test'));
    await addToRegistry(block.id, dir);

    const removed = await removeFromRegistry(block.id, dir);

    assert.equal(removed, true);
    const ids = await listRegistered(dir);
    assert.equal(ids.length, 0);
  });

  it('returns false for unregistered ID', async () => {
    const dir = join(testDir, 'remove-not-found');
    await mkdir(dir, { recursive: true });

    const removed = await removeFromRegistry('sha256:nonexistent', dir);

    assert.equal(removed, false);
  });
});

describe('getRegistryStats', () => {
  it('returns count for empty registry', async () => {
    const dir = join(testDir, 'stats-empty');
    await mkdir(dir, { recursive: true });

    const stats = await getRegistryStats(dir);

    assert.equal(stats.count, 0);
    assert.equal(stats.oldest, undefined);
    assert.equal(stats.newest, undefined);
  });

  it('returns stats for populated registry', async () => {
    const dir = join(testDir, 'stats-populated');
    const block1 = publish(createDraft('Test 1'));
    const block2 = publish(createDraft('Test 2'));

    await addToRegistry(block1.id, dir);
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    await addToRegistry(block2.id, dir);

    const stats = await getRegistryStats(dir);

    assert.equal(stats.count, 2);
    assert.ok(stats.oldest);
    assert.ok(stats.newest);
    assert.ok(new Date(stats.oldest) <= new Date(stats.newest));
  });
});

describe('roundtrip', () => {
  it('full workflow: add, list, check, remove', async () => {
    const dir = join(testDir, 'roundtrip');
    const block = publish(createDraft('Roundtrip test'));

    // Add
    await addToRegistry(block.id, dir);
    assert.equal(await isRegistered(block.id, dir), true);

    // List
    const ids = await listRegistered(dir);
    assert.ok(ids.includes(block.id));

    // Remove
    await removeFromRegistry(block.id, dir);
    assert.equal(await isRegistered(block.id, dir), false);
  });
});

/**
 * @fileoverview Registry for tracking published blocks
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

/**
 * @typedef {Object} RegistryEntry
 * @property {string} id - Block ID (sha256:...)
 * @property {string} added - ISO timestamp when added
 */

/**
 * @typedef {Object} Registry
 * @property {number} v - Registry version
 * @property {RegistryEntry[]} blocks - Published block entries
 */

/** Registry filename */
export const REGISTRY_FILE = 'published.json';

/**
 * Load registry from publish directory
 * Creates empty registry if file doesn't exist
 *
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<Registry>} - Registry data
 */
export async function loadRegistry(publishDir) {
  const path = join(publishDir, REGISTRY_FILE);

  try {
    const json = await readFile(path, 'utf8');
    const data = /** @type {unknown} */ (JSON.parse(json));

    // Basic validation
    if (typeof data === 'object' && data !== null && 'v' in data && 'blocks' in data) {
      return /** @type {Registry} */ (data);
    }

    throw new Error('Invalid registry format');
  } catch (err) {
    // Return empty registry if file doesn't exist
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return { v: 1, blocks: [] };
    }
    throw err;
  }
}

/**
 * Save registry to publish directory
 *
 * @param {Registry} registry - Registry to save
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<string>} - Path to saved registry
 */
export async function saveRegistry(registry, publishDir) {
  const path = join(publishDir, REGISTRY_FILE);

  // Ensure directory exists
  await mkdir(dirname(path), { recursive: true });

  // Save with pretty formatting for readability
  const json = JSON.stringify(registry, null, 2);
  await writeFile(path, json, 'utf8');

  return path;
}

/**
 * Add a block ID to the registry
 * Skips if ID already exists
 *
 * @param {string} id - Block ID (sha256:...)
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<boolean>} - True if added, false if already exists
 */
export async function addToRegistry(id, publishDir) {
  const registry = await loadRegistry(publishDir);

  // Check if already registered
  if (registry.blocks.some(entry => entry.id === id)) {
    return false;
  }

  // Add new entry
  registry.blocks.push({
    id,
    added: new Date().toISOString(),
  });

  await saveRegistry(registry, publishDir);
  return true;
}

/**
 * Check if a block ID is in the registry
 *
 * @param {string} id - Block ID (sha256:...)
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<boolean>} - True if registered
 */
export async function isRegistered(id, publishDir) {
  const registry = await loadRegistry(publishDir);
  return registry.blocks.some(entry => entry.id === id);
}

/**
 * List all registered block IDs
 *
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<string[]>} - Array of block IDs
 */
export async function listRegistered(publishDir) {
  const registry = await loadRegistry(publishDir);
  return registry.blocks.map(entry => entry.id);
}

/**
 * Remove a block ID from the registry
 *
 * @param {string} id - Block ID (sha256:...)
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<boolean>} - True if removed, false if not found
 */
export async function removeFromRegistry(id, publishDir) {
  const registry = await loadRegistry(publishDir);

  const index = registry.blocks.findIndex(entry => entry.id === id);
  if (index === -1) {
    return false;
  }

  registry.blocks.splice(index, 1);
  await saveRegistry(registry, publishDir);
  return true;
}

/**
 * Get registry statistics
 *
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<{ count: number, oldest?: string, newest?: string }>}
 */
export async function getRegistryStats(publishDir) {
  const registry = await loadRegistry(publishDir);

  if (registry.blocks.length === 0) {
    return { count: 0 };
  }

  const sorted = [...registry.blocks].sort(
    (a, b) => new Date(a.added).getTime() - new Date(b.added).getTime()
  );

  return {
    count: registry.blocks.length,
    oldest: sorted[0].added,
    newest: sorted[sorted.length - 1].added,
  };
}

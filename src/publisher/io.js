/**
 * @fileoverview File I/O for TREF blocks
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { validate } from './publish.js';

/**
 * @typedef {import('./publish.js').TrefBlock} TrefBlock
 */

/** Default file extension */
export const TREF_EXTENSION = '.tref';

/**
 * Basic structure validation for loaded block
 * @param {unknown} data
 * @returns {TrefBlock}
 */
function parseBlock(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Block must be an object');
  }
  const b = /** @type {Record<string, unknown>} */ (data);
  if (b.v !== 1) {
    throw new Error('Invalid version');
  }
  if (typeof b.id !== 'string' || !b.id.startsWith('sha256:')) {
    throw new Error('Invalid ID');
  }
  if (typeof b.content !== 'string') {
    throw new Error('Invalid content');
  }
  if (!b.meta || typeof b.meta !== 'object') {
    throw new Error('Invalid meta');
  }
  return /** @type {TrefBlock} */ (data);
}

/**
 * Save a block to a .tref file
 *
 * @param {TrefBlock} block - Block to save
 * @param {string} filePath - Path to save to (adds .tref if missing)
 * @param {object} [options] - Save options
 * @param {boolean} [options.pretty] - Pretty print JSON (default: false)
 * @param {boolean} [options.validate] - Validate before saving (default: true)
 * @returns {Promise<string>} - Actual path saved to
 */
export async function save(block, filePath, options = {}) {
  const { pretty = false, validate: shouldValidate = true } = options;

  // Validate block
  if (shouldValidate) {
    const result = validate(block);
    if (!result.valid) {
      throw new Error(`Invalid block: ${result.error}`);
    }
  }

  // Ensure .tref extension
  const path = filePath.endsWith(TREF_EXTENSION) ? filePath : filePath + TREF_EXTENSION;

  // Ensure directory exists
  await mkdir(dirname(path), { recursive: true });

  // Serialize
  const json = pretty ? JSON.stringify(block, null, 2) : JSON.stringify(block);

  // Write
  await writeFile(path, json, 'utf8');

  return path;
}

/**
 * Load a block from a .tref file
 *
 * @param {string} filePath - Path to load from
 * @param {object} [options] - Load options
 * @param {boolean} [options.validate] - Validate after loading (default: true)
 * @returns {Promise<TrefBlock>} - Loaded block
 */
export async function load(filePath, options = {}) {
  const { validate: shouldValidate = true } = options;

  // Read file
  const json = await readFile(filePath, 'utf8');

  // Parse and validate structure
  const data = /** @type {unknown} */ (JSON.parse(json));
  const block = parseBlock(data);

  // Validate ID integrity
  if (shouldValidate) {
    const result = validate(block);
    if (!result.valid) {
      throw new Error(`Invalid block in file: ${result.error}`);
    }
  }

  return block;
}

/**
 * Export a block to the publish directory
 * Uses block ID as filename: <PUBLISH_DIR>/<id-prefix>/<id>.tref
 *
 * @param {TrefBlock} block - Block to export
 * @param {string} publishDir - Base directory for published blocks
 * @param {object} [options] - Export options
 * @param {boolean} [options.pretty] - Pretty print JSON (default: false)
 * @returns {Promise<string>} - Path to exported file
 */
export async function exportBlock(block, publishDir, options = {}) {
  const { pretty = false } = options;

  // Validate
  const result = validate(block);
  if (!result.valid) {
    throw new Error(`Invalid block: ${result.error}`);
  }

  // Extract hash from ID (sha256:abc123... → abc123...)
  const hash = block.id.replace('sha256:', '');

  // Use first 2 chars as subdirectory (for filesystem performance)
  const subdir = hash.slice(0, 2);
  const filename = hash + TREF_EXTENSION;

  const path = join(publishDir, subdir, filename);

  // Ensure directory exists
  await mkdir(join(publishDir, subdir), { recursive: true });

  // Serialize and write
  const json = pretty ? JSON.stringify(block, null, 2) : JSON.stringify(block);
  await writeFile(path, json, 'utf8');

  return path;
}

/**
 * Check if a block file exists in the publish directory
 *
 * @param {string} id - Block ID (sha256:...)
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<boolean>} - True if file exists
 */
export async function exists(id, publishDir) {
  const hash = id.replace('sha256:', '');
  const subdir = hash.slice(0, 2);
  const filename = hash + TREF_EXTENSION;
  const path = join(publishDir, subdir, filename);

  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load a block from the publish directory by ID
 *
 * @param {string} id - Block ID (sha256:...)
 * @param {string} publishDir - Base directory for published blocks
 * @returns {Promise<TrefBlock>} - Loaded block
 */
export async function loadById(id, publishDir) {
  const hash = id.replace('sha256:', '');
  const subdir = hash.slice(0, 2);
  const filename = hash + TREF_EXTENSION;
  const path = join(publishDir, subdir, filename);

  return load(path);
}

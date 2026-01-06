/**
 * @fileoverview ID generation for TREF blocks
 * Content-based IDs using SHA-256 hash of canonical JSON
 */

import { createHash } from 'node:crypto';

/**
 * Recursively sort object keys alphabetically
 * @param {unknown} value - Value to sort
 * @returns {unknown} - Value with sorted keys (if object)
 */
function sortKeys(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  /** @type {Record<string, unknown>} */
  const sorted = {};
  const keys = Object.keys(value).sort();

  for (const key of keys) {
    sorted[key] = sortKeys(/** @type {Record<string, unknown>} */ (value)[key]);
  }

  return sorted;
}

/**
 * Convert block to canonical JSON string
 * - Keys sorted alphabetically (recursive)
 * - No whitespace
 * - UTF-8 encoding
 *
 * @param {Record<string, unknown>} block - Block object (without id)
 * @returns {string} - Canonical JSON string
 */
export function toCanonicalJson(block) {
  // Remove id field if present (id is computed from other fields)
  const copy = { ...block };
  delete copy.id;
  const sorted = sortKeys(copy);
  return JSON.stringify(sorted);
}

/**
 * Generate SHA-256 hash of string
 * @param {string} data - String to hash
 * @returns {string} - Hex-encoded hash
 */
export function sha256(data) {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Generate content-based ID for a block
 * Format: sha256:<64 hex chars>
 *
 * @param {Record<string, unknown>} block - Block object (without id)
 * @returns {string} - Block ID in format sha256:<hash>
 */
export function generateId(block) {
  const canonical = toCanonicalJson(block);
  const hash = sha256(canonical);
  return `sha256:${hash}`;
}

/**
 * Verify that a block's ID matches its content
 * @param {Record<string, unknown>} block - Block with id field
 * @returns {boolean} - True if ID matches content
 */
export function verifyId(block) {
  if (typeof block.id !== 'string') {
    return false;
  }
  const expectedId = generateId(block);
  return block.id === expectedId;
}

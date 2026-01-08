/**
 * @fileoverview ID generation for TREF blocks
 * Content-based IDs using SHA-256 hash of content field only
 */

import { createHash } from 'node:crypto';

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
 * ID is hash of content field only (not entire block).
 * This enables simple validation: rehash content and compare.
 *
 * @param {Record<string, unknown>} block - Block object with content field
 * @returns {string} - Block ID in format sha256:<hash>
 */
export function generateId(block) {
  const content = /** @type {string} */ (block.content);
  const hash = sha256(content);
  return `sha256:${hash}`;
}

/**
 * Verify that a block's ID matches its content
 * @param {Record<string, unknown>} block - Block with id and content fields
 * @returns {boolean} - True if ID matches content hash
 */
export function verifyId(block) {
  if (typeof block.id !== 'string' || typeof block.content !== 'string') {
    return false;
  }
  const expectedId = generateId(block);
  return block.id === expectedId;
}

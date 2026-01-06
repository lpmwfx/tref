/**
 * @fileoverview Publishing functions for TREF blocks
 */

import { generateId, verifyId } from './id.js';
import { DraftBlockSchema, AIBlockSchema } from '../schemas/block.js';

/**
 * @typedef {import('../schemas/block.js').DraftBlock} DraftBlock
 * @typedef {import('../schemas/block.js').AIBlock} AIBlock
 */

/**
 * Publish a draft block by adding a content-based ID
 *
 * @param {DraftBlock} draft - Draft block without ID
 * @returns {AIBlock} - Published block with ID
 */
export function publish(draft) {
  // Validate draft
  const validDraft = DraftBlockSchema.parse(draft);

  // Generate ID from content
  const id = generateId(validDraft);

  // Create published block
  const block = { ...validDraft, id };

  // Validate final block
  return AIBlockSchema.parse(block);
}

/**
 * Derive a new block from an existing block
 * Sets parent to source block's ID and preserves refs
 *
 * @param {AIBlock} source - Source block to derive from
 * @param {string} newContent - New content for derived block
 * @param {object} [options] - Optional overrides
 * @param {string} [options.author] - New author
 * @param {import('../schemas/reference.js').Ref[]} [options.additionalRefs] - Additional refs to add
 * @returns {AIBlock} - New derived block with parent reference
 */
export function derive(source, newContent, options = {}) {
  // Validate source block
  const validSource = AIBlockSchema.parse(source);

  // Create draft for derived block
  const draft = {
    v: /** @type {1} */ (1),
    content: newContent,
    meta: {
      ...validSource.meta,
      author: options.author ?? validSource.meta.author,
      created: new Date().toISOString(),
      modified: undefined,
    },
    refs: [...validSource.refs, ...(options.additionalRefs ?? [])],
    parent: validSource.id,
  };

  // Remove undefined fields
  if (draft.meta.modified === undefined) {
    delete draft.meta.modified;
  }
  if (draft.meta.author === undefined) {
    delete draft.meta.author;
  }

  // Publish the derived block
  return publish(draft);
}

/**
 * Validate a block's integrity
 * Checks that the ID matches the content hash
 *
 * @param {unknown} block - Block to validate
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export function validate(block) {
  // Check basic structure
  const parseResult = AIBlockSchema.safeParse(block);
  if (!parseResult.success) {
    return {
      valid: false,
      error: `Invalid block structure: ${parseResult.error.message}`,
    };
  }

  // Check ID matches content
  if (!verifyId(/** @type {Record<string, unknown>} */ (block))) {
    return {
      valid: false,
      error: 'ID does not match content hash',
    };
  }

  return { valid: true };
}

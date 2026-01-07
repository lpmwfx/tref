/**
 * @fileoverview Publishing functions for TREF blocks
 * Self-contained - no external schema dependencies
 */

import { generateId, verifyId } from './id.js';

/**
 * @typedef {object} Ref
 * @property {'url' | 'archive' | 'search' | 'hash'} type
 * @property {string} [url]
 * @property {string} [title]
 * @property {string} [snippet]
 * @property {string} [query]
 * @property {string} [alg]
 * @property {string} [value]
 */

/**
 * @typedef {object} BlockMeta
 * @property {string} [author]
 * @property {string} created
 * @property {string} [modified]
 * @property {string} license
 * @property {string} [lang]
 */

/**
 * @typedef {object} DraftBlock
 * @property {1} v
 * @property {string} content
 * @property {BlockMeta} meta
 * @property {Ref[]} [refs]
 * @property {string} [parent]
 */

/**
 * @typedef {object} TrefBlock
 * @property {1} v
 * @property {string} id
 * @property {string} content
 * @property {BlockMeta} meta
 * @property {Ref[]} [refs]
 * @property {string} [parent]
 */

/**
 * Validate draft block structure
 * @param {unknown} draft
 * @returns {{ valid: true, data: DraftBlock } | { valid: false, error: string }}
 */
function validateDraft(draft) {
  if (!draft || typeof draft !== 'object') {
    return { valid: false, error: 'Draft must be an object' };
  }

  const d = /** @type {Record<string, unknown>} */ (draft);

  if (d.v !== 1) {
    return { valid: false, error: 'Version must be 1' };
  }

  if (typeof d.content !== 'string' || d.content.length === 0) {
    return { valid: false, error: 'Content must be a non-empty string' };
  }

  if (!d.meta || typeof d.meta !== 'object') {
    return { valid: false, error: 'Meta must be an object' };
  }

  const meta = /** @type {Record<string, unknown>} */ (d.meta);

  if (typeof meta.created !== 'string') {
    return { valid: false, error: 'meta.created must be a string' };
  }

  if (typeof meta.license !== 'string') {
    return { valid: false, error: 'meta.license must be a string' };
  }

  return { valid: true, data: /** @type {DraftBlock} */ (draft) };
}

/**
 * Validate complete block structure (with id)
 * @param {unknown} block
 * @returns {{ valid: true, data: TrefBlock } | { valid: false, error: string }}
 */
function validateBlock(block) {
  if (!block || typeof block !== 'object') {
    return { valid: false, error: 'Block must be an object' };
  }

  const b = /** @type {Record<string, unknown>} */ (block);

  if (typeof b.id !== 'string' || !b.id.startsWith('sha256:')) {
    return { valid: false, error: 'ID must be a sha256: prefixed string' };
  }

  // Validate rest as draft
  const draftResult = validateDraft(block);
  if (!draftResult.valid) {
    return draftResult;
  }

  return { valid: true, data: /** @type {TrefBlock} */ (block) };
}

/**
 * Create a draft block from content
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {string} [options.lang]
 * @param {Ref[]} [options.refs]
 * @param {string} [options.parent]
 * @returns {DraftBlock}
 */
export function createDraft(content, options = {}) {
  /** @type {DraftBlock} */
  const draft = {
    v: 1,
    content,
    meta: {
      created: new Date().toISOString(),
      license: options.license || 'CC-BY-4.0',
    },
  };

  if (options.author) {
    draft.meta.author = options.author;
  }

  if (options.lang) {
    draft.meta.lang = options.lang;
  }

  if (options.refs && options.refs.length > 0) {
    draft.refs = options.refs;
  }

  if (options.parent) {
    draft.parent = options.parent;
  }

  return draft;
}

/**
 * Publish a draft block by adding a content-based ID
 *
 * @param {DraftBlock} draft - Draft block without ID
 * @returns {TrefBlock} - Published block with ID
 * @throws {Error} If draft is invalid
 */
export function publish(draft) {
  // Validate draft
  const result = validateDraft(draft);
  if (!result.valid) {
    throw new Error(`Invalid draft: ${result.error}`);
  }

  // Generate ID from content
  const id = generateId(/** @type {Record<string, unknown>} */ (draft));

  // Create published block
  return /** @type {TrefBlock} */ ({ ...draft, id });
}

/**
 * Derive a new block from an existing block
 * Sets parent to source block's ID and preserves refs
 *
 * @param {TrefBlock} source - Source block to derive from
 * @param {string} newContent - New content for derived block
 * @param {object} [options] - Optional overrides
 * @param {string} [options.author] - New author
 * @param {Ref[]} [options.additionalRefs] - Additional refs to add
 * @returns {TrefBlock} - New derived block with parent reference
 * @throws {Error} If source is invalid
 */
export function derive(source, newContent, options = {}) {
  // Validate source block
  const result = validateBlock(source);
  if (!result.valid) {
    throw new Error(`Invalid source: ${result.error}`);
  }

  const validSource = result.data;

  // Create draft for derived block
  const draft = createDraft(newContent, {
    author: options.author ?? validSource.meta.author,
    license: validSource.meta.license,
    lang: validSource.meta.lang,
    refs: [...(validSource.refs || []), ...(options.additionalRefs || [])],
    parent: validSource.id,
  });

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
  const result = validateBlock(block);
  if (!result.valid) {
    return { valid: false, error: `Invalid block structure: ${result.error}` };
  }

  // Check ID matches content
  if (!verifyId(/** @type {Record<string, unknown>} */ (block))) {
    return { valid: false, error: 'ID does not match content hash' };
  }

  return { valid: true };
}

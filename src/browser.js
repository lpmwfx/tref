/**
 * @fileoverview Browser bundle entry point for TREF
 *
 * Use via CDN: <script src="https://tref.lpmwfx.com/js/tref.min.js"></script>
 *
 * Exports to window.TREF
 */

/* global window, TextEncoder */

// Re-export everything from wrapper
export {
  TrefWrapper,
  TrefReceiver,
  wrap,
  unwrap,
  TREF_ICON_SVG,
  TREF_ICON_DATA_URL,
  TREF_MIME_TYPE,
} from './wrapper/wrapper.js';

import {
  TrefWrapper,
  TrefReceiver,
  wrap,
  unwrap,
  TREF_ICON_SVG,
  TREF_ICON_DATA_URL,
  TREF_MIME_TYPE,
} from './wrapper/wrapper.js';

// ========== Browser-specific: Crypto functions ==========

/**
 * @typedef {import('./wrapper/shared.js').TrefBlock} TrefBlock
 */

/**
 * Sort object keys recursively for canonical JSON
 * @param {unknown} obj
 * @returns {unknown}
 */
function sortKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted = /** @type {Record<string, unknown>} */ ({});
    const record = /** @type {Record<string, unknown>} */ (obj);
    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortKeys(record[key]);
    }
    return sorted;
  }
  return obj;
}

/**
 * SHA-256 hash using Web Crypto API
 * @param {string} data
 * @returns {Promise<string>}
 */
async function sha256(data) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate block ID from draft
 * @param {Omit<TrefBlock, 'id'>} draft
 * @returns {Promise<string>}
 */
async function generateId(draft) {
  const canonical = JSON.stringify(sortKeys(draft));
  const hash = await sha256(canonical);
  return `sha256:${hash}`;
}

// ========== Publishing Functions ==========

/**
 * Create a draft block (without ID)
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {Array<{ type: string, url?: string, title?: string }>} [options.refs]
 * @param {string} [options.parent]
 * @returns {Omit<TrefBlock, 'id'>}
 */
export function createDraft(content, options = {}) {
  /** @type {Omit<TrefBlock, 'id'>} */
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
  if (options.refs && options.refs.length > 0) {
    draft.refs = options.refs;
  }
  if (options.parent) {
    draft.parent = options.parent;
  }

  return draft;
}

/**
 * Publish content to a TREF block
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {Array<{ type: string, url?: string, title?: string }>} [options.refs]
 * @param {string} [options.parent]
 * @returns {Promise<TrefBlock>}
 */
export async function publish(content, options = {}) {
  const draft = createDraft(content, options);
  const id = await generateId(draft);
  return /** @type {TrefBlock} */ ({ ...draft, id });
}

/**
 * Derive a new block from a parent
 * @param {TrefBlock} parent
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {Array<{ type: string, url?: string, title?: string }>} [options.refs]
 * @returns {Promise<TrefBlock>}
 */
export async function derive(parent, content, options = {}) {
  return publish(content, {
    ...options,
    license: options.license || parent.meta.license,
    parent: parent.id,
  });
}

/**
 * Validate a block's integrity
 * @param {TrefBlock} block
 * @returns {Promise<boolean>}
 */
export async function validate(block) {
  const { id, ...rest } = block;
  const expectedId = await generateId(rest);
  return id === expectedId;
}

/**
 * Get combined styles for wrapper and receiver
 * @returns {string}
 */
export function getStyles() {
  return TrefWrapper.getStyles() + TrefReceiver.getStyles();
}

// ========== Global Export ==========

if (typeof window !== 'undefined') {
  /** @type {any} */ (window).TREF = {
    // Classes
    TrefWrapper,
    TrefReceiver,

    // Functions
    publish,
    derive,
    validate,
    createDraft,
    wrap,
    unwrap,
    getStyles,

    // Constants
    TREF_ICON_SVG,
    TREF_ICON_DATA_URL,
    TREF_MIME_TYPE,
  };
}

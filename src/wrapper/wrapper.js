/**
 * @fileoverview TREF Block wrapper for display and interaction
 */

/* global btoa, navigator, Blob, URL, DataTransfer */

import { AIBlockSchema } from '../schemas/block.js';
import { TREF_EXTENSION } from '../publisher/io.js';

/**
 * @typedef {import('../schemas/block.js').AIBlock} AIBlock
 */

/**
 * SVG icon for AI-Block (purple-mint theme)
 * Can be used inline or as data URL
 */
export const TREF_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <defs>
    <linearGradient id="tref-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6"/>
      <stop offset="100%" style="stop-color:#10B981"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="20" height="20" rx="3" fill="url(#tref-gradient)"/>
  <path d="M7 8h10M7 12h10M7 16h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="17" cy="16" r="2" fill="white"/>
</svg>`;

/**
 * TREF icon as data URL for use in img src or CSS
 */
export const TREF_ICON_DATA_URL = `data:image/svg+xml,${encodeURIComponent(TREF_ICON_SVG)}`;

/**
 * MIME type for TREF files
 */
export const TREF_MIME_TYPE = 'application/vnd.aiblocks.tref+json';

/**
 * Wrapper class for TREF blocks
 * Provides methods for serialization, clipboard, and drag-and-drop
 */
export class TrefWrapper {
  /** @type {AIBlock} */
  #block;

  /**
   * Create a wrapper for a block
   * @param {AIBlock} block - Valid AIBlock to wrap
   * @throws {Error} If block is invalid
   */
  constructor(block) {
    // Validate block
    const result = AIBlockSchema.safeParse(block);
    if (!result.success) {
      throw new Error(`Invalid block: ${result.error.message}`);
    }
    this.#block = result.data;
  }

  /**
   * Get the wrapped block
   * @returns {AIBlock}
   */
  get block() {
    return this.#block;
  }

  /**
   * Get block ID
   * @returns {string}
   */
  get id() {
    return this.#block.id;
  }

  /**
   * Get short ID (first 8 chars of hash)
   * @returns {string}
   */
  get shortId() {
    return this.#block.id.replace('sha256:', '').slice(0, 8);
  }

  /**
   * Get block content
   * @returns {string}
   */
  get content() {
    return this.#block.content;
  }

  /**
   * Serialize block to JSON string
   * @param {object} [options]
   * @param {boolean} [options.pretty] - Pretty print (default: false)
   * @returns {string}
   */
  toJSON(options = {}) {
    const { pretty = false } = options;
    return pretty ? JSON.stringify(this.#block, null, 2) : JSON.stringify(this.#block);
  }

  /**
   * Get suggested filename for download
   * @returns {string}
   */
  getFilename() {
    const hash = this.#block.id.replace('sha256:', '');
    return hash + TREF_EXTENSION;
  }

  /**
   * Create a Blob for the block
   * @returns {Blob}
   */
  toBlob() {
    return new Blob([this.toJSON()], { type: TREF_MIME_TYPE });
  }

  /**
   * Create a data URL for downloading
   * @returns {string}
   */
  toDataURL() {
    const json = this.toJSON();
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return `data:${TREF_MIME_TYPE};base64,${base64}`;
  }

  /**
   * Create an object URL for downloading (browser only)
   * Remember to call URL.revokeObjectURL() after use
   * @returns {string}
   */
  toObjectURL() {
    return URL.createObjectURL(this.toBlob());
  }

  /**
   * Copy block JSON to clipboard (browser only)
   * @returns {Promise<void>}
   */
  async copyToClipboard() {
    await navigator.clipboard.writeText(this.toJSON());
  }

  /**
   * Copy block content (not full JSON) to clipboard (browser only)
   * @returns {Promise<void>}
   */
  async copyContentToClipboard() {
    await navigator.clipboard.writeText(this.#block.content);
  }

  /**
   * Get data for drag-and-drop DataTransfer
   * @returns {{ type: string, data: string }[]}
   */
  getDragData() {
    return [
      { type: TREF_MIME_TYPE, data: this.toJSON() },
      { type: 'application/json', data: this.toJSON() },
      { type: 'text/plain', data: this.#block.content },
    ];
  }

  /**
   * Set up drag data on a DataTransfer object (browser only)
   * @param {DataTransfer} dataTransfer
   */
  setDragData(dataTransfer) {
    for (const { type, data } of this.getDragData()) {
      dataTransfer.setData(type, data);
    }
  }

  /**
   * Generate HTML representation of the block
   * @param {object} [options]
   * @param {boolean} [options.includeIcon] - Include TREF icon (default: true)
   * @param {boolean} [options.includeContent] - Show content preview (default: true)
   * @param {number} [options.maxContentLength] - Max content chars (default: 200)
   * @returns {string}
   */
  toHTML(options = {}) {
    const { includeIcon = true, includeContent = true, maxContentLength = 200 } = options;

    const contentPreview =
      this.#block.content.length > maxContentLength
        ? this.#block.content.slice(0, maxContentLength) + '...'
        : this.#block.content;

    const icon = includeIcon ? `<span class="tref-icon">${TREF_ICON_SVG}</span>` : '';

    const contentHtml = includeContent
      ? `<div class="tref-content">${escapeHtml(contentPreview)}</div>`
      : '';

    return `<div class="tref-wrapper" data-tref-id="${this.#block.id}">
  <div class="tref-header">
    ${icon}
    <span class="tref-id">${this.shortId}</span>
    <span class="tref-meta">${this.#block.meta.created.split('T')[0]}</span>
  </div>
  ${contentHtml}
</div>`;
  }

  /**
   * Get CSS styles for the wrapper
   * @returns {string}
   */
  static getStyles() {
    return `
.tref-wrapper {
  font-family: system-ui, -apple-system, sans-serif;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  max-width: 400px;
}
.tref-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.tref-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
}
.tref-icon svg {
  width: 100%;
  height: 100%;
}
.tref-id {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
}
.tref-meta {
  font-size: 12px;
  color: #9ca3af;
  margin-left: auto;
}
.tref-content {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
.tref-wrapper[draggable="true"] {
  cursor: grab;
}
.tref-wrapper[draggable="true"]:active {
  cursor: grabbing;
}
`;
  }
}

/**
 * Escape HTML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Create a wrapper from block data
 * @param {unknown} data - Block data to wrap
 * @returns {TrefWrapper}
 */
export function wrap(data) {
  const block = AIBlockSchema.parse(data);
  return new TrefWrapper(block);
}

/**
 * Parse TREF data from drag-and-drop or clipboard
 * @param {DataTransfer | string} source - DataTransfer object or JSON string
 * @returns {TrefWrapper | null}
 */
export function unwrap(source) {
  try {
    let json;

    if (typeof source === 'string') {
      json = source;
    } else if (source && typeof source.getData === 'function') {
      // Try TREF MIME type first, then JSON, then plain text
      json =
        source.getData(TREF_MIME_TYPE) ||
        source.getData('application/json') ||
        source.getData('text/plain');
    } else {
      return null;
    }

    if (!json) {
      return null;
    }

    const data = /** @type {unknown} */ (JSON.parse(json));
    return wrap(data);
  } catch {
    return null;
  }
}

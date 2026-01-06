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
 * SVG icon for AI-Block (purple-mint theme with chain link)
 * Can be used inline or as data URL
 */
export const TREF_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
  <rect x="6" y="6" width="88" height="88" rx="12" ry="12" fill="#2D1B4E" stroke="#5CCCCC" stroke-width="5"/>
  <g transform="translate(50 50) scale(0.022) translate(-1125 -1125)">
    <g transform="translate(0,2250) scale(1,-1)" fill="#5CCCCC">
      <path d="M1515 2244 c-66 -10 -144 -38 -220 -77 -67 -35 -106 -67 -237 -195 -155 -152 -188 -195 -188 -247 0 -41 30 -95 64 -116 39 -24 113 -25 146 -3 14 9 90 81 170 160 183 181 216 199 350 199 83 0 103 -4 155 -28 78 -36 146 -104 182 -181 24 -53 28 -73 28 -151 0 -137 -21 -175 -199 -355 -79 -80 -151 -156 -160 -170 -39 -59 -8 -162 58 -194 81 -38 113 -22 284 147 165 163 230 252 268 370 24 71 28 99 28 202 0 106 -3 130 -28 200 -91 261 -310 428 -579 439 -50 3 -105 2 -122 0z"/>
      <path d="M1395 1585 c-17 -9 -189 -174 -382 -368 -377 -378 -383 -385 -362 -461 21 -76 87 -116 166 -101 33 6 80 49 386 353 191 191 358 362 369 381 26 42 28 109 4 146 -39 59 -118 81 -181 50z"/>
      <path d="M463 1364 c-47 -24 -323 -310 -365 -379 -20 -33 -49 -96 -64 -140 -24 -69 -28 -96 -28 -195 0 -127 14 -190 66 -294 63 -126 157 -220 284 -284 104 -52 167 -66 294 -66 99 0 126 4 195 28 44 15 107 44 140 64 65 39 348 309 371 354 41 78 -10 184 -96 203 -61 13 -98 -11 -256 -166 -186 -183 -222 -204 -359 -204 -77 0 -98 4 -147 27 -79 37 -142 98 -181 177 -29 59 -32 74 -32 156 0 136 21 174 199 355 79 80 150 156 159 170 23 33 22 107 -2 146 -35 57 -115 79 -178 48z"/>
    </g>
  </g>
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

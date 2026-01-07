/**
 * @fileoverview TREF Block wrapper for display and interaction
 * Self-contained - no external dependencies
 */

/* global btoa, navigator, Blob, URL, document */

/** File extension for TREF files */
const TREF_EXTENSION = '.tref';

/**
 * @typedef {object} AIBlock
 * @property {1} v
 * @property {string} id
 * @property {string} content
 * @property {{ author?: string, created: string, modified?: string, license: string, lang?: string }} meta
 * @property {Array<{ type: string, url?: string, title?: string, snippet?: string, query?: string }>} [refs]
 * @property {string} [parent]
 */

/**
 * SVG icon for TREF (purple-mint theme with chain link)
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

/** MIME type for TREF files */
export const TREF_MIME_TYPE = 'application/vnd.tref+json';

/** Icon as data URL for embedding */
export const TREF_ICON_DATA_URL = 'data:image/svg+xml,' + encodeURIComponent(TREF_ICON_SVG);

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
    .replace(/"/g, '&quot;');
}

/**
 * Validate block structure
 * @param {unknown} block
 * @returns {block is AIBlock}
 */
function isValidBlock(block) {
  if (!block || typeof block !== 'object') {
    return false;
  }
  const b = /** @type {Record<string, unknown>} */ (block);
  if (b.v !== 1) {
    return false;
  }
  if (typeof b.id !== 'string') {
    return false;
  }
  if (!b.id.startsWith('sha256:')) {
    return false;
  }
  if (typeof b.content !== 'string') {
    return false;
  }
  if (!b.meta || typeof b.meta !== 'object') {
    return false;
  }
  return true;
}

/**
 * TrefWrapper - displays a TREF block with drag/copy/download actions
 *
 * Design:
 * - Icon is the drag handle (only icon is draggable)
 * - Hover shows action buttons (copy, download)
 * - Status feedback in the ID badge
 */
export class TrefWrapper {
  /** @type {AIBlock} */
  #block;

  /**
   * @param {AIBlock} block
   */
  constructor(block) {
    if (!isValidBlock(block)) {
      throw new Error('Invalid TREF block');
    }
    this.#block = block;
  }

  get block() {
    return this.#block;
  }

  get id() {
    return this.#block.id;
  }

  get shortId() {
    return this.#block.id.replace('sha256:', '').slice(0, 8);
  }

  get content() {
    return this.#block.content;
  }

  /**
   * @param {{ pretty?: boolean }} [options]
   */
  toJSON(options = {}) {
    return options.pretty ? JSON.stringify(this.#block, null, 2) : JSON.stringify(this.#block);
  }

  getFilename() {
    return this.#block.id.replace('sha256:', '') + TREF_EXTENSION;
  }

  toBlob() {
    return new Blob([this.toJSON()], { type: TREF_MIME_TYPE });
  }

  toDataURL() {
    const json = this.toJSON();
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return `data:${TREF_MIME_TYPE};base64,${base64}`;
  }

  toObjectURL() {
    return URL.createObjectURL(this.toBlob());
  }

  async copyToClipboard() {
    await navigator.clipboard.writeText(this.toJSON());
  }

  async copyContentToClipboard() {
    await navigator.clipboard.writeText(this.#block.content);
  }

  getDragData() {
    const json = this.toJSON();
    return [
      { type: TREF_MIME_TYPE, data: json },
      { type: 'application/json', data: json },
      { type: 'text/plain', data: json },
    ];
  }

  /** @param {DataTransfer} dataTransfer */
  setDragData(dataTransfer) {
    for (const { type, data } of this.getDragData()) {
      dataTransfer.setData(type, data);
    }
  }

  /**
   * Generate HTML
   * @param {{ includeContent?: boolean, interactive?: boolean, maxContentLength?: number }} [options]
   */
  toHTML(options = {}) {
    const { includeContent = true, interactive = true, maxContentLength = 200 } = options;

    const preview =
      this.#block.content.length > maxContentLength
        ? this.#block.content.slice(0, maxContentLength) + '...'
        : this.#block.content;

    const contentHtml = includeContent
      ? `<div class="tref-content">${escapeHtml(preview)}</div>`
      : '';

    const refsHtml =
      this.#block.refs && this.#block.refs.length > 0
        ? `<div class="tref-refs">${this.#block.refs
            .filter(r => r.type === 'url' && r.url)
            .map(r => `<a href="${r.url}" target="_blank">${r.title || r.url}</a>`)
            .join(', ')}</div>`
        : '';

    // Hover actions: drag hint, copy, download
    const actionsHtml = interactive
      ? `<div class="tref-actions">
        <span class="tref-hint">drag me</span>
        <button class="tref-btn" data-action="copy" title="Copy JSON">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
        <button class="tref-btn" data-action="download" title="Download .tref">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        </button>
      </div>`
      : '';

    return `<div class="tref-wrapper" data-tref-id="${this.#block.id}">
  <div class="tref-header">
    <span class="tref-icon" draggable="true" title="Drag to share">${TREF_ICON_SVG}</span>
    <span class="tref-id">${this.shortId}</span>
    <span class="tref-meta">${this.#block.meta.created.split('T')[0]}</span>
    ${actionsHtml}
  </div>
  ${contentHtml}
  ${refsHtml}
</div>`;
  }

  /**
   * Attach event listeners to a rendered wrapper
   * @param {HTMLElement} element
   */
  attachEvents(element) {
    const iconEl = element.querySelector('.tref-icon');

    // Icon is drag handle
    if (iconEl) {
      /** @type {HTMLElement} */ (iconEl).addEventListener('dragstart', e => {
        const de = /** @type {DragEvent} */ (e);
        if (de.dataTransfer) {
          this.setDragData(de.dataTransfer);
          de.dataTransfer.effectAllowed = 'copy';
        }
      });
    }

    // Action buttons - use arrow function to preserve this
    const handleClick = async (/** @type {Event} */ e) => {
      e.stopPropagation();
      const action = /** @type {HTMLElement} */ (e.currentTarget).dataset.action;
      const statusEl = element.querySelector('.tref-id');
      const originalText = statusEl?.textContent || '';

      try {
        if (action === 'copy') {
          await this.copyToClipboard();
          if (statusEl) {
            statusEl.textContent = 'Copied!';
          }
        } else if (action === 'download') {
          const url = this.toObjectURL();
          const a = document.createElement('a');
          a.href = url;
          a.download = this.getFilename();
          a.click();
          URL.revokeObjectURL(url);
          if (statusEl) {
            statusEl.textContent = 'Saved!';
          }
        }
        setTimeout(() => {
          if (statusEl) {
            statusEl.textContent = originalText;
          }
        }, 1500);
      } catch {
        if (statusEl) {
          statusEl.textContent = 'Error';
        }
        setTimeout(() => {
          if (statusEl) {
            statusEl.textContent = originalText;
          }
        }, 1500);
      }
    };

    element.querySelectorAll('.tref-btn').forEach(btn => {
      btn.addEventListener('click', e => void handleClick(e));
    });
  }

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
  cursor: grab;
  transition: transform 0.15s;
}
.tref-icon:hover { transform: scale(1.1); }
.tref-icon:active { cursor: grabbing; }
.tref-icon svg { width: 100%; height: 100%; }
.tref-id {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}
.tref-meta { font-size: 12px; color: #9ca3af; }
.tref-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}
.tref-wrapper:hover .tref-actions { opacity: 1; }
.tref-hint {
  font-size: 11px;
  color: #9ca3af;
  margin-right: 4px;
}
.tref-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.tref-btn:hover {
  background: #e5e7eb;
  color: #374151;
}
.tref-content {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
.tref-refs {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
}
.tref-refs a { color: #5CCCCC; text-decoration: none; }
.tref-refs a:hover { text-decoration: underline; }
`;
  }
}

/**
 * TrefReceiver - drop zone for TREF blocks
 */
export class TrefReceiver {
  /** @type {HTMLElement} */
  #element;
  /** @type {(wrapper: TrefWrapper) => void} */
  #onReceive;
  /** @type {(error: Error) => void} */
  #onError;

  /**
   * @param {HTMLElement} element
   * @param {{ onReceive?: (wrapper: TrefWrapper) => void, onError?: (error: Error) => void }} [options]
   */
  constructor(element, options = {}) {
    this.#element = element;
    this.#onReceive = options.onReceive || (() => {});
    this.#onError = options.onError || (() => {});
    this.#setup();
  }

  #setup() {
    const el = this.#element;
    el.classList.add('tref-receiver');

    el.addEventListener('dragover', e => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      el.classList.add('tref-receiver-active');
    });

    el.addEventListener('dragleave', () => {
      el.classList.remove('tref-receiver-active');
    });

    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('tref-receiver-active');

      if (!e.dataTransfer) {
        this.#onError(new Error('No data'));
        return;
      }

      const wrapper = unwrap(e.dataTransfer);
      if (wrapper) {
        el.classList.add('tref-receiver-success');
        setTimeout(() => el.classList.remove('tref-receiver-success'), 1000);
        this.#onReceive(wrapper);
      } else {
        el.classList.add('tref-receiver-error');
        setTimeout(() => el.classList.remove('tref-receiver-error'), 1000);
        this.#onError(new Error('Invalid TREF data'));
      }
    });
  }

  get element() {
    return this.#element;
  }

  /**
   * Display a block in the receiver
   * @param {TrefWrapper} wrapper
   */
  showBlock(wrapper) {
    this.#element.innerHTML = wrapper.toHTML();
    this.#element.classList.add('tref-receiver-has-block');
  }

  clear() {
    this.#element.innerHTML = this.#element.dataset.placeholder || 'Drop TREF here';
    this.#element.classList.remove('tref-receiver-has-block');
  }

  static getStyles() {
    return `
.tref-receiver {
  border: 2px dashed #5CCCCC;
  border-radius: 8px;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: #f9fafb;
  transition: all 0.2s;
}
.tref-receiver-active {
  border-color: #8B5CF6;
  background: #f3e8ff;
  color: #8B5CF6;
}
.tref-receiver-success {
  border-color: #10B981;
  background: #ecfdf5;
}
.tref-receiver-error {
  border-color: #ef4444;
  background: #fef2f2;
}
.tref-receiver-has-block {
  border-style: solid;
  background: white;
}
`;
  }
}

/**
 * Create wrapper from block data
 * @param {unknown} data
 * @returns {TrefWrapper}
 */
export function wrap(data) {
  return new TrefWrapper(/** @type {AIBlock} */ (data));
}

/**
 * Parse TREF from DataTransfer or string
 * @param {DataTransfer | string} source
 * @returns {TrefWrapper | null}
 */
export function unwrap(source) {
  try {
    let json;
    if (typeof source === 'string') {
      json = source;
    } else if (source && typeof source.getData === 'function') {
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
    return wrap(JSON.parse(json));
  } catch {
    return null;
  }
}

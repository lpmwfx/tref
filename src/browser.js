/**
 * @fileoverview Browser bundle entry point for TREF
 *
 * Use via CDN: <script src="https://tref.lpmwfx.com/js/tref.min.js"></script>
 *
 * Exports to window.TREF
 */

/* global window, crypto, TextEncoder */

// ========== Constants ==========

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

export const TREF_MIME_TYPE = 'application/vnd.aiblocks.tref+json';

// ========== Utility Functions ==========

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

// ========== Block Types ==========

/**
 * @typedef {object} Ref
 * @property {'url' | 'archive' | 'search' | 'hash'} type
 * @property {string} [url]
 * @property {string} [label]
 * @property {string} [content]
 * @property {string} [query]
 * @property {string} [algorithm]
 * @property {string} [value]
 */

/**
 * @typedef {object} BlockMeta
 * @property {string} [author]
 * @property {string} created
 * @property {string} [modified]
 * @property {string} license
 */

/**
 * @typedef {object} AIBlock
 * @property {1} v
 * @property {string} id
 * @property {string} content
 * @property {BlockMeta} meta
 * @property {Ref[]} [refs]
 * @property {string} [parent]
 */

// ========== Core Functions ==========

/**
 * Create a draft block (without ID)
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {Ref[]} [options.refs]
 * @param {string} [options.parent]
 * @returns {Omit<AIBlock, 'id'>}
 */
export function createDraft(content, options = {}) {
  /** @type {Omit<AIBlock, 'id'>} */
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
 * Generate block ID from content
 * @param {Omit<AIBlock, 'id'>} draft
 * @returns {Promise<string>}
 */
async function generateId(draft) {
  const canonical = JSON.stringify(sortKeys(draft));
  const hash = await sha256(canonical);
  return `sha256:${hash}`;
}

/**
 * Publish content to a TREF block
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {Ref[]} [options.refs]
 * @returns {Promise<AIBlock>}
 */
export async function publish(content, options = {}) {
  const draft = createDraft(content, options);
  const id = await generateId(draft);
  return /** @type {AIBlock} */ ({ ...draft, id });
}

/**
 * Derive a new block from a parent
 * @param {AIBlock} parent
 * @param {string} content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {Ref[]} [options.refs]
 * @returns {Promise<AIBlock>}
 */
export async function derive(parent, content, options = {}) {
  const refs = [...(parent.refs || []), ...(options.refs || [])];
  const draft = createDraft(content, {
    author: options.author,
    license: options.license || parent.meta.license,
    refs: refs.length > 0 ? refs : undefined,
    parent: parent.id,
  });
  const id = await generateId(draft);
  return /** @type {AIBlock} */ ({ ...draft, id });
}

/**
 * Validate a block's integrity
 * @param {AIBlock} block
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validate(block) {
  try {
    const { id, ...rest } = block;
    const expectedId = await generateId(rest);
    if (id !== expectedId) {
      return { valid: false, error: `ID mismatch: expected ${expectedId}` };
    }
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, error: message };
  }
}

// ========== TrefWrapper Class ==========

/**
 * Wrapper class for displaying and interacting with TREF blocks
 */
export class TrefWrapper {
  /** @type {AIBlock} */
  #block;

  /**
   * @param {AIBlock} block
   */
  constructor(block) {
    if (!block || block.v !== 1 || !block.id || !block.content) {
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
    return options.pretty
      ? JSON.stringify(this.#block, null, 2)
      : JSON.stringify(this.#block);
  }

  getFilename() {
    return this.#block.id.replace('sha256:', '') + '.tref';
  }

  toBlob() {
    return new Blob([this.toJSON()], { type: TREF_MIME_TYPE });
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
   * @param {{ maxContentLength?: number, interactive?: boolean }} [options]
   */
  toHTML(options = {}) {
    const { maxContentLength = 200, interactive = true } = options;
    const preview =
      this.#block.content.length > maxContentLength
        ? this.#block.content.slice(0, maxContentLength) + '...'
        : this.#block.content;

    const refsHtml =
      this.#block.refs && this.#block.refs.length > 0
        ? `<div class="tref-refs">
        <strong>Refs:</strong> ${this.#block.refs
          .filter(r => r.type === 'url' && r.url)
          .map(r => `<a href="${r.url}" target="_blank">${r.label || r.url}</a>`)
          .join(', ')}
      </div>`
        : '';

    const menuHtml = interactive
      ? `<div class="tref-menu">
        <button class="tref-menu-btn" title="Actions">⋮</button>
        <div class="tref-menu-dropdown">
          <button class="tref-action" data-action="copy-content">📋 Copy Content</button>
          <button class="tref-action" data-action="copy-json">📄 Copy JSON</button>
          <button class="tref-action" data-action="download">⬇️ Download .tref</button>
          <button class="tref-action" data-action="verify">✓ Verify Block</button>
        </div>
      </div>`
      : '';

    return `<div class="tref-wrapper" data-tref-id="${this.#block.id}">
  <div class="tref-header">
    <span class="tref-icon">${TREF_ICON_SVG}</span>
    <span class="tref-id">${this.shortId}</span>
    <span class="tref-meta">${this.#block.meta.created.split('T')[0]}</span>
    ${menuHtml}
  </div>
  <div class="tref-content">${escapeHtml(preview)}</div>
  ${refsHtml}
</div>`;
  }

  /**
   * Attach interactive event listeners to a rendered wrapper element
   * @param {HTMLElement} element - The .tref-wrapper element
   */
  attachEvents(element) {
    const menuBtn = element.querySelector('.tref-menu-btn');
    const dropdown = element.querySelector('.tref-menu-dropdown');
    const wrapper = this;

    if (menuBtn && dropdown) {
      menuBtn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      // Close on outside click
      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }

    element.querySelectorAll('.tref-action').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const action = /** @type {HTMLElement} */ (e.currentTarget).dataset.action;
        const statusEl = element.querySelector('.tref-id');
        const originalText = statusEl?.textContent || '';

        try {
          switch (action) {
            case 'copy-content':
              await wrapper.copyContentToClipboard();
              if (statusEl) statusEl.textContent = 'Copied!';
              break;
            case 'copy-json':
              await wrapper.copyToClipboard();
              if (statusEl) statusEl.textContent = 'Copied!';
              break;
            case 'download': {
              const url = wrapper.toObjectURL();
              const a = document.createElement('a');
              a.href = url;
              a.download = wrapper.getFilename();
              a.click();
              URL.revokeObjectURL(url);
              if (statusEl) statusEl.textContent = 'Downloaded!';
              break;
            }
            case 'verify': {
              const valid = await validate(wrapper.block);
              if (statusEl) statusEl.textContent = valid ? '✓ Valid!' : '✗ Invalid';
              break;
            }
          }
          setTimeout(() => {
            if (statusEl) statusEl.textContent = originalText;
          }, 1500);
        } catch (err) {
          if (statusEl) statusEl.textContent = 'Error';
          setTimeout(() => {
            if (statusEl) statusEl.textContent = originalText;
          }, 1500);
        }

        if (dropdown) dropdown.classList.remove('show');
      });
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
  position: relative;
}
.tref-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.tref-icon { display: inline-flex; width: 24px; height: 24px; }
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
.tref-menu { margin-left: auto; position: relative; }
.tref-menu-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: #6b7280;
  line-height: 1;
}
.tref-menu-btn:hover { background: #e5e7eb; }
.tref-menu-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}
.tref-menu-dropdown.show { display: block; }
.tref-action {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
}
.tref-action:hover { background: #f3f4f6; }
.tref-action:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
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
.tref-wrapper[draggable="true"] { cursor: grab; }
.tref-wrapper[draggable="true"]:active { cursor: grabbing; }`;
  }
}

// ========== TrefReceiver Class ==========

/**
 * Drop zone component for receiving TREF blocks
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
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
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

  /** @param {TrefWrapper} wrapper */
  showBlock(wrapper) {
    this.#element.innerHTML = wrapper.toHTML();
    this.#element.classList.add('tref-receiver-has-block');
  }

  clear() {
    this.#element.innerHTML =
      this.#element.dataset.placeholder || 'Drop TREF here';
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
}`;
  }
}

// ========== Helper Functions ==========

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
    }
    if (!json) return null;

    const data = JSON.parse(json);
    if (data.v === 1 && data.id && data.content) {
      return new TrefWrapper(data);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all TREF CSS styles
 * @returns {string}
 */
export function getStyles() {
  return TrefWrapper.getStyles() + TrefReceiver.getStyles();
}

// ========== Global Export ==========

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.TREF = {
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
    TREF_MIME_TYPE,
  };
}

/**
 * @fileoverview TREF Block wrapper for display and interaction
 * Self-contained - no external dependencies
 *
 * AUTO-INITIALIZATION:
 * CSS is automatically injected when this module loads.
 * No manual setup required - just import and use.
 */

/* global btoa, navigator, Blob, URL, document */

/** File extension for TREF files */
const TREF_EXTENSION = '.tref';

/** Track if CSS has been injected */
let cssInjected = false;

/**
 * Auto-inject CSS into document head (runs once on module load)
 */
function autoInjectCSS() {
  if (cssInjected || typeof document === 'undefined') {
    return;
  }
  if (document.getElementById('tref-auto-styles')) {
    cssInjected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = 'tref-auto-styles';
  style.textContent = TrefWrapper.getStyles();
  document.head.appendChild(style);
  cssInjected = true;
}

/**
 * @typedef {object} TrefBlock
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
 * SVG icon for invalid TREF block (with red X overlay)
 */
export const TREF_ICON_INVALID_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
  <rect x="6" y="6" width="88" height="88" rx="12" ry="12" fill="#2D1B4E" stroke="#ef4444" stroke-width="5"/>
  <g transform="translate(50 50) scale(0.022) translate(-1125 -1125)">
    <g transform="translate(0,2250) scale(1,-1)" fill="#6b7280">
      <path d="M1515 2244 c-66 -10 -144 -38 -220 -77 -67 -35 -106 -67 -237 -195 -155 -152 -188 -195 -188 -247 0 -41 30 -95 64 -116 39 -24 113 -25 146 -3 14 9 90 81 170 160 183 181 216 199 350 199 83 0 103 -4 155 -28 78 -36 146 -104 182 -181 24 -53 28 -73 28 -151 0 -137 -21 -175 -199 -355 -79 -80 -151 -156 -160 -170 -39 -59 -8 -162 58 -194 81 -38 113 -22 284 147 165 163 230 252 268 370 24 71 28 99 28 202 0 106 -3 130 -28 200 -91 261 -310 428 -579 439 -50 3 -105 2 -122 0z"/>
      <path d="M1395 1585 c-17 -9 -189 -174 -382 -368 -377 -378 -383 -385 -362 -461 21 -76 87 -116 166 -101 33 6 80 49 386 353 191 191 358 362 369 381 26 42 28 109 4 146 -39 59 -118 81 -181 50z"/>
      <path d="M463 1364 c-47 -24 -323 -310 -365 -379 -20 -33 -49 -96 -64 -140 -24 -69 -28 -96 -28 -195 0 -127 14 -190 66 -294 63 -126 157 -220 284 -284 104 -52 167 -66 294 -66 99 0 126 4 195 28 44 15 107 44 140 64 65 39 348 309 371 354 41 78 -10 184 -96 203 -61 13 -98 -11 -256 -166 -186 -183 -222 -204 -359 -204 -77 0 -98 4 -147 27 -79 37 -142 98 -181 177 -29 59 -32 74 -32 156 0 136 21 174 199 355 79 80 150 156 159 170 23 33 22 107 -2 146 -35 57 -115 79 -178 48z"/>
    </g>
  </g>
  <line x1="25" y1="25" x2="75" y2="75" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
  <line x1="75" y1="25" x2="25" y2="75" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
</svg>`;

/**
 * Escape HTML special characters
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// Reserved for future use (content escaping)
void _escapeHtml;

/**
 * Validate block structure
 * @param {unknown} block
 * @returns {block is TrefBlock}
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
  /** @type {TrefBlock} */
  #block;

  /**
   * @param {TrefBlock} block
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

  /**
   * Validate block integrity by checking SHA-256 hash
   * @returns {Promise<{ valid: boolean, expected?: string, actual?: string }>}
   */
  async validate() {
    const content = this.#block.content;
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const expectedId = `sha256:${hashHex}`;
    const actualId = this.#block.id;

    if (expectedId === actualId) {
      return { valid: true };
    }
    return {
      valid: false,
      expected: expectedId,
      actual: actualId,
    };
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
   * Generate HTML - icon only with hover actions
   * @param {{ interactive?: boolean }} [options]
   */
  toHTML(options = {}) {
    const { interactive = true } = options;

    // SVG icons for actions
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const iconJson = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"></path><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"></path><circle cx="12" cy="12" r="1" fill="currentColor"></circle><circle cx="8" cy="12" r="1" fill="currentColor"></circle><circle cx="16" cy="12" r="1" fill="currentColor"></circle></svg>`;
    const iconDownload = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
    const iconHistory = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`;

    // Hover actions appear on hover
    const actionsHtml = interactive
      ? `<div class="tref-actions" role="group" aria-label="Block actions">
          <button class="tref-action" data-action="copy-content" title="Copy content" aria-label="Copy content to clipboard">${iconCopy}</button>
          <button class="tref-action" data-action="copy-json" title="Copy JSON" aria-label="Copy JSON to clipboard">${iconJson}</button>
          <button class="tref-action" data-action="download" title="Download .tref" aria-label="Download as .tref file">${iconDownload}</button>
          <button class="tref-action" data-action="history" title="Version history" aria-label="Show version history">${iconHistory}</button>
        </div>`
      : '';

    return `<div class="tref-wrapper" data-tref-id="${this.#block.id}">
  <span class="tref-icon"
        role="button"
        aria-label="TREF block - drag to share"
        tabindex="0"
        draggable="true"
        title="Drag to share">${TREF_ICON_SVG}</span>
  ${actionsHtml}
</div>`;
  }

  /**
   * Mark the block as invalid (swap icon, add warning)
   * @param {HTMLElement} element
   */
  #markAsInvalid(element) {
    const iconEl = element.querySelector('.tref-icon');
    if (iconEl) {
      iconEl.innerHTML = TREF_ICON_INVALID_SVG;
      iconEl.setAttribute('title', 'Invalid - content has been modified');
      iconEl.setAttribute('aria-label', 'Invalid TREF block - content has been modified');
    }

    // Add warning to actions menu
    const actions = element.querySelector('.tref-actions');
    if (actions) {
      const warning = document.createElement('span');
      warning.className = 'tref-warning';
      warning.textContent = 'Modified content';
      warning.setAttribute('title', 'SHA-256 hash does not match - content was changed');
      actions.insertBefore(warning, actions.firstChild);
    }

    element.classList.add('tref-invalid');
  }

  /**
   * Toggle actions visibility (for keyboard/touch)
   * @param {HTMLElement} element
   */
  #toggleActions(element) {
    const actions = element.querySelector('.tref-actions');
    if (actions) {
      const actionsEl = /** @type {HTMLElement} */ (actions);
      const isVisible = actionsEl.style.opacity === '1';
      actionsEl.style.opacity = isVisible ? '0' : '1';
      if (!isVisible) {
        // Focus first action button
        const firstBtn = actionsEl.querySelector('button');
        if (firstBtn) {
          /** @type {HTMLElement} */ (firstBtn).focus();
        }
      }
    }
  }

  /**
   * @typedef {{ v: number, id: string, date: string }} HistoryVersion
   * @typedef {{ current: string, versions: HistoryVersion[] }} HistoryData
   */

  /**
   * Show history popup
   * @param {string} historyUrl
   * @param {HTMLElement} element
   */
  async #showHistoryPopup(historyUrl, element) {
    // Remove any existing popup
    const existing = document.querySelector('.tref-history-popup');
    if (existing) {
      existing.remove();
    }

    // Fetch history
    const response = await fetch(historyUrl);
    if (!response.ok) {
      throw new Error('Failed to load history');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const history = /** @type {HistoryData} */ (await response.json());

    // Build popup HTML
    /** @type {HistoryVersion[]} */
    const versions = history.versions || [];
    const currentId = this.#block.id;

    const versionsList = versions
      .map(v => {
        const isCurrent = v.id === currentId;
        const shortId = v.id.replace('sha256:', '').slice(0, 8);
        return `<li class="tref-history-item${isCurrent ? ' tref-history-current' : ''}">
          <span class="tref-history-version">v${v.v}</span>
          <span class="tref-history-date">${v.date}</span>
          <code class="tref-history-id">${shortId}</code>
          ${isCurrent ? '<span class="tref-history-badge">current</span>' : ''}
        </li>`;
      })
      .join('');

    const popup = document.createElement('div');
    popup.className = 'tref-history-popup';
    popup.innerHTML = `
      <div class="tref-history-header">
        <span>Version History</span>
        <button class="tref-history-close" aria-label="Close">&times;</button>
      </div>
      <ul class="tref-history-list">${versionsList}</ul>
    `;

    // Position popup
    const rect = element.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = `${rect.bottom + 8}px`;
    popup.style.left = `${rect.left}px`;

    document.body.appendChild(popup);

    // Close button
    popup.querySelector('.tref-history-close')?.addEventListener('click', () => {
      popup.remove();
    });

    // Close on click outside
    const closeOnOutside = (/** @type {MouseEvent} */ e) => {
      if (!popup.contains(/** @type {Node} */ (e.target))) {
        popup.remove();
        document.removeEventListener('click', closeOnOutside);
      }
    };
    setTimeout(() => document.addEventListener('click', closeOnOutside), 0);

    // Close on Escape
    const closeOnEscape = (/** @type {KeyboardEvent} */ e) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', closeOnEscape);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
  }

  /**
   * Attach event listeners to a rendered wrapper
   * @param {HTMLElement} element
   * @param {{ validateOnAttach?: boolean }} [options]
   */
  attachEvents(element, options = {}) {
    const { validateOnAttach = true } = options;
    const iconEl = element.querySelector('.tref-icon');

    // Run validation on attach
    if (validateOnAttach) {
      void this.validate().then(result => {
        if (!result.valid) {
          this.#markAsInvalid(element);
        }
      });
    }

    // Icon is drag handle
    if (iconEl) {
      const icon = /** @type {HTMLElement} */ (iconEl);

      icon.addEventListener('dragstart', e => {
        const de = /** @type {DragEvent} */ (e);
        if (de.dataTransfer) {
          this.setDragData(de.dataTransfer);
          de.dataTransfer.effectAllowed = 'copy';
        }
      });

      // Keyboard: Enter/Space shows actions or triggers default action
      icon.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.#toggleActions(element);
        }
      });

      // Touch: detect if touch device for copy-paste flow
      const isTouch = window.matchMedia('(pointer: coarse)').matches;

      /** @type {ReturnType<typeof setTimeout> | undefined} */
      let touchTimer;
      let touchCopied = false;

      icon.addEventListener('touchstart', () => {
        touchCopied = false;
        touchTimer = setTimeout(async () => {
          // Long-press (300ms) → copy to clipboard
          touchCopied = true;
          icon.classList.add('touch-selected');

          try {
            await this.copyToClipboard();
            this.#showCopiedPopup(element);
          } catch {
            // Clipboard failed silently
          }

          // Reset visual after delay
          setTimeout(() => {
            icon.classList.remove('touch-selected');
          }, 300);
        }, 300);
      });

      icon.addEventListener('touchend', e => {
        clearTimeout(touchTimer);
        if (!touchCopied) {
          // Short tap → toggle menu
          e.preventDefault();
          this.#toggleActions(element);
        }
        touchCopied = false;
      });

      icon.addEventListener('touchcancel', () => {
        clearTimeout(touchTimer);
        icon.classList.remove('touch-selected');
        touchCopied = false;
      });
    }

    // Action buttons (visible on hover via CSS)
    const handleAction = async (/** @type {Event} */ e) => {
      e.stopPropagation();
      const btn = /** @type {HTMLElement} */ (e.currentTarget);
      const action = btn.dataset.action;
      const originalHtml = btn.innerHTML;

      const iconCheck = `<svg class="tref-icon-success" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      const iconError = `<svg class="tref-icon-error" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

      try {
        if (action === 'copy-content') {
          await this.copyContentToClipboard();
          btn.innerHTML = iconCheck;
        } else if (action === 'copy-json') {
          await this.copyToClipboard();
          btn.innerHTML = iconCheck;
        } else if (action === 'download') {
          const url = this.toObjectURL();
          const a = document.createElement('a');
          a.href = url;
          a.download = this.getFilename();
          a.click();
          URL.revokeObjectURL(url);
          btn.innerHTML = iconCheck;
        } else if (action === 'history') {
          const historyUrl = element.dataset.history;
          if (historyUrl) {
            await this.#showHistoryPopup(historyUrl, element);
          } else {
            throw new Error('No history URL');
          }
          return; // Don't show check icon
        }
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 1000);
      } catch {
        btn.innerHTML = iconError;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 1000);
      }
    };

    element.querySelectorAll('.tref-action').forEach(btn => {
      btn.addEventListener('click', e => void handleAction(e));
    });
  }

  static getStyles() {
    return `
:root {
  --tref-accent: #5CCCCC;
  --tref-accent-hover: #8B5CF6;
  --tref-success: #10B981;
  --tref-error: #ef4444;
  --tref-menu-bg: #ffffff;
  --tref-menu-text: #374151;
  --tref-menu-hover: #f3f4f6;
  --tref-menu-shadow: 0 4px 12px rgba(0,0,0,0.15);
  --tref-receiver-bg: #f9fafb;
  --tref-receiver-text: #6b7280;
  --tref-receiver-active-bg: #f3e8ff;
  --tref-receiver-success-bg: #ecfdf5;
  --tref-receiver-error-bg: #fef2f2;
  --tref-receiver-block-bg: #ffffff;
}
.dark {
  --tref-menu-bg: #1f2937;
  --tref-menu-text: #e5e7eb;
  --tref-menu-hover: #374151;
  --tref-menu-shadow: 0 4px 12px rgba(0,0,0,0.4);
  --tref-receiver-bg: #1f2937;
  --tref-receiver-text: #9ca3af;
  --tref-receiver-active-bg: #3b2d5e;
  --tref-receiver-success-bg: #064e3b;
  --tref-receiver-error-bg: #450a0a;
  --tref-receiver-block-bg: #111827;
}
.tref-wrapper {
  display: inline-block;
  position: relative;
}
.tref-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  cursor: grab;
  transition: transform 0.15s;
}
.tref-icon:hover { transform: scale(1.1); }
.tref-icon:active { cursor: grabbing; }
.tref-icon svg { width: 100%; height: 100%; }
.tref-actions {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: var(--tref-menu-bg);
  border-radius: 6px;
  box-shadow: var(--tref-menu-shadow);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
  z-index: 100;
  margin-top: 4px;
}
.tref-wrapper:hover .tref-actions {
  opacity: 1;
  visibility: visible;
}
.tref-action {
  background: transparent;
  border: none;
  outline: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--tref-menu-text);
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.tref-action svg {
  width: 16px;
  height: 16px;
}
.tref-action:hover { background: var(--tref-menu-hover); }
.tref-action:focus { outline: none; }
.tref-action:focus-visible {
  outline: 2px solid var(--tref-accent);
  outline-offset: 1px;
}
.tref-icon:focus { outline: none; }
.tref-icon:focus-visible {
  outline: 2px solid var(--tref-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
.tref-icon-success { color: var(--tref-success); }
.tref-icon-error { color: var(--tref-error); }
/* Invalid block warning */
.tref-invalid .tref-icon { opacity: 0.8; }
.tref-warning {
  font-size: 11px;
  color: var(--tref-error);
  padding: 4px 8px;
  background: var(--tref-receiver-error-bg);
  border-radius: 4px;
  white-space: nowrap;
}
/* History popup */
.tref-history-popup {
  background: var(--tref-menu-bg);
  border-radius: 8px;
  box-shadow: var(--tref-menu-shadow);
  min-width: 220px;
  max-width: 300px;
  z-index: 1000;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}
.tref-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--tref-menu-hover);
  font-weight: 600;
  color: var(--tref-menu-text);
}
.tref-history-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--tref-menu-text);
  padding: 0 4px;
  line-height: 1;
}
.tref-history-close:hover { color: var(--tref-error); }
.tref-history-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.tref-history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: var(--tref-menu-text);
}
.tref-history-item:hover {
  background: var(--tref-menu-hover);
}
.tref-history-current {
  background: var(--tref-receiver-active-bg);
}
.tref-history-version {
  font-weight: 600;
  color: var(--tref-accent);
}
.tref-history-date {
  color: var(--tref-receiver-text);
}
.tref-history-id {
  font-family: monospace;
  font-size: 11px;
  background: var(--tref-menu-hover);
  padding: 2px 4px;
  border-radius: 3px;
}
.tref-history-badge {
  font-size: 10px;
  background: var(--tref-accent);
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}
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
  /** @type {boolean} */
  #compact;

  /**
   * @param {HTMLElement} element
   * @param {{ onReceive?: (wrapper: TrefWrapper) => void, onError?: (error: Error) => void, compact?: boolean }} [options]
   */
  constructor(element, options = {}) {
    this.#element = element;
    this.#onReceive = options.onReceive || (() => {});
    this.#onError = options.onError || (() => {});
    this.#compact = options.compact || false;
    this.#setup();
  }

  #setup() {
    const el = this.#element;
    el.classList.add('tref-receiver');
    if (this.#compact) {
      el.classList.add('tref-receiver-compact');
    }
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Drop zone for TREF blocks');
    el.setAttribute('aria-dropeffect', 'copy');

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
  border: 2px dashed var(--tref-accent);
  border-radius: 8px;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tref-receiver-text);
  background: var(--tref-receiver-bg);
  transition: all 0.2s;
}
.tref-receiver-active {
  border-color: var(--tref-accent-hover);
  background: var(--tref-receiver-active-bg);
  color: var(--tref-accent-hover);
}
.tref-receiver-success {
  border-color: var(--tref-success);
  background: var(--tref-receiver-success-bg);
}
.tref-receiver-error {
  border-color: var(--tref-error);
  background: var(--tref-receiver-error-bg);
}
.tref-receiver-has-block {
  border-style: solid;
  background: var(--tref-receiver-block-bg);
}
.tref-receiver-compact {
  width: 32px;
  height: 32px;
  min-height: 32px;
  padding: 0;
  border-radius: 4px;
}
/* Touch devices - larger hit areas */
@media (pointer: coarse) {
  .tref-icon {
    min-width: 44px;
    min-height: 44px;
  }
  .tref-action {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
  .tref-receiver-compact {
    width: 48px;
    height: 48px;
    min-height: 48px;
  }
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
  return new TrefWrapper(/** @type {TrefBlock} */ (data));
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

/**
 * Validate a TREF block's integrity (standalone function)
 * @param {TrefBlock} block - Block to validate
 * @returns {Promise<{ valid: boolean, expected?: string, actual?: string }>}
 */
export async function validateBlock(block) {
  if (!isValidBlock(block)) {
    return { valid: false, actual: 'invalid block structure' };
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(block.content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const expectedId = `sha256:${hashHex}`;

  if (expectedId === block.id) {
    return { valid: true };
  }
  return {
    valid: false,
    expected: expectedId,
    actual: block.id,
  };
}

// Auto-inject CSS when module loads in browser
autoInjectCSS();

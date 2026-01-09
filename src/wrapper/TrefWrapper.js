/**
 * @fileoverview TrefWrapper - displays a TREF block with drag/copy/download actions
 */

/* global btoa, navigator, Blob, URL, document */

import {
  TREF_EXTENSION,
  TREF_MIME_TYPE,
  TREF_ICON_SVG,
  TREF_ICON_INVALID_SVG,
  isValidBlock,
  SHARED_CSS_VARS,
} from './shared.js';

/** @typedef {import('./shared.js').TrefBlock} TrefBlock */

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
   * Show "Copied ✓" popup on touch copy
   * @param {HTMLElement} element
   */
  #showCopiedPopup(element) {
    // Remove any existing popup
    const existing = element.querySelector('.tref-copied-popup');
    if (existing) {
      existing.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'tref-copied-popup';
    popup.textContent = 'Copied ✓';
    popup.setAttribute('role', 'status');
    popup.setAttribute('aria-live', 'polite');

    element.appendChild(popup);

    // Auto-remove after animation
    setTimeout(() => {
      popup.remove();
    }, 1500);
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

      // Touch: copy-paste flow for touch devices
      /** @type {ReturnType<typeof setTimeout> | undefined} */
      let touchTimer;
      let touchCopied = false;

      icon.addEventListener('touchstart', () => {
        touchCopied = false;
        touchTimer = setTimeout(() => {
          // Long-press (300ms) → copy to clipboard
          touchCopied = true;
          icon.classList.add('touch-selected');

          void this.copyToClipboard()
            .then(() => {
              this.#showCopiedPopup(element);
            })
            .catch(() => {
              // Clipboard failed silently
            });

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

    // Smart menu positioning on hover
    const actionsEl = element.querySelector('.tref-actions');
    if (actionsEl) {
      const actions = /** @type {HTMLElement} */ (actionsEl);

      element.addEventListener('mouseenter', () => {
        // Reset to default centered position first
        actions.style.left = '50%';
        actions.style.right = 'auto';
        actions.style.transform = 'translateX(-50%)';
        actions.style.top = '100%';
        actions.style.bottom = 'auto';

        // Wait for next frame so browser calculates position
        requestAnimationFrame(() => {
          const rect = actions.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const padding = 8; // Minimum distance from edge

          // Check horizontal overflow
          if (rect.left < padding) {
            // Overflows left - align to left edge
            actions.style.left = '0';
            actions.style.transform = 'none';
          } else if (rect.right > viewportWidth - padding) {
            // Overflows right - align to right edge
            actions.style.left = 'auto';
            actions.style.right = '0';
            actions.style.transform = 'none';
          }

          // Check vertical overflow (menu below viewport)
          if (rect.bottom > viewportHeight - padding) {
            // Show above instead of below
            actions.style.top = 'auto';
            actions.style.bottom = '100%';
            actions.style.marginTop = '0';
            actions.style.marginBottom = '4px';
          }
        });
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
    return `${SHARED_CSS_VARS}
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
/* Touch selection state */
.tref-icon.touch-selected {
  box-shadow: 0 0 0 3px var(--tref-accent);
  transform: scale(1.1);
  border-radius: 6px;
}
/* Copied popup */
.tref-copied-popup {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tref-success);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  animation: tref-fade-out 1.5s ease-out forwards;
  z-index: 1000;
}
@keyframes tref-fade-out {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
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

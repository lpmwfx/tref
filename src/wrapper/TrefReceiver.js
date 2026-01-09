/**
 * @fileoverview TrefReceiver - drop zone for TREF blocks
 */

/* global navigator, window */

import { TREF_MIME_TYPE, SHARED_CSS_VARS } from './shared.js';
import { TrefWrapper } from './TrefWrapper.js';

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

    // Desktop drag-and-drop
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

    // Touch paste support
    this.#setupTouchPaste();
  }

  /**
   * Setup touch paste flow:
   * 1. First tap → "Tap to paste" indicator
   * 2. Second tap (within 3s) → paste from clipboard
   */
  #setupTouchPaste() {
    const el = this.#element;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (!isTouch) {
      return;
    }

    let waitingForPaste = false;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let pasteTimeout;

    el.addEventListener('click', () => {
      if (!waitingForPaste) {
        // First tap - ready state
        waitingForPaste = true;
        el.classList.add('touch-ready');

        pasteTimeout = setTimeout(() => {
          waitingForPaste = false;
          el.classList.remove('touch-ready');
        }, 3000);
      } else {
        // Second tap - paste
        clearTimeout(pasteTimeout);

        void navigator.clipboard
          .readText()
          .then(text => {
            const wrapper = unwrap(text);

            if (wrapper) {
              this.#onReceive(wrapper);
              el.classList.remove('touch-ready');
              el.classList.add('tref-receiver-success');

              setTimeout(() => {
                el.classList.remove('tref-receiver-success');
              }, 1000);
            } else {
              throw new Error('Invalid TREF data in clipboard');
            }
          })
          .catch((/** @type {unknown} */ err) => {
            this.#onError(err instanceof Error ? err : new Error('Clipboard read failed'));
            el.classList.remove('touch-ready');
            el.classList.add('tref-receiver-error');

            setTimeout(() => {
              el.classList.remove('tref-receiver-error');
            }, 1000);
          })
          .finally(() => {
            waitingForPaste = false;
          });
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
    return `${SHARED_CSS_VARS}
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
  position: relative;
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
/* Touch ready state */
.tref-receiver.touch-ready {
  border-color: var(--tref-accent);
  background: rgba(92, 204, 204, 0.15);
  border-style: solid;
}
.tref-receiver.touch-ready::after {
  content: "Tap to paste";
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tref-accent);
  color: #2D1B4E;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  animation: tref-pulse 1s ease-in-out infinite;
}
@keyframes tref-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
/* Touch devices - larger hit areas */
@media (pointer: coarse) {
  .tref-receiver-compact {
    width: 48px;
    height: 48px;
    min-height: 48px;
  }
  .tref-receiver {
    min-height: 60px;
  }
}
`;
  }
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = /** @type {import('./shared.js').TrefBlock} */ (JSON.parse(json));
    return new TrefWrapper(data);
  } catch {
    return null;
  }
}

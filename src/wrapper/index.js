/**
 * @fileoverview TREF Block wrapper - entry point
 *
 * AUTO-INITIALIZATION:
 * CSS is automatically injected when this module loads.
 * No manual setup required - just import and use.
 */

/* global document */

// Re-export everything from modules
export {
  TREF_EXTENSION,
  TREF_MIME_TYPE,
  TREF_ICON_SVG,
  TREF_ICON_INVALID_SVG,
  TREF_ICON_DATA_URL,
  isValidBlock,
  validateBlock,
  escapeHtml,
} from './shared.js';

export { TrefWrapper, wrap } from './TrefWrapper.js';
export { TrefReceiver, unwrap } from './TrefReceiver.js';

// Import for auto-inject
import { TrefWrapper } from './TrefWrapper.js';
import { TrefReceiver } from './TrefReceiver.js';

/** Track if CSS has been injected */
let cssInjected = false;

/**
 * Get combined styles from all components
 * @returns {string}
 */
export function getStyles() {
  // TrefWrapper.getStyles() includes SHARED_CSS_VARS
  // TrefReceiver.getStyles() also includes them but CSS vars are idempotent
  return TrefWrapper.getStyles() + '\n' + TrefReceiver.getStyles();
}

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
  style.textContent = getStyles();
  document.head.appendChild(style);
  cssInjected = true;
}

// Auto-inject CSS when module loads in browser
autoInjectCSS();

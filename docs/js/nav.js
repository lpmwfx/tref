/**
 * TREF Site Navigation
 * Shared navigation component for all pages
 * - SVG icons with tooltips on mobile
 * - Full text links on desktop
 * - Auto-highlights current page
 * - Theme toggle included
 */

// Detect base path (works for both local dev and GitHub Pages)
const BASE_PATH = (function() {
  const path = window.location.pathname;
  // If we're in a subdirectory like /docs/, use that as base
  if (path.includes('/docs/')) {
    return '/docs/';
  }
  // GitHub Pages serves from root
  return '/';
})();

const NAV_ITEMS = [
  { href: '', label: 'Home', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { href: 'builder.html', label: 'Builder', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>` },
  { href: 'examples.html', label: 'Examples', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { href: 'guide.html', label: 'Guide', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
  { href: 'about-cli.html', label: 'About', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>` }
];

const TREF_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
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
 * Get current page filename for active link detection
 */
function getCurrentPage() {
  const path = window.location.pathname;
  // Handle index/home
  if (path.endsWith('/') || path.endsWith('/index.html')) {
    return '';
  }
  // Extract just the filename
  const match = path.match(/\/([^/]+\.html)$/);
  return match ? match[1] : '';
}

/**
 * Initialize theme from localStorage
 */
function initTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    return true;
  }
  return false;
}

/**
 * Toggle theme and persist
 */
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

/**
 * Update theme toggle button icon
 */
function updateThemeIcon(isDark) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerHTML = isDark ? '&#9728;' : '&#127769;';
  }
}

/**
 * Render navigation into existing nav element
 */
function renderNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const currentPage = getCurrentPage();
  const isDark = initTheme();

  // Build nav links HTML
  const linksHtml = NAV_ITEMS.map(item => {
    const isActive = item.href === currentPage;
    const activeClass = isActive ? ' class="active"' : '';
    const fullHref = BASE_PATH + item.href;
    return `
      <li>
        <a href="${fullHref}"${activeClass} title="${item.label}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      </li>
    `;
  }).join('');

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="${BASE_PATH}" class="nav-brand">
        ${TREF_LOGO}
        TREF
      </a>
      <ul class="nav-links">
        ${linksHtml}
      </ul>
      <div class="nav-controls">
        <button class="theme-toggle" onclick="toggleTheme()">
          <span id="theme-icon">${isDark ? '&#9728;' : '&#127769;'}</span>
        </button>
      </div>
    </div>
  `;
}

// Export for global use
window.toggleTheme = toggleTheme;

// Auto-render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNav);
} else {
  renderNav();
}

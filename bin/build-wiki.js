#!/usr/bin/env node
/**
 * Build TREF Wiki from markdown sources
 *
 * Reads markdown files from doc/wiki/
 * Generates TREF blocks and HTML wrappers
 *
 * Frontmatter format:
 * ---
 * title: Page Title
 * section: Category Name
 * slug: page-slug
 * refs:
 *   - type: url
 *     url: https://example.com
 *     title: Example Source
 * ---
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const SOURCE_DIR = join(PROJECT_ROOT, 'doc/wiki');
const OUTPUT_DIR = join(PROJECT_ROOT, 'docs/wiki');
const BLOCKS_DIR = join(OUTPUT_DIR, 'blocks');
const PAGES_DIR = join(OUTPUT_DIR, 'pages');

// Ensure output directories exist
function ensureDirs() {
  [OUTPUT_DIR, BLOCKS_DIR, PAGES_DIR].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
}

// Generate TREF block ID from content only (matches browser validation)
function generateId(content) {
  const hash = createHash('sha256').update(content).digest('hex');
  return `sha256:${hash}`;
}

// Parse YAML-like frontmatter
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, content: md };
  }

  const fmText = match[1];
  const content = match[2];
  const frontmatter = {};

  // Simple YAML parser for our needs
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];

  for (const line of fmText.split('\n')) {
    // Array item
    if (line.startsWith('  - ')) {
      if (currentKey && inArray) {
        // Start of object in array
        const item = {};
        const firstProp = line.slice(4);
        const colonIdx = firstProp.indexOf(':');
        if (colonIdx > 0) {
          item[firstProp.slice(0, colonIdx).trim()] = firstProp.slice(colonIdx + 1).trim();
        }
        arrayItems.push(item);
      }
      continue;
    }

    // Object property in array item
    if (line.startsWith('    ') && arrayItems.length > 0) {
      const prop = line.trim();
      const colonIdx = prop.indexOf(':');
      if (colonIdx > 0) {
        const lastItem = arrayItems[arrayItems.length - 1];
        lastItem[prop.slice(0, colonIdx).trim()] = prop.slice(colonIdx + 1).trim();
      }
      continue;
    }

    // Save previous array if we're leaving it
    if (inArray && currentKey && !line.startsWith('  ')) {
      frontmatter[currentKey] = arrayItems;
      inArray = false;
      arrayItems = [];
      currentKey = null;
    }

    // Key: value pair
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      if (value === '') {
        // Start of array or nested object
        currentKey = key;
        inArray = true;
        arrayItems = [];
      } else {
        frontmatter[key] = value;
      }
    }
  }

  // Save final array if any
  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayItems;
  }

  return { frontmatter, content };
}

// Convert markdown to simple HTML
function mdToHtml(md) {
  let html = md
    // Code blocks (must be before other transformations)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Lists (simple)
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`);

  // Paragraphs - wrap non-HTML lines
  const lines = html.split('\n');
  const result = [];
  let inPre = false;

  for (const line of lines) {
    if (line.includes('<pre>')) inPre = true;
    if (line.includes('</pre>')) inPre = false;

    if (inPre || line.trim() === '' || line.startsWith('<')) {
      result.push(line);
    } else {
      result.push(`<p>${line}</p>`);
    }
  }

  return result.join('\n')
    .replace(/<p><\/p>/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Create TREF block from content
function createBlock(content, meta = {}) {
  const id = generateId(content);
  const block = {
    v: 1,
    id,
    content,
    meta: {
      created: new Date().toISOString(),
      license: meta.license || 'CC-BY-4.0',
    },
  };

  if (meta.author) block.meta.author = meta.author;
  if (meta.refs && meta.refs.length > 0) block.refs = meta.refs;

  return block;
}

// Generate HTML page wrapper
function generatePageHtml(slug, title, section) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - TREF Manual</title>
  <link rel="stylesheet" href="../../css/tref-site.css">
  <link rel="stylesheet" href="../wiki.css">
  <link rel="icon" href="../../img/favicon.ico">
  <style id="tref-styles"></style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
</head>
<body>
  <nav class="nav"></nav>
  <script src="../../js/nav.js"></script>

  <!-- Mobile menu button -->
  <button class="wiki-menu-btn" id="wiki-menu-btn" aria-label="Open menu">
    <span>&#9776;</span>
  </button>

  <!-- Mobile overlay -->
  <div class="wiki-overlay" id="wiki-overlay"></div>

  <div class="wiki-layout">
    <aside class="wiki-sidebar" id="wiki-sidebar"></aside>
    <main class="wiki-main">
      <article class="wiki-article">
        <div id="wiki-content"></div>
        <div id="wiki-tref"></div>
      </article>
    </main>
  </div>

  <script type="module">
    import { TrefWrapper } from '../../js/tref-block.js';

    document.getElementById('tref-styles').textContent = TrefWrapper.getStyles();

    try {
      const pagesRes = await fetch('../_pages.json');
      if (!pagesRes.ok) throw new Error('Failed to load _pages.json');
      const pagesData = await pagesRes.json();
      renderSidebar(document.getElementById('wiki-sidebar'), pagesData, '${slug}');

      const blockRes = await fetch('../blocks/${slug}.json');
      if (!blockRes.ok) throw new Error('Failed to load block');
      const block = await blockRes.json();

      document.getElementById('wiki-content').innerHTML = renderMarkdown(block.content);
      hljs.configure({ ignoreUnescapedHTML: true });
      document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));

      const wrapper = new TrefWrapper(block);
      document.getElementById('wiki-tref').innerHTML = wrapper.toHTML();
      wrapper.attachEvents(document.querySelector('.tref-wrapper'));
    } catch (err) {
      console.error('Wiki error:', err);
      document.getElementById('wiki-content').innerHTML = '<p style="color:red">Error: ' + err.message + '</p>';
    }

    function renderSidebar(container, data, currentSlug) {
      const sections = {};
      const noSection = [];
      for (const page of data.pages) {
        if (page.section) {
          if (!sections[page.section]) sections[page.section] = [];
          sections[page.section].push(page);
        } else {
          noSection.push(page);
        }
      }

      let html = '<nav class="wiki-nav"><button class="wiki-close-btn" aria-label="Close menu">&times;</button><h2 class="wiki-nav-title">' + data.title + '</h2>';

      for (const page of noSection) {
        const active = page.slug === currentSlug ? ' active' : '';
        html += '<a href="' + page.slug + '.html" class="wiki-link top-level' + active + '">' + page.title + '</a>';
      }

      let idx = 0;
      for (const [section, pages] of Object.entries(sections)) {
        const hasActive = pages.some(p => p.slug === currentSlug);
        const collapsed = !hasActive ? ' collapsed' : '';
        html += '<h3 class="wiki-section' + collapsed + '" data-section="' + idx + '">' + section + '</h3>';
        html += '<div class="wiki-section-content' + collapsed + '" data-section="' + idx + '">';
        for (const page of pages) {
          const active = page.slug === currentSlug ? ' active' : '';
          html += '<a href="' + page.slug + '.html" class="wiki-link' + active + '">' + page.title + '</a>';
        }
        html += '</div>';
        idx++;
      }

      html += '</nav>';
      container.innerHTML = html;

      container.querySelectorAll('.wiki-section').forEach(el => {
        el.addEventListener('click', () => {
          const i = el.dataset.section;
          el.classList.toggle('collapsed');
          container.querySelector('.wiki-section-content[data-section="' + i + '"]').classList.toggle('collapsed');
        });
      });

      // Mobile menu toggle
      const menuBtn = document.getElementById('wiki-menu-btn');
      const overlay = document.getElementById('wiki-overlay');
      const closeBtn = container.querySelector('.wiki-close-btn');

      function openMenu() {
        container.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeMenu() {
        container.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }

      menuBtn.addEventListener('click', openMenu);
      overlay.addEventListener('click', closeMenu);
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);

      // Close on link click (mobile navigation)
      container.querySelectorAll('.wiki-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
    }

    function renderMarkdown(md) {
      return md
        .replace(/\`\`\`(\\w*)[\\r\\n]+([\\s\\S]*?)\`\`\`/g, (_, lang, code) => '<pre><code class="' + (lang ? 'language-' + lang : '') + '">' + escapeHtml(code.trim()) + '</code></pre>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\\*\\*\\*(.+?)\\*\\*\\*/g, '<strong><em>$1</em></strong>')
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
        .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>')
        .replace(/^---$/gm, '<hr>')
        .replace(/^\\* (.+)$/gm, '<li>$1</li>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\\/li>\\n?)+/g, match => '<ul>' + match + '</ul>')
        .split('\\n').map(line => line.trim() === '' || line.startsWith('<') ? line : '<p>' + line + '</p>').join('\\n')
        .replace(/<p><\\/p>/g, '');
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  </script>
</body>
</html>`;
}

// Process all markdown files
function build() {
  ensureDirs();

  if (!existsSync(SOURCE_DIR)) {
    console.log(`Creating ${SOURCE_DIR} - add markdown files there`);
    mkdirSync(SOURCE_DIR, { recursive: true });
    return;
  }

  const mdFiles = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.log(`No markdown files in ${SOURCE_DIR}`);
    return;
  }

  console.log('Building TREF Wiki...\n');

  const pages = [];

  for (const file of mdFiles) {
    const mdPath = join(SOURCE_DIR, file);
    const md = readFileSync(mdPath, 'utf-8');
    const { frontmatter, content } = parseFrontmatter(md);

    const slug = frontmatter.slug || basename(file, '.md');
    const title = frontmatter.title || slug;
    const section = frontmatter.section || null;

    // Create TREF block
    const block = createBlock(content.trim(), {
      author: frontmatter.author || 'TREF Documentation',
      refs: frontmatter.refs || [{
        type: 'url',
        url: `https://tref.lpmwfx.com/wiki/pages/${slug}.html`,
        title: title
      }],
    });

    // Save block
    const blockPath = join(BLOCKS_DIR, `${slug}.json`);
    writeFileSync(blockPath, JSON.stringify(block, null, 2));

    // Generate HTML page
    const htmlPath = join(PAGES_DIR, `${slug}.html`);
    writeFileSync(htmlPath, generatePageHtml(slug, title, section));

    // Add to pages list
    pages.push({ slug, title, section });

    console.log(`  ${slug}: ${block.id.slice(0, 24)}...`);
  }

  // Generate _pages.json
  const pagesJson = {
    title: 'TREF Manual',
    pages: pages.sort((a, b) => {
      // Home first, then by section, then by title
      if (a.slug === 'home') return -1;
      if (b.slug === 'home') return 1;
      if (a.section !== b.section) {
        if (!a.section) return -1;
        if (!b.section) return 1;
        return a.section.localeCompare(b.section);
      }
      return a.title.localeCompare(b.title);
    })
  };

  writeFileSync(join(OUTPUT_DIR, '_pages.json'), JSON.stringify(pagesJson, null, 2));

  console.log(`\nGenerated ${pages.length} pages`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

build();

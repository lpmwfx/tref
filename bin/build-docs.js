#!/usr/bin/env node
/**
 * Build docs from markdown sources
 * Generates HTML with pre-computed TREF blocks
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, basename } from 'path';

const CONTENT_DIR = 'docs/content';
const OUTPUT_DIR = 'docs';

// Simple markdown to HTML (basic conversion)
function mdToHtml(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`)
    .replace(/<p><\/p>/g, '');
}

// Generate TREF block ID
function generateId(draft) {
  const sorted = JSON.stringify(sortKeys(draft));
  const hash = createHash('sha256').update(sorted).digest('hex');
  return `sha256:${hash}`;
}

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
}

// Create TREF block from content
function createBlock(content, meta = {}) {
  const draft = {
    v: 1,
    content,
    meta: {
      created: new Date().toISOString(),
      license: meta.license || 'CC-BY-4.0',
      ...(meta.author && { author: meta.author }),
    },
    ...(meta.refs && { refs: meta.refs }),
  };
  const id = generateId(draft);
  return { ...draft, id };
}

// Process a markdown file
function processFile(mdPath, templatePath) {
  const md = readFileSync(mdPath, 'utf-8');
  const filename = basename(mdPath, '.md');

  // Extract front matter if present (---\n...\n---)
  let content = md;
  let frontMatter = {};
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (fmMatch) {
    const fmLines = fmMatch[1].split('\n');
    for (const line of fmLines) {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) {
        frontMatter[key.trim()] = rest.join(':').trim();
      }
    }
    content = fmMatch[2];
  }

  // Create TREF block with markdown content
  const block = createBlock(content.trim(), {
    author: frontMatter.author || 'TREF Documentation',
    refs: [{
      type: 'url',
      url: `https://tref.lpmwfx.com/${filename}.html`,
      title: frontMatter.title || filename
    }],
  });

  console.log(`  ${filename}: ${block.id.slice(0, 20)}...`);
  return { content, frontMatter, block };
}

// Main
function main() {
  if (!existsSync(CONTENT_DIR)) {
    console.log('No docs/content directory - skipping build');
    return;
  }

  const mdFiles = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.log('No markdown files in docs/content - skipping build');
    return;
  }

  console.log('Building docs from markdown:');

  for (const file of mdFiles) {
    const mdPath = join(CONTENT_DIR, file);
    const { content, frontMatter, block } = processFile(mdPath);

    // For now, just output the block JSON
    // Full HTML template integration would go here
    const blockPath = join(OUTPUT_DIR, 'blocks', basename(file, '.md') + '.tref');
    writeFileSync(blockPath, JSON.stringify(block, null, 2));
  }

  console.log('Done!');
}

main();

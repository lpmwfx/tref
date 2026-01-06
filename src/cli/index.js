#!/usr/bin/env node
/**
 * @fileoverview TREF CLI - Command line interface for publishing TREF blocks
 */

import { createDraft } from '../schemas/block.js';
import { RefSchema } from '../schemas/reference.js';
import { publish, derive, validate } from '../publisher/publish.js';
import { load, exportBlock, loadById } from '../publisher/io.js';
import {
  listRegistered,
  isRegistered,
  getRegistryStats,
  addToRegistry,
} from '../publisher/registry.js';
import { readFile } from 'node:fs/promises';

const VERSION = '1.0.0';

/**
 * @typedef {Object} ParsedArgs
 * @property {string} command - The subcommand
 * @property {string[]} positionals - Positional arguments
 * @property {Record<string, string | boolean>} flags - Named flags
 */

/**
 * Parse command line arguments
 * @param {string[]} args - Process argv slice
 * @returns {ParsedArgs}
 */
function parseArgs(args) {
  /** @type {string | undefined} */
  let command;
  /** @type {string[]} */
  const positionals = [];
  /** @type {Record<string, string | boolean>} */
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];

      // Check if next arg is a value (not a flag)
      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.slice(1);
      const next = args[i + 1];

      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (!command) {
      command = arg;
    } else {
      positionals.push(arg);
    }
  }

  return { command: command || '', positionals, flags };
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
tref - TREF block publisher CLI

Usage: tref <command> [options]

Commands:
  publish <content>     Create and publish a new block
  derive <parent> <content>  Derive a block from parent
  validate <file>       Validate a .tref file
  list                  List all published blocks
  info <id>             Show block details
  cat <id>              Output block content

Options:
  --help, -h            Show this help message
  --version, -v         Show version number
  --stdin               Read content from stdin
  -f, --file <path>     Read content from file
  --refs <json>         Add references (JSON array)
  --license <type>      Set license (default: CC-BY-4.0)
  --pretty              Pretty-print JSON output
  --dir <path>          Publish directory (default: ./published)

Examples:
  tref publish "Hello, world!"
  tref publish -f article.txt --refs '[{"type":"url","uri":"https://example.com"}]'
  echo "Content" | tref publish --stdin
  tref derive sha256:abc123 "Updated content"
  tref validate block.tref
  tref list
`);
}

/**
 * Print version
 */
function printVersion() {
  console.log(`tref v${VERSION}`);
}

/**
 * Read content from stdin
 * @returns {Promise<string>}
 */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8').trim();
}

/**
 * Get publish directory from flags or default
 * @param {Record<string, string | boolean>} flags
 * @returns {string}
 */
function getPublishDir(flags) {
  const dir = flags['dir'];
  return typeof dir === 'string' ? dir : './published';
}

/**
 * Parse refs from JSON string
 * @param {string | boolean | undefined} refsArg
 * @returns {import('../schemas/reference.js').Ref[] | undefined}
 */
function parseRefs(refsArg) {
  if (typeof refsArg !== 'string') {
    return undefined;
  }
  try {
    const parsed = /** @type {unknown} */ (JSON.parse(refsArg));
    if (!Array.isArray(parsed)) {
      console.error('Error: --refs must be a JSON array');
      process.exit(1);
    }
    // Validate each ref
    /** @type {import('../schemas/reference.js').Ref[]} */
    const refs = [];
    for (const item of parsed) {
      refs.push(RefSchema.parse(item));
    }
    return refs;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON';
    console.error(`Error: Invalid --refs: ${message}`);
    process.exit(1);
  }
}

/**
 * Handle publish command
 * @param {string[]} positionals
 * @param {Record<string, string | boolean>} flags
 */
async function cmdPublish(positionals, flags) {
  let content;

  if (flags['stdin']) {
    content = await readStdin();
  } else if (flags['f'] || flags['file']) {
    const filePath = flags['f'] || flags['file'];
    if (typeof filePath !== 'string') {
      console.error('Error: --file requires a path');
      process.exit(1);
    }
    content = await readFile(filePath, 'utf-8');
  } else if (positionals.length > 0) {
    content = positionals.join(' ');
  } else {
    console.error('Error: No content provided');
    console.error('Usage: tref publish <content> | --stdin | -f <file>');
    process.exit(1);
  }

  const refs = parseRefs(flags['refs']);
  const license = typeof flags['license'] === 'string' ? flags['license'] : undefined;

  const draft = createDraft(content, { refs, license });
  const block = publish(draft);

  const publishDir = getPublishDir(flags);
  await exportBlock(block, publishDir);
  await addToRegistry(block.id, publishDir);

  if (flags['pretty']) {
    console.log(JSON.stringify(block, null, 2));
  } else {
    console.log(block.id);
  }
}

/**
 * Handle derive command
 * @param {string[]} positionals
 * @param {Record<string, string | boolean>} flags
 */
async function cmdDerive(positionals, flags) {
  if (positionals.length < 2) {
    console.error('Error: derive requires parent ID and content');
    console.error('Usage: tref derive <parent-id|parent.tref> <content>');
    process.exit(1);
  }

  const parentArg = positionals[0];
  const publishDir = getPublishDir(flags);
  let parentBlock;

  // Check if parent is a file path or ID
  if (parentArg.endsWith('.tref')) {
    parentBlock = await load(parentArg);
  } else {
    const parentId = parentArg.startsWith('sha256:') ? parentArg : `sha256:${parentArg}`;
    parentBlock = await loadById(parentId, publishDir);
  }

  const content = positionals.slice(1).join(' ');
  const refs = parseRefs(flags['refs']);

  const block = derive(parentBlock, content, { additionalRefs: refs });

  await exportBlock(block, publishDir);
  await addToRegistry(block.id, publishDir);

  if (flags['pretty']) {
    console.log(JSON.stringify(block, null, 2));
  } else {
    console.log(block.id);
  }
}

/**
 * Handle validate command
 * @param {string[]} positionals
 */
async function cmdValidate(positionals) {
  if (positionals.length === 0) {
    console.error('Error: validate requires a file path');
    console.error('Usage: tref validate <file.tref>');
    process.exit(1);
  }

  const filePath = positionals[0];
  // Load without validation so we can report our own validation result
  const block = await load(filePath, { validate: false });

  const result = validate(block);
  if (result.valid) {
    console.log('✓ Valid TREF block');
    console.log(`  ID: ${block.id}`);
    console.log(
      `  Content: ${block.content.slice(0, 50)}${block.content.length > 50 ? '...' : ''}`
    );
    process.exit(0);
  } else {
    console.error('✗ Invalid TREF block');
    console.error(`  ${result.error}`);
    process.exit(1);
  }
}

/**
 * Handle list command
 * @param {Record<string, string | boolean>} flags
 */
async function cmdList(flags) {
  const publishDir = getPublishDir(flags);
  const ids = await listRegistered(publishDir);

  if (ids.length === 0) {
    console.log('No published blocks');
    return;
  }

  if (flags['pretty']) {
    const stats = await getRegistryStats(publishDir);
    console.log(`Published blocks: ${stats.count}`);
    console.log('');
    for (const id of ids) {
      console.log(`  ${id}`);
    }
  } else {
    for (const id of ids) {
      console.log(id);
    }
  }
}

/**
 * Handle info command
 * @param {string[]} positionals
 * @param {Record<string, string | boolean>} flags
 */
async function cmdInfo(positionals, flags) {
  if (positionals.length === 0) {
    console.error('Error: info requires a block ID');
    console.error('Usage: tref info <id>');
    process.exit(1);
  }

  const id = positionals[0].startsWith('sha256:') ? positionals[0] : `sha256:${positionals[0]}`;
  const publishDir = getPublishDir(flags);

  if (!(await isRegistered(id, publishDir))) {
    console.error(`Error: Block not found: ${id}`);
    process.exit(1);
  }

  const block = await loadById(id, publishDir);

  console.log(`ID:       ${block.id}`);
  console.log(`Version:  ${block.v}`);
  console.log(`Created:  ${block.meta.created}`);
  if (block.meta.modified) {
    console.log(`Modified: ${block.meta.modified}`);
  }
  if (block.meta.license) {
    console.log(`License:  ${block.meta.license}`);
  }
  if (block.parent) {
    console.log(`Parent:   ${block.parent}`);
  }
  if (block.refs && block.refs.length > 0) {
    console.log(`Refs:     ${block.refs.length} reference(s)`);
  }
  console.log(`Content:  ${block.content.length} chars`);
}

/**
 * Handle cat command
 * @param {string[]} positionals
 * @param {Record<string, string | boolean>} flags
 */
async function cmdCat(positionals, flags) {
  if (positionals.length === 0) {
    console.error('Error: cat requires a block ID');
    console.error('Usage: tref cat <id>');
    process.exit(1);
  }

  const id = positionals[0].startsWith('sha256:') ? positionals[0] : `sha256:${positionals[0]}`;
  const publishDir = getPublishDir(flags);

  if (!(await isRegistered(id, publishDir))) {
    console.error(`Error: Block not found: ${id}`);
    process.exit(1);
  }

  const block = await loadById(id, publishDir);

  if (flags['pretty']) {
    console.log(JSON.stringify(block, null, 2));
  } else {
    console.log(block.content);
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const { command, positionals, flags } = parseArgs(args);

  // Handle global flags
  if (flags['help'] || flags['h']) {
    printHelp();
    process.exit(0);
  }

  if (flags['version'] || flags['v']) {
    printVersion();
    process.exit(0);
  }

  // Handle commands
  try {
    switch (command) {
      case 'publish':
        await cmdPublish(positionals, flags);
        break;
      case 'derive':
        await cmdDerive(positionals, flags);
        break;
      case 'validate':
        await cmdValidate(positionals);
        break;
      case 'list':
        await cmdList(flags);
        break;
      case 'info':
        await cmdInfo(positionals, flags);
        break;
      case 'cat':
        await cmdCat(positionals, flags);
        break;
      case '':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "tref --help" for usage');
        process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

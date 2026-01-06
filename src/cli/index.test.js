/**
 * @fileoverview Tests for TREF CLI
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CLI_PATH = new URL('./index.js', import.meta.url).pathname;

/**
 * Run CLI command and capture output
 * @param {string[]} args - CLI arguments
 * @param {object} [options] - Options
 * @param {string} [options.stdin] - Input to send to stdin
 * @param {string} [options.cwd] - Working directory
 * @returns {Promise<{ stdout: string, stderr: string, code: number | null }>}
 */
function runCLI(args, options = {}) {
  return new Promise(resolve => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      cwd: options.cwd,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (/** @type {Buffer} */ data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (/** @type {Buffer} */ data) => {
      stderr += data.toString();
    });

    if (options.stdin) {
      proc.stdin.write(options.stdin);
      proc.stdin.end();
    }

    proc.on('close', code => {
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
    });
  });
}

describe('CLI --help', () => {
  it('shows help message', async () => {
    const { stdout, code } = await runCLI(['--help']);
    assert.equal(code, 0);
    assert.ok(stdout.includes('tref - TREF block publisher CLI'));
    assert.ok(stdout.includes('Commands:'));
    assert.ok(stdout.includes('publish'));
    assert.ok(stdout.includes('derive'));
    assert.ok(stdout.includes('validate'));
  });

  it('shows help with -h', async () => {
    const { stdout, code } = await runCLI(['-h']);
    assert.equal(code, 0);
    assert.ok(stdout.includes('tref - TREF block publisher CLI'));
  });
});

describe('CLI --version', () => {
  it('shows version', async () => {
    const { stdout, code } = await runCLI(['--version']);
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('tref v'));
  });

  it('shows version with -v', async () => {
    const { stdout, code } = await runCLI(['-v']);
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('tref v'));
  });
});

describe('CLI publish', () => {
  /** @type {string} */
  let testDir;

  before(async () => {
    testDir = join(tmpdir(), `tref-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('publishes content from argument', async () => {
    const { stdout, code } = await runCLI(
      ['publish', 'Test content', '--dir', join(testDir, 'pub1')],
      { cwd: testDir }
    );
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('sha256:'));
  });

  it('publishes content from stdin', async () => {
    const { stdout, code } = await runCLI(['publish', '--stdin', '--dir', join(testDir, 'pub2')], {
      cwd: testDir,
      stdin: 'Content from stdin',
    });
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('sha256:'));
  });

  it('publishes content from file', async () => {
    const filePath = join(testDir, 'input.txt');
    await writeFile(filePath, 'Content from file');

    const { stdout, code } = await runCLI(
      ['publish', '-f', filePath, '--dir', join(testDir, 'pub3')],
      { cwd: testDir }
    );
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('sha256:'));
  });

  it('outputs pretty JSON with --pretty', async () => {
    const { stdout, code } = await runCLI(
      ['publish', 'Pretty test', '--pretty', '--dir', join(testDir, 'pub4')],
      { cwd: testDir }
    );
    assert.equal(code, 0);
    assert.ok(stdout.includes('"v": 1'));
    assert.ok(stdout.includes('"id":'));
    assert.ok(stdout.includes('"content": "Pretty test"'));
  });

  it('errors without content', async () => {
    const { stderr, code } = await runCLI(['publish'], { cwd: testDir });
    assert.equal(code, 1);
    assert.ok(stderr.includes('No content provided'));
  });
});

describe('CLI list', () => {
  /** @type {string} */
  let testDir;

  before(async () => {
    testDir = join(tmpdir(), `tref-test-list-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('shows no blocks when empty', async () => {
    const pubDir = join(testDir, 'empty');
    const { stdout, code } = await runCLI(['list', '--dir', pubDir], { cwd: testDir });
    assert.equal(code, 0);
    assert.ok(stdout.includes('No published blocks'));
  });

  it('lists published blocks', async () => {
    const pubDir = join(testDir, 'pub');

    // Publish a block
    await runCLI(['publish', 'Block 1', '--dir', pubDir], { cwd: testDir });

    const { stdout, code } = await runCLI(['list', '--dir', pubDir], { cwd: testDir });
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('sha256:'));
  });

  it('shows count with --pretty', async () => {
    const pubDir = join(testDir, 'pretty');

    await runCLI(['publish', 'Block A', '--dir', pubDir], { cwd: testDir });
    await runCLI(['publish', 'Block B', '--dir', pubDir], { cwd: testDir });

    const { stdout, code } = await runCLI(['list', '--pretty', '--dir', pubDir], { cwd: testDir });
    assert.equal(code, 0);
    assert.ok(stdout.includes('Published blocks: 2'));
  });
});

describe('CLI validate', () => {
  /** @type {string} */
  let testDir;
  /** @type {string} */
  let validFile;

  before(async () => {
    testDir = join(tmpdir(), `tref-test-validate-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Create a valid block file
    const pubDir = join(testDir, 'pub');
    const { stdout } = await runCLI(['publish', 'Valid content', '--dir', pubDir], {
      cwd: testDir,
    });
    const id = stdout.trim();
    const hash = id.replace('sha256:', '');
    validFile = join(pubDir, hash.slice(0, 2), `${hash}.tref`);
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('validates valid block', async () => {
    const { stdout, code } = await runCLI(['validate', validFile], { cwd: testDir });
    assert.equal(code, 0);
    assert.ok(stdout.includes('✓ Valid TREF block'));
  });

  it('rejects invalid block', async () => {
    const invalidFile = join(testDir, 'invalid.tref');
    await writeFile(
      invalidFile,
      JSON.stringify({
        v: 1,
        id: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        content: 'Content that does not match hash',
        meta: { created: new Date().toISOString(), license: 'MIT' },
        refs: [],
      })
    );

    const { stderr, code } = await runCLI(['validate', invalidFile], { cwd: testDir });
    assert.equal(code, 1);
    assert.ok(stderr.includes('✗ Invalid TREF block'));
  });

  it('errors without file argument', async () => {
    const { stderr, code } = await runCLI(['validate'], { cwd: testDir });
    assert.equal(code, 1);
    assert.ok(stderr.includes('validate requires a file path'));
  });
});

describe('CLI derive', () => {
  /** @type {string} */
  let testDir;
  /** @type {string} */
  let parentId;

  before(async () => {
    testDir = join(tmpdir(), `tref-test-derive-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Publish a parent block
    const pubDir = join(testDir, 'pub');
    const { stdout } = await runCLI(['publish', 'Parent content', '--dir', pubDir], {
      cwd: testDir,
    });
    parentId = stdout.trim();
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('derives from parent ID', async () => {
    const pubDir = join(testDir, 'pub');
    const { stdout, code } = await runCLI(
      ['derive', parentId, 'Derived content', '--dir', pubDir],
      { cwd: testDir }
    );
    assert.equal(code, 0);
    assert.ok(stdout.startsWith('sha256:'));
    assert.notEqual(stdout.trim(), parentId);
  });

  it('derived block has parent reference', async () => {
    const pubDir = join(testDir, 'pub');
    const { stdout: derivedId } = await runCLI(
      ['derive', parentId, 'Another derived', '--dir', pubDir],
      { cwd: testDir }
    );

    const { stdout: info } = await runCLI(['info', derivedId.trim(), '--dir', pubDir], {
      cwd: testDir,
    });
    assert.ok(info.includes(`Parent:   ${parentId}`));
  });

  it('errors without parent and content', async () => {
    const { stderr, code } = await runCLI(['derive'], { cwd: testDir });
    assert.equal(code, 1);
    assert.ok(stderr.includes('derive requires parent ID and content'));
  });
});

describe('CLI info', () => {
  /** @type {string} */
  let testDir;
  /** @type {string} */
  let blockId;

  before(async () => {
    testDir = join(tmpdir(), `tref-test-info-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    const pubDir = join(testDir, 'pub');
    const { stdout } = await runCLI(['publish', 'Info test content', '--dir', pubDir], {
      cwd: testDir,
    });
    blockId = stdout.trim();
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('shows block info', async () => {
    const pubDir = join(testDir, 'pub');
    const { stdout, code } = await runCLI(['info', blockId, '--dir', pubDir], { cwd: testDir });
    assert.equal(code, 0);
    assert.ok(stdout.includes(`ID:       ${blockId}`));
    assert.ok(stdout.includes('Version:  1'));
    assert.ok(stdout.includes('Created:'));
    assert.ok(stdout.includes('Content:'));
  });

  it('errors for unknown ID', async () => {
    const pubDir = join(testDir, 'pub');
    const { stderr, code } = await runCLI(
      [
        'info',
        'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        '--dir',
        pubDir,
      ],
      { cwd: testDir }
    );
    assert.equal(code, 1);
    assert.ok(stderr.includes('Block not found'));
  });
});

describe('CLI cat', () => {
  /** @type {string} */
  let testDir;
  /** @type {string} */
  let blockId;

  before(async () => {
    testDir = join(tmpdir(), `tref-test-cat-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    const pubDir = join(testDir, 'pub');
    const { stdout } = await runCLI(['publish', 'Cat test content', '--dir', pubDir], {
      cwd: testDir,
    });
    blockId = stdout.trim();
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('outputs block content', async () => {
    const pubDir = join(testDir, 'pub');
    const { stdout, code } = await runCLI(['cat', blockId, '--dir', pubDir], { cwd: testDir });
    assert.equal(code, 0);
    assert.equal(stdout, 'Cat test content');
  });

  it('outputs full JSON with --pretty', async () => {
    const pubDir = join(testDir, 'pub');
    const { stdout, code } = await runCLI(['cat', blockId, '--pretty', '--dir', pubDir], {
      cwd: testDir,
    });
    assert.equal(code, 0);
    assert.ok(stdout.includes('"v": 1'));
    assert.ok(stdout.includes('"content": "Cat test content"'));
  });
});

describe('CLI unknown command', () => {
  it('errors for unknown command', async () => {
    const { stderr, code } = await runCLI(['foobar']);
    assert.equal(code, 1);
    assert.ok(stderr.includes('Unknown command: foobar'));
  });
});

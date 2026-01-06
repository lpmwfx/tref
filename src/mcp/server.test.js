/**
 * @fileoverview Tests for TREF MCP Server
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const SERVER_PATH = new URL('./server.js', import.meta.url).pathname;

/**
 * @typedef {Object} JsonRpcResponse
 * @property {string} jsonrpc
 * @property {number} id
 * @property {unknown} [result]
 * @property {{ code: number, message: string }} [error]
 */

/**
 * Create an MCP client that communicates with the server via stdio
 * @param {string} cwd - Working directory for the server
 * @returns {{ send: (method: string, params?: object) => Promise<JsonRpcResponse>, close: () => void }}
 */
function createClient(cwd) {
  const proc = spawn('node', [SERVER_PATH], {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let requestId = 1;
  /** @type {Map<number, { resolve: (value: JsonRpcResponse) => void, reject: (error: Error) => void }>} */
  const pending = new Map();
  let buffer = '';

  proc.stdout.on('data', (/** @type {Buffer} */ data) => {
    buffer += data.toString();

    // Try to parse complete JSON-RPC messages
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }
      try {
        const parsed = /** @type {unknown} */ (JSON.parse(line));
        const response = /** @type {JsonRpcResponse} */ (parsed);
        const handler = pending.get(response.id);
        if (handler) {
          pending.delete(response.id);
          handler.resolve(response);
        }
      } catch {
        // Ignore parse errors (might be partial message)
      }
    }
  });

  return {
    /**
     * Send a JSON-RPC request and wait for response
     * @param {string} method
     * @param {object} [params]
     * @returns {Promise<JsonRpcResponse>}
     */
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = requestId++;
        pending.set(id, { resolve, reject });

        const request = JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          params,
        });

        proc.stdin.write(request + '\n');

        // Timeout after 5 seconds
        setTimeout(() => {
          if (pending.has(id)) {
            pending.delete(id);
            reject(new Error(`Request ${method} timed out`));
          }
        }, 5000);
      });
    },

    close() {
      proc.kill();
    },
  };
}

describe('MCP Server', () => {
  /** @type {string} */
  let testDir;
  /** @type {ReturnType<typeof createClient>} */
  let client;

  before(async () => {
    testDir = join(tmpdir(), `tref-mcp-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  after(async () => {
    if (client) {
      client.close();
    }
    await rm(testDir, { recursive: true, force: true });
  });

  it('responds to initialize request', async () => {
    client = createClient(testDir);

    const response = await client.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    });

    assert.equal(response.jsonrpc, '2.0');
    assert.ok(response.result);

    const result = /** @type {{ serverInfo: { name: string } }} */ (response.result);
    assert.equal(result.serverInfo.name, 'tref');
  });

  it('lists available tools', async () => {
    // Send initialized notification first
    await client.send('notifications/initialized', {});

    const response = await client.send('tools/list', {});

    assert.equal(response.jsonrpc, '2.0');
    assert.ok(response.result);

    const result = /** @type {{ tools: Array<{ name: string }> }} */ (response.result);
    const toolNames = result.tools.map(t => t.name);

    assert.ok(toolNames.includes('tref_publish'));
    assert.ok(toolNames.includes('tref_derive'));
    assert.ok(toolNames.includes('tref_validate'));
    assert.ok(toolNames.includes('tref_list'));
    assert.ok(toolNames.includes('tref_info'));
    assert.ok(toolNames.includes('tref_cat'));
  });

  it('publishes content via tool call', async () => {
    const pubDir = join(testDir, 'pub');

    const response = await client.send('tools/call', {
      name: 'tref_publish',
      arguments: {
        content: 'Test content from MCP',
        publishDir: pubDir,
      },
    });

    assert.equal(response.jsonrpc, '2.0');
    assert.ok(response.result);

    const result = /** @type {{ content: Array<{ text: string }> }} */ (response.result);
    const text = result.content[0].text;
    const parsedData = /** @type {unknown} */ (JSON.parse(text));
    const data = /** @type {{ success: boolean, id: string }} */ (parsedData);

    assert.equal(data.success, true);
    assert.ok(data.id.startsWith('sha256:'));
  });

  it('lists published blocks', async () => {
    const pubDir = join(testDir, 'pub');

    const response = await client.send('tools/call', {
      name: 'tref_list',
      arguments: {
        publishDir: pubDir,
      },
    });

    assert.equal(response.jsonrpc, '2.0');
    assert.ok(response.result);

    const result = /** @type {{ content: Array<{ text: string }> }} */ (response.result);
    const text = result.content[0].text;
    const parsedList = /** @type {unknown} */ (JSON.parse(text));
    const data = /** @type {{ count: number, blocks: Array<{ id: string }> }} */ (parsedList);

    assert.equal(data.count, 1);
    assert.ok(data.blocks[0].id.startsWith('sha256:'));
  });
});

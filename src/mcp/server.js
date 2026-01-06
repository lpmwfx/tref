#!/usr/bin/env node
/**
 * @fileoverview TREF MCP Server - Model Context Protocol server for TREF blocks
 *
 * Provides tools for AI assistants to publish, derive, and validate TREF blocks.
 * Uses stdio transport for communication.
 *
 * IMPORTANT: Use console.error() for logging, not console.log() - stdout is for MCP messages only.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

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

const VERSION = '0.1.0';
const DEFAULT_PUBLISH_DIR = './published';

/**
 * Create and configure the MCP server
 * @returns {McpServer}
 */
export function createServer() {
  const server = new McpServer({
    name: 'tref',
    version: VERSION,
  });

  // Tool: publish
  server.registerTool(
    'tref_publish',
    {
      description: 'Publish content as a new TREF block. Returns the block ID (sha256 hash).',
      inputSchema: {
        content: z.string().min(1).describe('The content to publish'),
        refs: z
          .array(RefSchema)
          .optional()
          .describe('Optional array of references (url, archive, search, or hash types)'),
        license: z.string().optional().describe('License identifier (default: AIBlocks-1.0)'),
        publishDir: z
          .string()
          .optional()
          .describe('Directory to save published blocks (default: ./published)'),
      },
    },
    async ({ content, refs, license, publishDir }) => {
      const dir = publishDir || DEFAULT_PUBLISH_DIR;

      const draft = createDraft(content, { refs, license });
      const block = publish(draft);

      await exportBlock(block, dir);
      await addToRegistry(block.id, dir);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                id: block.id,
                shortId: block.id.replace('sha256:', '').slice(0, 8),
                contentLength: block.content.length,
                refsCount: block.refs.length,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: derive
  server.registerTool(
    'tref_derive',
    {
      description:
        'Derive a new TREF block from an existing parent block. Preserves lineage and references.',
      inputSchema: {
        parentId: z
          .string()
          .describe('Parent block ID (sha256:... or just the hash, or path to .tref file)'),
        content: z.string().min(1).describe('New content for the derived block'),
        additionalRefs: z
          .array(RefSchema)
          .optional()
          .describe('Additional references to add to the derived block'),
        publishDir: z
          .string()
          .optional()
          .describe('Directory for published blocks (default: ./published)'),
      },
    },
    async ({ parentId, content, additionalRefs, publishDir }) => {
      const dir = publishDir || DEFAULT_PUBLISH_DIR;
      let parentBlock;

      // Load parent block
      if (parentId.endsWith('.tref')) {
        parentBlock = await load(parentId);
      } else {
        const fullId = parentId.startsWith('sha256:') ? parentId : `sha256:${parentId}`;
        parentBlock = await loadById(fullId, dir);
      }

      const block = derive(parentBlock, content, { additionalRefs });

      await exportBlock(block, dir);
      await addToRegistry(block.id, dir);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                id: block.id,
                shortId: block.id.replace('sha256:', '').slice(0, 8),
                parentId: block.parent,
                contentLength: block.content.length,
                refsCount: block.refs.length,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: validate
  server.registerTool(
    'tref_validate',
    {
      description: 'Validate a TREF block file. Checks ID integrity and schema compliance.',
      inputSchema: {
        filePath: z.string().describe('Path to the .tref file to validate'),
      },
    },
    async ({ filePath }) => {
      const block = await load(filePath, { validate: false });
      const result = validate(block);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                valid: result.valid,
                error: result.error || null,
                id: block.id,
                contentPreview:
                  block.content.slice(0, 100) + (block.content.length > 100 ? '...' : ''),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: list
  server.registerTool(
    'tref_list',
    {
      description: 'List all published TREF blocks in the registry.',
      inputSchema: {
        publishDir: z
          .string()
          .optional()
          .describe('Directory for published blocks (default: ./published)'),
      },
    },
    async ({ publishDir }) => {
      const dir = publishDir || DEFAULT_PUBLISH_DIR;
      const ids = await listRegistered(dir);
      const stats = await getRegistryStats(dir);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: stats.count,
                blocks: ids.map(id => ({
                  id,
                  shortId: id.replace('sha256:', '').slice(0, 8),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: info
  server.registerTool(
    'tref_info',
    {
      description: 'Get detailed information about a TREF block.',
      inputSchema: {
        id: z.string().describe('Block ID (sha256:... or just the hash)'),
        publishDir: z
          .string()
          .optional()
          .describe('Directory for published blocks (default: ./published)'),
      },
    },
    async ({ id, publishDir }) => {
      const dir = publishDir || DEFAULT_PUBLISH_DIR;
      const fullId = id.startsWith('sha256:') ? id : `sha256:${id}`;

      if (!(await isRegistered(fullId, dir))) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Block not found: ${fullId}` }, null, 2),
            },
          ],
        };
      }

      const block = await loadById(fullId, dir);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id: block.id,
                shortId: block.id.replace('sha256:', '').slice(0, 8),
                version: block.v,
                created: block.meta.created,
                modified: block.meta.modified || null,
                license: block.meta.license,
                author: block.meta.author || null,
                parent: block.parent || null,
                refsCount: block.refs.length,
                contentLength: block.content.length,
                contentPreview:
                  block.content.slice(0, 200) + (block.content.length > 200 ? '...' : ''),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: cat (read content)
  server.registerTool(
    'tref_cat',
    {
      description: 'Read the full content of a TREF block.',
      inputSchema: {
        id: z.string().describe('Block ID (sha256:... or just the hash)'),
        publishDir: z
          .string()
          .optional()
          .describe('Directory for published blocks (default: ./published)'),
        format: z
          .enum(['content', 'json'])
          .optional()
          .describe(
            'Output format: "content" for just content, "json" for full block (default: content)'
          ),
      },
    },
    async ({ id, publishDir, format }) => {
      const dir = publishDir || DEFAULT_PUBLISH_DIR;
      const fullId = id.startsWith('sha256:') ? id : `sha256:${id}`;

      if (!(await isRegistered(fullId, dir))) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Block not found: ${fullId}` }, null, 2),
            },
          ],
        };
      }

      const block = await loadById(fullId, dir);

      if (format === 'json') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(block, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: block.content,
          },
        ],
      };
    }
  );

  return server;
}

/**
 * Start the MCP server with stdio transport
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error(`TREF MCP Server v${VERSION} running on stdio`);
}

// Run if executed directly
main().catch(err => {
  console.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

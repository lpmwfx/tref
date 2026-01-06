import { z } from 'zod';
import { RefSchema } from './reference.js';

/**
 * Block ID format: sha256:<hex>
 */
const BlockIdSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);

/**
 * Metadata schema
 */
export const MetaSchema = z.object({
  author: z.string().optional(),
  created: z.string().datetime(),
  modified: z.string().datetime().optional(),
  license: z.string().default('AIBlocks-1.0'),
  lang: z.string().length(2).optional(), // ISO 639-1
});

/**
 * Origin schema - where block is published
 */
export const OriginSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
});

/**
 * AIBlock schema v1
 *
 * A self-contained unit of knowledge with content, metadata,
 * references, and lineage.
 */
export const AIBlockSchema = z.object({
  v: z.literal(1),
  id: BlockIdSchema,
  content: z.string().min(1),
  meta: MetaSchema,
  origin: OriginSchema.optional(),
  refs: z.array(RefSchema).default([]),
  parent: BlockIdSchema.optional(),
});

/** @typedef {z.infer<typeof AIBlockSchema>} AIBlock */
/** @typedef {z.infer<typeof MetaSchema>} Meta */
/** @typedef {z.infer<typeof OriginSchema>} Origin */

/**
 * Parse and validate a block
 * @param {unknown} data
 * @returns {AIBlock}
 * @throws {z.ZodError}
 */
export function parseBlock(data) {
  return AIBlockSchema.parse(data);
}

/**
 * Safely parse a block without throwing
 * @param {unknown} data
 * @returns {{ success: true, data: AIBlock } | { success: false, error: z.ZodError }}
 */
export function safeParseBlock(data) {
  return AIBlockSchema.safeParse(data);
}

/**
 * Check if data is a valid block
 * @param {unknown} data
 * @returns {boolean}
 */
export function isValidBlock(data) {
  return AIBlockSchema.safeParse(data).success;
}

/**
 * Schema for block without ID (before publishing)
 */
export const DraftBlockSchema = AIBlockSchema.omit({ id: true });

/** @typedef {z.infer<typeof DraftBlockSchema>} DraftBlock */

/**
 * Create a draft block (without ID)
 * @param {string} content - Markdown content
 * @param {object} [options]
 * @param {string} [options.author]
 * @param {string} [options.license]
 * @param {string} [options.lang]
 * @param {import('./reference.js').Ref[]} [options.refs]
 * @param {string} [options.parent]
 * @returns {DraftBlock}
 */
export function createDraft(content, options = {}) {
  return DraftBlockSchema.parse({
    v: 1,
    content,
    meta: {
      author: options.author,
      created: new Date().toISOString(),
      license: options.license ?? 'AIBlocks-1.0',
      lang: options.lang,
    },
    refs: options.refs ?? [],
    parent: options.parent,
  });
}

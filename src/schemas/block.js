import { z } from 'zod';
import { ReferenceSchema } from './reference.js';

/**
 * Block types enum - all supported block categories
 */
export const BlockType = /** @type {const} */ ({
  ARTICLE: 'article',
  DATA: 'data',
  REFERENCE: 'reference',
  PROMPT: 'prompt',
  SUMMARY: 'summary',
});

/**
 * Metadata schema with timestamps
 */
export const MetadataSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.string().optional(),
  source: z.string().optional(),
});

/**
 * License schema for attribution preservation
 */
export const LicenseSchema = z.object({
  type: z.string(), // e.g., 'CC-BY-4.0', 'MIT', 'proprietary'
  url: z.string().url().optional(),
  attribution: z.string().optional(),
});

/**
 * Lineage schema for block versioning and parent/child tracking
 */
export const LineageSchema = z.object({
  parentId: z.string().uuid().optional(), // derivedFrom reference
  version: z.number().int().positive().default(1),
  childIds: z.array(z.string().uuid()).default([]),
});

/**
 * Core Block schema - the fundamental unit of knowledge
 *
 * A block is self-contained with content, metadata, license,
 * references, and lineage information.
 */
export const BlockSchema = z.object({
  // Identity
  id: z.string().uuid(),
  type: z.enum(['article', 'data', 'reference', 'prompt', 'summary']),

  // Content
  content: z.string(),
  title: z.string().optional(),

  // Attribution
  license: LicenseSchema.optional(),
  metadata: MetadataSchema,

  // Lineage (parent/child relationships)
  lineage: LineageSchema.default({ version: 1, childIds: [] }),

  // References (URLs, archive snippets, search prompts, hashes)
  references: z.array(ReferenceSchema).default([]),
});

/** @typedef {z.infer<typeof BlockSchema>} Block */
/** @typedef {z.infer<typeof MetadataSchema>} Metadata */
/** @typedef {z.infer<typeof LicenseSchema>} License */
/** @typedef {z.infer<typeof LineageSchema>} Lineage */

/**
 * Create a new block with validation
 * @param {unknown} data - Raw input data
 * @returns {Block}
 * @throws {z.ZodError} If validation fails
 */
export function createBlock(data) {
  return BlockSchema.parse(data);
}

/**
 * Safely parse block data without throwing
 * @param {unknown} data - Raw input data
 * @returns {{ success: true, data: Block } | { success: false, error: z.ZodError }}
 */
export function safeCreateBlock(data) {
  return BlockSchema.safeParse(data);
}

/**
 * Validate block data
 * @param {unknown} data - Data to validate
 * @returns {boolean}
 */
export function isValidBlock(data) {
  return BlockSchema.safeParse(data).success;
}

import { z } from 'zod';

// Schema definitions with Zod for runtime validation
const BlockSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'code', 'image']),
  content: z.string(),
  metadata: z
    .object({
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
    })
    .optional(),
});

/** @typedef {z.infer<typeof BlockSchema>} Block */

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
 * @param {Block[]} blocks
 * @param {Block['type']} type
 * @returns {Block[]}
 */
export function filterBlocksByType(blocks, type) {
  return blocks.filter(block => block.type === type);
}

/**
 * @template T
 * @param {T[]} items
 * @returns {T | undefined}
 */
export function first(items) {
  return items[0];
}

// Main entry point
function main() {
  const testData = {
    id: crypto.randomUUID(),
    type: 'text',
    content: 'Hello, TREF!',
    metadata: {
      createdAt: new Date(),
    },
  };

  const result = safeCreateBlock(testData);

  if (result.success) {
    console.log('Block created:', result.data);
  } else {
    console.error('Validation failed:', result.error.issues);
  }
}

main();

import { z } from 'zod';

/**
 * Reference types enum
 */
export const ReferenceType = /** @type {const} */ ({
  URL: 'url',
  ARCHIVE: 'archive',
  SEARCH: 'search',
  HASH: 'hash',
});

/**
 * URL reference - classic web link
 */
export const UrlReferenceSchema = z.object({
  type: z.literal('url'),
  url: z.string().url(),
  title: z.string().optional(),
  accessedAt: z.coerce.date().optional(),
});

/**
 * Archive reference - RAG snippet for dead link recovery
 * Preserves content when links die
 */
export const ArchiveReferenceSchema = z.object({
  type: z.literal('archive'),
  originalUrl: z.string().url().optional(),
  snippet: z.string(), // archived text content
  archivedAt: z.coerce.date(),
  context: z.string().optional(), // surrounding context
});

/**
 * Search reference - query for refinding content
 * Allows reconstruction of reference via search
 */
export const SearchReferenceSchema = z.object({
  type: z.literal('search'),
  query: z.string(), // search prompt
  engine: z.string().optional(), // e.g., 'google', 'duckduckgo'
  expectedTitle: z.string().optional(),
  expectedDomain: z.string().optional(),
});

/**
 * Hash reference - integrity verification
 * Cryptographic proof of content
 */
export const HashReferenceSchema = z.object({
  type: z.literal('hash'),
  algorithm: z.enum(['sha256', 'sha384', 'sha512']),
  value: z.string(),
  target: z.string().optional(), // what was hashed (URL, content ID, etc.)
});

/**
 * Union of all reference types
 */
export const ReferenceSchema = z.discriminatedUnion('type', [
  UrlReferenceSchema,
  ArchiveReferenceSchema,
  SearchReferenceSchema,
  HashReferenceSchema,
]);

/** @typedef {z.infer<typeof ReferenceSchema>} Reference */
/** @typedef {z.infer<typeof UrlReferenceSchema>} UrlReference */
/** @typedef {z.infer<typeof ArchiveReferenceSchema>} ArchiveReference */
/** @typedef {z.infer<typeof SearchReferenceSchema>} SearchReference */
/** @typedef {z.infer<typeof HashReferenceSchema>} HashReference */

/**
 * Create a URL reference
 * @param {string} url
 * @param {string} [title]
 * @returns {UrlReference}
 */
export function createUrlReference(url, title) {
  return UrlReferenceSchema.parse({
    type: 'url',
    url,
    title,
    accessedAt: new Date(),
  });
}

/**
 * Create an archive reference (RAG snippet)
 * @param {string} snippet - Archived text content
 * @param {string} [originalUrl] - Original URL if known
 * @param {string} [context] - Surrounding context
 * @returns {ArchiveReference}
 */
export function createArchiveReference(snippet, originalUrl, context) {
  return ArchiveReferenceSchema.parse({
    type: 'archive',
    snippet,
    originalUrl,
    context,
    archivedAt: new Date(),
  });
}

/**
 * Create a search reference
 * @param {string} query - Search query for refinding
 * @param {object} [options]
 * @param {string} [options.engine]
 * @param {string} [options.expectedTitle]
 * @param {string} [options.expectedDomain]
 * @returns {SearchReference}
 */
export function createSearchReference(query, options = {}) {
  return SearchReferenceSchema.parse({
    type: 'search',
    query,
    ...options,
  });
}

/**
 * Create a hash reference
 * @param {string} value - Hash value
 * @param {'sha256' | 'sha384' | 'sha512'} [algorithm='sha256']
 * @param {string} [target] - What was hashed
 * @returns {HashReference}
 */
export function createHashReference(value, algorithm = 'sha256', target) {
  return HashReferenceSchema.parse({
    type: 'hash',
    algorithm,
    value,
    target,
  });
}

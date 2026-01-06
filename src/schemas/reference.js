import { z } from 'zod';

/**
 * URL reference - classic web link
 */
export const UrlRefSchema = z.object({
  type: z.literal('url'),
  url: z.string().url(),
  title: z.string().optional(),
  accessed: z.string().datetime().optional(),
});

/**
 * Archive reference - preserved content for dead links (RAG snippet)
 */
export const ArchiveRefSchema = z.object({
  type: z.literal('archive'),
  snippet: z.string(),
  from: z.string().url().optional(),
  archived: z.string().datetime().optional(),
  context: z.string().optional(),
});

/**
 * Search reference - query to refind content
 */
export const SearchRefSchema = z.object({
  type: z.literal('search'),
  query: z.string(),
  engine: z.string().optional(),
  expect: z.string().optional(),
});

/**
 * Hash reference - cryptographic verification
 */
export const HashRefSchema = z.object({
  type: z.literal('hash'),
  alg: z.enum(['sha256', 'sha384', 'sha512']),
  value: z.string(),
  of: z.string().optional(),
});

/**
 * Union of all reference types
 */
export const RefSchema = z.discriminatedUnion('type', [
  UrlRefSchema,
  ArchiveRefSchema,
  SearchRefSchema,
  HashRefSchema,
]);

/** @typedef {z.infer<typeof RefSchema>} Ref */
/** @typedef {z.infer<typeof UrlRefSchema>} UrlRef */
/** @typedef {z.infer<typeof ArchiveRefSchema>} ArchiveRef */
/** @typedef {z.infer<typeof SearchRefSchema>} SearchRef */
/** @typedef {z.infer<typeof HashRefSchema>} HashRef */

/**
 * Create a URL reference
 * @param {string} url
 * @param {string} [title]
 * @returns {UrlRef}
 */
export function urlRef(url, title) {
  return UrlRefSchema.parse({
    type: 'url',
    url,
    title,
    accessed: new Date().toISOString(),
  });
}

/**
 * Create an archive reference (RAG snippet)
 * @param {string} snippet
 * @param {string} [from]
 * @param {string} [context]
 * @returns {ArchiveRef}
 */
export function archiveRef(snippet, from, context) {
  return ArchiveRefSchema.parse({
    type: 'archive',
    snippet,
    from,
    context,
    archived: new Date().toISOString(),
  });
}

/**
 * Create a search reference
 * @param {string} query
 * @param {object} [options]
 * @param {string} [options.engine]
 * @param {string} [options.expect]
 * @returns {SearchRef}
 */
export function searchRef(query, options = {}) {
  return SearchRefSchema.parse({
    type: 'search',
    query,
    ...options,
  });
}

/**
 * Create a hash reference
 * @param {string} value
 * @param {'sha256' | 'sha384' | 'sha512'} [alg='sha256']
 * @param {string} [of]
 * @returns {HashRef}
 */
export function hashRef(value, alg = 'sha256', of) {
  return HashRefSchema.parse({
    type: 'hash',
    alg,
    value,
    of,
  });
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIBlocks is an open, transportable, and verifiable block format for preserving, validating, and reusing knowledge with traceable source origin. It's a knowledge-bearing object format (not a CMS or AI model) where content, metadata, licenses, references, and history are combined in self-contained units.

## Development Approach: TypeScript-Level Safety in Pure JavaScript

This project uses ES2024 JavaScript with JSDoc type annotations, validated by TypeScript CLI without transpilation. No build step required.

**The safety stack:**
- **JSDoc** → Static types via comments
- **TypeScript CLI** → Type checking (no emit)
- **ESLint + typescript-eslint** → Type-aware linting
- **Zod** → Runtime validation at boundaries
- **Prettier** → Formatting

## Commands

```bash
# Full check (typecheck + lint + format check)
npm run check

# Individual checks
npm run typecheck     # tsc --project jsconfig.json
npm run lint          # eslint src/
npm run format:check  # prettier --check src/

# Fix/format
npm run lint:fix      # eslint src/ --fix
npm run format        # prettier --write src/

# Run tests
npm test              # node --test src/**/*.test.js

# Run application
npm start             # node src/index.js
```

## Code Patterns

### Type Annotations (JSDoc)

```javascript
/** @typedef {z.infer<typeof SomeSchema>} SomeType */

/**
 * @param {unknown} data - Use unknown for external input
 * @returns {SomeType}
 */
function parse(data) {
  return SomeSchema.parse(data);
}
```

### Runtime Validation with Zod

Use Zod schemas for all external data boundaries. Derive types from schemas using `z.infer<typeof Schema>`.

```javascript
const Schema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'code', 'image']),
});

/** @typedef {z.infer<typeof Schema>} MyType */
```

### Strict Type Checking

jsconfig.json enables strict mode: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

## Language Rule

**All content in English before push.** Translate any Danish text in code, docs, and project files to English before committing/pushing. This includes `/doc/*.md` and project management files.

## Architecture

Current structure is minimal:
- `src/index.js` - Entry point with Block schema and validation functions
- `doc/` - Project documentation including the JS+JSDoc typing approach

The Block concept is central: self-contained units with id, type, content, and optional metadata. Blocks support lineage tracking (parent/child relationships) for knowledge provenance.

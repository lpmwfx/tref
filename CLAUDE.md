# CLAUDE.md - TREF Project Instructions

## Project
INFO: TREF = Traceable Reference Format - self-contained knowledge blocks
INFO: Content + metadata + licenses + references + history in one unit

## Architecture
RULE: Single source principle - src/ is truth, dist/ is built output
RULE: Never edit dist/ - always edit src/ and run build
PATH: src/wrapper/wrapper.js → builds to → dist/tref-block.js
PATH: src/cli/ - CLI tool
PATH: src/mcp/ - MCP server
PATH: src/index.js - main entry, schemas
PATH: demo/ - visual testing (imports from dist/)
PATH: docs/ - GitHub Pages site (tref.lpmwfx.com)
PATH: doc/ - project documentation

## Commands
CMD: npm run build - full build (browser + CLI)
CMD: npm run build:browser - src/ → dist/tref-block.js
CMD: npm run dev - dev server on localhost:8080
CMD: npm run check - typecheck + lint + format check
CMD: npm test - run tests

## Code Style
RULE: ES2024 JavaScript with JSDoc type annotations
RULE: TypeScript CLI for type checking (no transpilation)
RULE: Zod schemas for all external data validation
RULE: Derive types from Zod: z.infer<typeof Schema>
RULE: Use unknown for external input parameters

## CSS
RULE: All site styles in docs/css/tref-site.css (single file)
RULE: No inline <style> blocks in HTML
RULE: Use CSS variables for theming (:root, html.dark)
RULE: Grouped selectors for shared patterns
RULE: Cascade over duplication

## Identity
RULE: Use "lpmwfx" for all public-facing content
BANNED: "lpm" alone in any tracked file (private identity)

## Language
RULE: All content in English before push

## Release Process
STEP: Update version in package.json
STEP: Update CHANGELOG
STEP: Update ?v=X.Y.Z cache-busting in docs/*.html
STEP: npm run build && npm test
STEP: git commit, tag, push --tags
STEP: gh release create

## Block ID
RULE: ID = SHA-256 hash of content field only (not entire block)
RULE: Enables browser-side validation: hash content, compare to ID

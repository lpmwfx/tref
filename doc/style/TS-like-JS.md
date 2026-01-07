# TypeScript-Level Safety in Pure JavaScript

Modern JavaScript (ES2024+) with the right tooling can achieve TypeScript-level safety—and in some cases exceed it with runtime validation.

## The Stack

```
JSDoc Types     → Static type checking (design time)
TypeScript CLI  → Type verification (build time)
ESLint          → Code quality + type-aware rules
Zod/Valibot     → Runtime validation (execution time)
Prettier        → Consistent formatting
```

## 1. JSDoc Type Annotations

JSDoc provides full TypeScript-compatible type syntax in comments:

```javascript
/** @type {string} */
let name = "Alice";

/** @type {number[]} */
const scores = [95, 87, 92];

/** @type {{ id: number, name: string }} */
const user = { id: 1, name: "Bob" };

/**
 * @param {string} greeting
 * @param {string} name
 * @returns {string}
 */
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T | undefined}
 */
function first(arr) {
  return arr[0];
}
```

### Advanced JSDoc Patterns

```javascript
/** @typedef {{ id: number, email: string, role: 'admin' | 'user' }} User */

/** @type {User} */
const currentUser = { id: 1, email: "a@b.com", role: "admin" };

/**
 * @param {object} options
 * @param {string} options.url
 * @param {'GET' | 'POST'} [options.method='GET']
 * @param {Record<string, string>} [options.headers]
 * @returns {Promise<Response>}
 */
async function request({ url, method = 'GET', headers }) {
  return fetch(url, { method, headers });
}

/** @type {Map<string, User>} */
const userCache = new Map();

/** @type {(a: number, b: number) => number} */
const add = (a, b) => a + b;
```

## 2. TypeScript as Type Checker (No Compilation)

Use TypeScript CLI to check JavaScript files without transpiling:

### jsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "checkJs": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*.js"],
  "exclude": ["node_modules"]
}
```

### Check Command

```bash
npx tsc --project jsconfig.json
```

## 3. ESLint with Type-Aware Rules

### eslint.config.js (Flat Config - ESLint 9+)

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './jsconfig.json',
      },
    },
    rules: {
      // Type-aware rules that work with JSDoc
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',

      // Additional safety
      'no-implicit-coercion': 'error',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  }
);
```

## 4. Runtime Validation with Zod

Static types disappear at runtime. Zod provides runtime validation with TypeScript inference:

```javascript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  createdAt: z.coerce.date(),
});

/** @typedef {z.infer<typeof UserSchema>} User */

/**
 * @param {unknown} data
 * @returns {User}
 */
function parseUser(data) {
  return UserSchema.parse(data); // Throws on invalid
}

/**
 * @param {unknown} data
 * @returns {{ success: true, data: User } | { success: false, error: z.ZodError }}
 */
function safeParseUser(data) {
  return UserSchema.safeParse(data);
}

// API boundary validation
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return parseUser(data); // Validated!
}
```

### Zod Patterns

```javascript
// Composition
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{4}$/),
});

const FullUserSchema = UserSchema.extend({
  address: AddressSchema.optional(),
});

// Transformations
const NumberFromString = z.string().transform(s => parseInt(s, 10));

// Refinements
const Password = z.string()
  .min(8)
  .refine(s => /[A-Z]/.test(s), 'Must contain uppercase')
  .refine(s => /[0-9]/.test(s), 'Must contain number');

// Discriminated unions
const ResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.unknown() }),
  z.object({ status: z.literal('error'), message: z.string() }),
]);
```

### Valibot Alternative (Smaller Bundle)

```javascript
import * as v from 'valibot';

const UserSchema = v.object({
  id: v.pipe(v.number(), v.integer(), v.minValue(1)),
  email: v.pipe(v.string(), v.email()),
  role: v.picklist(['admin', 'user']),
});

const result = v.safeParse(UserSchema, data);
```

## 5. Prettier for Formatting

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

## 6. Complete package.json Scripts

```json
{
  "type": "module",
  "scripts": {
    "typecheck": "tsc --project jsconfig.json",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "check": "npm run typecheck && npm run lint && npm run format:check",
    "precommit": "npm run check"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.18.2"
  },
  "dependencies": {
    "zod": "^3.24.1"
  }
}
```

## 7. VS Code Settings

### .vscode/settings.json

```json
{
  "js/ts.implicitProjectConfig.checkJs": true,
  "javascript.suggest.completeFunctionCalls": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 8. Additional Tools

| Tool | Purpose |
|------|---------|
| `knip` | Find unused exports, dependencies, files |
| `publint` | Validate package.json for publishing |
| `attw` | Check TypeScript types for package consumers |
| `depcheck` | Find unused dependencies |
| `madge` | Detect circular dependencies |

### knip.json

```json
{
  "entry": ["src/index.js"],
  "project": ["src/**/*.js"],
  "ignore": ["**/*.test.js"]
}
```

## 9. Git Hooks with Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

### .husky/pre-commit

```bash
npx lint-staged
```

### package.json

```json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md}": "prettier --write"
  }
}
```

## 10. Why This Beats TypeScript Sometimes

| Aspect | TypeScript | JS + Tooling |
|--------|-----------|--------------|
| Build step | Required | None |
| Source maps | Needed for debugging | Native debugging |
| Runtime validation | Still need Zod | Same |
| Bundle size | Larger (optional chaining polyfills, etc.) | Native ES2024 |
| Learning curve | New syntax | Standard JS + JSDoc |
| Ecosystem | Full | 99% compatible |
| Error messages | TypeScript errors | Same (uses tsc) |

## Quick Start Template

```bash
mkdir my-project && cd my-project
npm init -y
npm pkg set type=module
npm install -D typescript eslint @eslint/js typescript-eslint prettier
npm install zod

# Create jsconfig.json, eslint.config.js, .prettierrc as shown above

# Add scripts
npm pkg set scripts.check="tsc -p jsconfig.json && eslint src/"
```

## Summary

1. **JSDoc** for type annotations
2. **TypeScript CLI** (`tsc --noEmit`) for static checking
3. **ESLint + typescript-eslint** for code quality
4. **Zod/Valibot** for runtime validation at boundaries
5. **Prettier** for formatting
6. **Husky + lint-staged** for pre-commit enforcement

This gives you TypeScript-level safety with zero build step, native debugging, and runtime validation that TypeScript alone cannot provide.

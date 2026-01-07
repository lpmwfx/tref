# TREF MCP Server - Evaluation Report

**Date:** 2026-01-06
**Version:** 1.0.0
**Tested by:** Claude (via MCP integration)

---

## Overview

The TREF MCP Server exposes the AIBlocks/TREF format as 6 tools accessible to AI assistants via Model Context Protocol (MCP). This enables AI to create, read, derive, and validate traceable knowledge blocks directly within chat sessions.

---

## Tools Summary

| Tool | Purpose | Status |
|------|---------|--------|
| `tref_publish` | Create new block from content | Working |
| `tref_list` | List all blocks in registry | Working |
| `tref_info` | Get block metadata | Working |
| `tref_cat` | Read block content | Working |
| `tref_derive` | Create child block from parent | Working |
| `tref_validate` | Verify block integrity | Working |

---

## What Works Well

### 1. Seamless AI Integration
The MCP interface allows AI to work with TREF blocks without leaving the conversation. Creating, reading, and deriving blocks is a natural part of the workflow.

### 2. Content-Addressed Storage
SHA-256 hashing ensures:
- Same content = same ID (deduplication)
- Any change = new ID (immutability)
- ID can verify content integrity

### 3. Lineage Preservation
`tref_derive` automatically:
- Sets parent reference
- Inherits all refs from parent
- Allows adding new refs
- Creates proper ancestry chain

### 4. Reference Types
Four ref types cover most citation needs:
- `url` - Web links with metadata
- `archive` - Preserved snippets (RAG-friendly)
- `search` - Queries to refind content
- `hash` - Cryptographic verification

### 5. Full ID Requirement
Requiring full `sha256:...` ID for operations (by design) ensures:
- No ambiguous lookups
- Cryptographic traceability maintained
- Copy-paste safety

### 6. Clean JSON Output
All tools return well-formatted JSON with relevant fields, making parsing and display straightforward.

---

## Areas for Improvement

### 1. Error Messages
When `tref_info` fails with short ID, error says "Block not found" without suggesting to use full ID. Consider:
```json
{ "error": "Use full ID (sha256:...) from tref_list" }
```

### 2. Batch Operations
No way to publish or validate multiple blocks at once. Could add:
- `tref_publish_batch` - Multiple blocks from array
- `tref_validate_dir` - Validate all blocks in directory

### 3. Search/Query
No tool to search blocks by content or refs. Consider:
- `tref_search` - Find blocks containing text
- `tref_find_by_ref` - Find blocks citing a URL

### 4. Lineage Traversal
No tool to walk the parent chain. Consider:
- `tref_ancestors` - Get full lineage to root
- `tref_children` - Find derived blocks

### 5. Export Formats
Only JSON output. Could add:
- `format: "markdown"` - Just the content with header
- `format: "citation"` - Formatted citation string

### 6. Registry Management
No cleanup tools:
- `tref_delete` - Remove block (with warning)
- `tref_gc` - Remove orphaned files

---

## Use Cases

### 1. AI Research Assistant
AI researches a topic, creates blocks with refs to sources:
```
User: "Research quantum computing basics"
AI: [searches, reads sources]
AI: [tref_publish with content + url refs to arxiv papers]
→ User gets traceable knowledge block
```

### 2. Collaborative Writing
Human and AI iterate on content with full history:
```
Human: writes draft → [tref_publish] → Block A
AI: expands draft → [tref_derive from A] → Block B
Human: edits → [tref_derive from B] → Block C
→ Full lineage preserved
```

### 3. Fact-Checking Pipeline
AI validates claims by checking refs:
```
AI: [tref_cat to read block]
AI: [checks each ref URL]
AI: [tref_derive with corrected refs or archive snippets]
```

### 4. Knowledge Base Building
Accumulate verified knowledge:
```
AI: [tref_publish] multiple topic blocks
AI: [tref_list] to see collection
AI: [tref_derive] to create synthesis block linking parents
```

### 5. Citation Drag-and-Drop
From demo: blocks can be dragged into chats, preserving refs automatically. MCP enables the AI side of this workflow.

### 6. RAG Source Attribution
When AI uses RAG snippets, it can:
```
AI: [tref_publish with archive refs containing snippets]
→ AI's sources are explicit, not hidden
```

---

## Technical Notes

### Storage Structure
```
published/
├── ab/
│   └── ab12...cdef.tref
├── cd/
│   └── cd34...5678.tref
└── published.json  (registry index)
```

Two-character prefix directories prevent filesystem issues with many files.

### MCP Transport
Uses stdio - server reads from stdin, writes to stdout. Logs go to stderr (important: console.log would break protocol).

### Dependencies
- `@modelcontextprotocol/sdk` - MCP server framework
- `zod` - Schema validation
- Core publisher modules for block operations

---

## Conclusion

The TREF MCP Server successfully bridges AI assistants with the AIBlocks format. The core functionality is solid:

- **Publishing works** - Content becomes traceable blocks
- **Derivation works** - Lineage and refs are preserved
- **Validation works** - Integrity can be verified

The main value is enabling AI to produce **accountable output**. Instead of generating text with hidden sources, AI can create blocks where refs are explicit and verifiable.

### Recommendations

1. **Short term:** Better error messages, add `tref_search`
2. **Medium term:** Lineage traversal tools, batch operations
3. **Long term:** Integration with RAG pipelines for automatic ref extraction

The format's principle - "references are structural, not optional" - becomes enforceable when AI uses these tools. This is the key insight: MCP makes the format's guarantees practical for AI workflows.

---

## Test Results

All tests performed in `/test-mcp/` directory:

| Test | Input | Result |
|------|-------|--------|
| publish | Content + URL ref | Block `ce02363f` created |
| list | - | Found 1 block |
| info | Full ID | Metadata returned |
| info | Short ID | Failed (by design) |
| cat content | Full ID | Content returned |
| cat json | Full ID | Full block JSON |
| derive | Parent ID + new content | Block `df7eefa6` with lineage |
| validate good | Valid .tref file | `valid: true` |
| validate bad | Fake .tref | Schema errors caught |

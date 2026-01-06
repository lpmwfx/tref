# AIBlocks License Model

## The Principle

> **Use freely. Preserve the format. References follow automatically.**

This is not a traditional license with legal text you must interpret. The format itself IS the license mechanism.

---

## How It Works

### When You Use an AIBlock

1. **You CAN:**
   * Read the content
   * Copy the entire block
   * Modify the content
   * Translate, summarize, expand
   * Use commercially
   * Share freely

2. **The Format Ensures:**
   * Original references remain in `refs`
   * Lineage points to source in `parent`
   * Attribution is structural, not manual
   * Your modifications get a new ID

3. **You Break the License If:**
   * You remove refs from derived blocks
   * You falsify lineage
   * You strip the format and use raw content without attribution

---

## The Technical Mechanism

### Traditional License
```
Content + Legal Text → Reader must comply manually
                    → Difficult to verify
                    → Easy to ignore
```

### AIBlocks Format-as-License
```
Content + Format → Publisher enforces structure
               → AI can verify compliance
               → References travel with content
               → Automatic attribution
```

---

## For Authors

When you publish content as an AIBlock:

* Your article lives in `content` as markdown
* Your identity is in `origin` (URL to your published block)
* Anyone can reuse your work
* Their derived blocks will automatically reference yours
* The reference tree grows organically

**You get:**
* Automatic backlinks from derivative works
* Verifiable attribution chain
* AI-readable source credit
* No manual enforcement needed

---

## For Users

When you use someone's AIBlock:

* Edit the markdown however you want
* Run through Publisher
* New block is created with:
  * New content-based ID (yours)
  * `parent` pointing to original
  * Original `refs` preserved
  * Your additions clearly separate

**You get:**
* Legal, legitimate reuse
* Proper attribution without manual work
* Your own block you control
* Clear provenance for your content

---

## For AI Systems

AI can:

* Validate block structure
* Verify refs are intact
* Follow lineage to sources
* Reject malformed blocks
* Create properly formatted derivative blocks

This enables AI to be a **trust layer** for content verification.

---

## Comparison to Traditional Licenses

| Aspect | CC-BY | MIT | AIBlocks |
|--------|-------|-----|----------|
| Attribution | Manual | Manual | Automatic |
| Verification | Hard | Hard | Machine-verifiable |
| Enforcement | Legal | Legal | Technical + Social |
| AI-friendly | No | No | Yes |
| Survives editing | Maybe | Maybe | Yes (via lineage) |

---

## Summary

AIBlocks doesn't rely on legal enforcement. It relies on:

1. **Format structure** – refs can't be accidentally removed
2. **Publisher** – ensures new blocks have correct lineage
3. **AI verification** – can validate compliance
4. **Social proof** – broken blocks are visibly broken

The license is the format. Use the format correctly, and you're compliant.

---

## SPDX Identifier

For compatibility with existing systems:

```
SPDX-License-Identifier: AIBlocks-1.0
```

Full terms: Use freely with format preservation. Attribution via `parent` and `refs` fields.

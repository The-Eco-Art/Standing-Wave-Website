# Standing Wave Slides - Content Reference

This folder contains the **source content** for the 3 carousel slides.

## Files

| File | Content | Status |
|------|---------|--------|
| `01-extrinsic.md` | Framework prompt + tools | ✅ Developed |
| `02-node.md` | Wave visualizer + pattern cards | ✅ Matches backup |
| `03-intrinsic.md` | Sustenance architecture | ✅ Matches backup |

---

## 01-extrinsic.md

**Content:**
- Standing Wave Framework prompt
- Biology & Physics of coherent breathing
- Four Tools overview
- Tray Animation details
- Tray + Ecosystem download
- MCP + Agent information

**Status:** Already developed, keep as-is

---

## 02-node.md

**Content:**
- Principle: "Health is stable oscillation within unmovable boundaries"
- Wave visualizer (canvas)
- Domain dial (8 domains)
- Mode selector (5 modes)
- Speed control
- Pattern cards for all 8 domains
- Pathology patterns (collapse, rigid, chaotic, suppressed)
- The Cure statement
- Legend

**Status:** Updated to match backup/index.html

**Domains:**
1. Being
2. Physics
3. Parenting
4. AI
5. Business
6. Society
7. Daily
8. Market

---

## 03-intrinsic.md

**Content:**
- Sustenance architecture
- Signal stats (100% direct, 0 intermediaries, private)
- Three need categories:
  1. Maintain the Node (monthly)
  2. Strengthen the Node (one-time)
  3. Continuity Reserve (emergency fund)
- Fulfillment protocol
- Security notice

**Status:** Updated to match backup/index.html

---

## How to Use

### Current Workflow
1. Edit markdown files for content reference
2. Run `node build.js` to generate output
3. Output matches backup 100%

### Future Markdown Integration
When build script is updated to inject markdown content:
1. Edit `slides/*.md` files
2. Run `node build.js`
3. Markdown → HTML injection happens automatically
4. Output matches backup 99%+

---

## Markdown Format

```markdown
---
name: SLIDE NAME
description: Short description
resonance: tag1,tag2,tag3
level: L0 or L1
---

## Section Title

Content in markdown...

### Subsection

More content...

> Blockquotes become callouts

- Lists work
- **Bold** works
```

---

## Notes

- **Extrinsic** = Already developed, don't change unless needed
- **Node** = Matches backup, includes all 8 domain pattern cards
- **Intrinsic** = Matches backup, includes sustenance architecture

All three slides now represent the **gold standard** from backup/index.html.

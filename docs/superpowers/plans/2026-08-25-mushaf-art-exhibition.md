# Mushaf Zarrar Art Exhibition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, animated art exhibition using 23 supplied artworks and 6 supplied videos, with a content workflow that makes later additions easy.

**Architecture:** A framework-free Vite site loads a generated media catalogue and renders a native scroll-snap exhibition, an accessible full-gallery dialog, and a dark video room. A Node content script scans source media, generates responsive WebP artwork derivatives with Sharp, copies videos, and writes a browser-ready catalogue.

**Tech Stack:** Semantic HTML, modern CSS, ES modules, Vite, Sharp, Node test runner, Playwright CLI, GitHub Actions Pages deployment

**Spec:** `docs/superpowers/specs/2026-08-25-mushaf-art-exhibition-design.md`

## Global Constraints

- Keep all work on `main`.
- Use natural artwork aspect ratios and never crop gallery artwork.
- Use pale concrete, black rails, cobalt wayfinding, and a near-black video room.
- Do not use gradients, purple, glass effects, generic cards, or SaaS styling.
- Do not fabricate artwork dates. Use `Undated` when no reliable date is available.
- Keep runtime dependencies at zero and development dependencies minimal.
- Support keyboard, touch, wheel, adjacent click, reduced motion, and native video controls.
- Do not add AI attribution, co-author trailers, generated-by text, or em dashes.

---

### Task 1: Project foundation and content normalisation

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `scripts/content-utils.mjs`
- Create: `scripts/content-utils.test.mjs`
- Create: `content/metadata.json`
- Create: `content/artworks/*`
- Create: `content/videos/*`
- Create: `scripts/sync-content.mjs`
- Generate: `public/media/artworks/*`
- Generate: `public/media/videos/*`
- Generate: `src/generated/gallery.js`

**Interfaces:**
- Produces: `humaniseFilename(filename: string, kind: "artwork" | "video"): string`
- Produces: `normaliseEntry(file, metadata, kind): GalleryEntry`
- Produces: `GalleryEntry = { id, kind, title, date, medium, alt, src, sources?, width?, height?, duration? }`

- [ ] **Step 1: Write failing filename and metadata tests**

```js
test('humanises named artwork files', () => {
  assert.equal(humaniseFilename('MoonknightArt.PNG', 'artwork'), 'Moonknight')
})

test('preserves curated metadata and safe fallbacks', () => {
  const entry = normaliseEntry({ name: 'CardsArt.JPG' }, {}, 'artwork')
  assert.equal(entry.title, 'Cards')
  assert.equal(entry.date, 'Undated')
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test scripts/content-utils.test.mjs`
Expected: FAIL because `content-utils.mjs` does not exist.

- [ ] **Step 3: Implement content utility functions**

Implement camel-case splitting, suffix removal, stable slug creation, curated override merging, and `Undated` fallback without using file timestamps as artwork dates.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test scripts/content-utils.test.mjs`
Expected: all content utility tests pass.

- [ ] **Step 5: Add the content sync script and source media**

The script scans `content/artworks` and `content/videos`, generates 640, 1200, and 2000 pixel WebP artwork widths without enlargement, copies MP4 files, and writes ordered entries to `src/generated/gallery.js`. The current lead artwork is `CardsArt.JPG`.

- [ ] **Step 6: Verify generated content**

Run: `npm run sync-content`
Expected: 23 artwork entries, 6 video entries, responsive artwork derivatives, and no source file larger than the original.

- [ ] **Step 7: Commit**

```text
feat: add media content pipeline
```

### Task 2: Exhibition state and semantic page structure

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/gallery-state.js`
- Create: `src/gallery-state.test.js`
- Create: `src/styles.css`

**Interfaces:**
- Consumes: `artworks` and `videos` from `src/generated/gallery.js`
- Produces: `createGalleryState(count, initialIndex)` with `getIndex()`, `select(index)`, `previous()`, `next()`, and `subscribe(listener)`
- Produces: semantic landmarks and stable element IDs used by interaction modules

- [ ] **Step 1: Write failing gallery state tests**

```js
test('selection clamps at the ends', () => {
  const state = createGalleryState(3, 0)
  state.previous()
  assert.equal(state.getIndex(), 0)
  state.select(99)
  assert.equal(state.getIndex(), 2)
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test src/gallery-state.test.js`
Expected: FAIL because `gallery-state.js` does not exist.

- [ ] **Step 3: Implement the gallery state**

Keep the state module DOM-free and notify subscribers only when the selected index changes.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test src/gallery-state.test.js`
Expected: all gallery state tests pass.

- [ ] **Step 5: Build the semantic document shell**

Create skip navigation, header, room navigation, exhibition section, live selection status, previous and next controls, Full Exhibition section, Videos section, About section, and footer. Render all artwork and video items from the generated catalogue.

- [ ] **Step 6: Add the base visual system**

Define concrete, ink, cobalt, video black, muted text, rail sizes, spacing, type stacks, focus rings, and zero-radius architectural components as CSS custom properties.

- [ ] **Step 7: Build and inspect HTML output**

Run: `npm run build`
Expected: Vite exits with code 0 and emits `dist/index.html` plus media assets.

- [ ] **Step 8: Commit**

```text
feat: build exhibition page structure
```

### Task 3: Gallery navigation and spatial motion

**Files:**
- Create: `src/gallery-controller.js`
- Create: `src/gallery-controller.test.js`
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `createGalleryState`, `.artwork-rail`, and `[data-artwork-index]`
- Produces: `createGalleryController({ rail, items, state, previousButton, nextButton, liveRegion })`
- Produces: active item classes, `aria-current`, metadata updates, URL hash updates, and focus-safe controls

- [ ] **Step 1: Write failing controller helper tests**

```js
test('normalises vertical wheel input to horizontal intent', () => {
  assert.equal(wheelDelta({ deltaX: 0, deltaY: 40 }), 40)
})

test('chooses the nearest item to the rail centre', () => {
  assert.equal(nearestItemIndex([80, 300, 520], 310), 1)
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test src/gallery-controller.test.js`
Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement controller helpers and verify GREEN**

Run: `node --test src/gallery-controller.test.js`
Expected: helper tests pass.

- [ ] **Step 4: Wire user inputs**

Connect adjacent clicks, previous and next controls, ArrowLeft and ArrowRight when focus is outside video controls, wheel intent, native touch scrolling, and debounced scroll selection.

- [ ] **Step 5: Add spatial motion**

Use scroll snap, selected-item scale and contrast, adjacent depth, metadata reveal, and a slower rail translation driven by a CSS custom property. Under `prefers-reduced-motion: reduce`, remove easing, parallax, masking, and transforms.

- [ ] **Step 6: Run unit tests and build**

Run: `npm test`
Expected: all Node tests pass.

Run: `npm run build`
Expected: production build passes.

- [ ] **Step 7: Commit**

```text
feat: add gallery navigation and motion
```

### Task 4: Full Exhibition and accessible detail dialog

**Files:**
- Create: `src/exhibition-dialog.js`
- Create: `src/exhibition-dialog.test.js`
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `createExhibitionDialog({ dialog, artworks, onSelect })`
- Produces: `wrapIndex(index, count): number`
- Consumes: generated artwork entries and gallery state selection callback

- [ ] **Step 1: Write failing index navigation tests**

```js
test('wrapIndex wraps detail navigation', () => {
  assert.equal(wrapIndex(-1, 23), 22)
  assert.equal(wrapIndex(23, 23), 0)
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test src/exhibition-dialog.test.js`
Expected: FAIL because `exhibition-dialog.js` does not exist.

- [ ] **Step 3: Implement dialog navigation and verify GREEN**

Use the native `dialog` element, restore focus to the opening thumbnail, close on Escape, and support previous and next navigation without cropping images.

Run: `node --test src/exhibition-dialog.test.js`
Expected: all dialog helper tests pass.

- [ ] **Step 4: Build the intrinsic-ratio exhibition overview**

Render all artworks in a responsive column layout with visible focus styles, sequential numbering, titles, and dates.

- [ ] **Step 5: Run all tests and build**

Run: `npm test && npm run build`
Expected: both commands exit with code 0.

- [ ] **Step 6: Commit**

```text
feat: add full exhibition view
```

### Task 5: Videos room and playback coordination

**Files:**
- Create: `src/video-room.js`
- Create: `src/video-room.test.js`
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `formatDuration(seconds): string`
- Produces: `createVideoRoom(videos: HTMLVideoElement[])`
- Consumes: generated video entries and native media metadata

- [ ] **Step 1: Write failing duration tests**

```js
test('formats media duration as minutes and seconds', () => {
  assert.equal(formatDuration(65.2), '01:05')
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test src/video-room.test.js`
Expected: FAIL because `video-room.js` does not exist.

- [ ] **Step 3: Implement duration and playback coordination**

On `loadedmetadata`, update the visible runtime. On `play`, pause every other registered video. Use native controls, `preload="metadata"`, and `playsinline`.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test src/video-room.test.js`
Expected: all video room tests pass.

- [ ] **Step 5: Finish the dark screening-room layout**

Feature a landscape process video at exhibition scale and arrange portrait edits as tall secondary works. Keep titles, dates, and runtimes aligned to the mockup's typographic system.

- [ ] **Step 6: Commit**

```text
feat: add process video room
```

### Task 6: Responsive polish, accessibility, and deployment

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`
- Create: `README.md`
- Create: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: the complete page and media catalogue
- Produces: documented local workflow, content update workflow, and GitHub Pages deployment

- [ ] **Step 1: Verify responsive rules manually at target widths**

Check 1487 by 1058 against the supplied mockup, then 390 by 844, 768 by 1024, and 1440 by 900. Preserve partial adjacent works where space permits and prevent document-level horizontal overflow.

- [ ] **Step 2: Complete accessibility states**

Verify skip navigation, heading order, focus order, focus contrast, live announcements, dialog focus restoration, 44 pixel touch targets, 200 percent zoom, reduced motion, and keyboard access.

- [ ] **Step 3: Add GitHub Pages workflow**

Use official checkout, setup-node, configure-pages, upload-pages-artifact, and deploy-pages actions. Build on pushes to `main` and allow manual dispatch.

- [ ] **Step 4: Write human-facing documentation**

Document `npm install`, `npm run dev`, `npm test`, `npm run build`, how to add files, how optional metadata overrides work, and how to enable Pages with GitHub Actions.

- [ ] **Step 5: Run verification**

Run: `npm test`
Expected: zero failures.

Run: `npm run build`
Expected: production build exits with code 0.

- [ ] **Step 6: Commit**

```text
docs: add setup and deployment guide
```

### Task 7: Browser interaction and visual quality gate

**Files:**
- Create: `design-qa.md`
- Create: `output/playwright/desktop.png`
- Create: `output/playwright/mobile.png`
- Modify: any source files needed to resolve P0, P1, or P2 findings

**Interfaces:**
- Consumes: running Vite preview and the supplied 1487 by 1058 mockup
- Produces: a passing visual QA report and final browser evidence

- [ ] **Step 1: Start the local preview**

Run: `npm run dev -- --host 127.0.0.1 --port 4173 --strictPort`
Expected: Vite serves the site at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Test the primary desktop interaction path with Playwright CLI**

Open the site, snapshot the accessibility tree, navigate by adjacent click and arrow keys, open and close Full Exhibition detail, play two videos to confirm single playback, and check browser console output.

- [ ] **Step 3: Capture desktop and mobile screenshots**

Capture 1487 by 1058 and 390 by 844 states into `output/playwright/`.

- [ ] **Step 4: Compare against the source mockup**

Write `design-qa.md` with issue priority, evidence, and resolution. Fix all P0, P1, and P2 issues, recapture, and repeat until the final line is `final result: passed`.

- [ ] **Step 5: Run the final verification suite**

Run: `npm test && npm run build`
Expected: all tests and the production build pass after visual fixes.

- [ ] **Step 6: Commit**

```text
test: complete responsive gallery qa
```

### Task 8: Publish the repository

**Files:**
- No source changes expected

**Interfaces:**
- Consumes: verified `main` branch history
- Produces: public GitHub repository with `main` pushed

- [ ] **Step 1: Confirm repository cleanliness and history**

Run: `git status --short && git log --oneline --decorate -10`
Expected: no uncommitted changes and a concise incremental history.

- [ ] **Step 2: Push main**

Run: `git push -u origin main`
Expected: GitHub accepts the branch and workflow.

- [ ] **Step 3: Confirm repository and workflow state**

Run: `gh repo view --web=false` and `gh run list --limit 5`
Expected: repository metadata is visible and the Pages deployment workflow has started or completed.

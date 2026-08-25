# Design QA

## Comparison target

- Source visual truth: `C:\Users\mmush\AppData\Local\Temp\codex-clipboard-73dd6c58-8c9b-48f7-91ab-a74a24012eda.png`
- Source pixels: 1487 by 1058 at device scale 1
- Source desktop region: 1135 by 1058
- Source mobile region: 352 by 1058
- Implementation desktop: `output/playwright/desktop-final-loop.png`
- Implementation mobile: `output/playwright/mobile-final-loop.png`
- Desktop comparison: `output/playwright/desktop-comparison.png`
- Mobile comparison: `output/playwright/mobile-comparison.png`
- Browser: Playwright Chromium, headed
- CSS viewport: 1135 by 1058 desktop, 352 by 1058 mobile
- Device scale factor: 1
- State: Room 01, Dealer's Dilemma selected, Videos room beginning below the fold

The source composite was split into its desktop and mobile regions. The implementation was captured at those exact CSS pixel sizes, so no density scaling was required before comparison.

## Full-view comparison evidence

The combined comparison images place source and implementation in the same raster input. Both versions use the same visual hierarchy: compact identity and room navigation, oversized cobalt room typography, black structural rails, one dominant central artwork, partial adjacent works, compact artwork metadata, then a hard transition to the black Videos room.

The implementation intentionally uses the supplied 23 artworks and 6 process videos rather than the two example posters shown in the mockup. This changes the screening-room thumbnails but preserves the source layout, dark-room contrast, metadata treatment, and media hierarchy.

## Focused comparison evidence

The mobile comparison provides the focused detail pass because it makes typography, artwork scale, edge previews, metadata, control spacing, and the room transition clearly readable. The desktop comparison is large enough to verify the corresponding rail positions, selected mount, navigation density, and screening-room handoff without another crop.

## Required fidelity surfaces

### Fonts and typography

The implementation uses Bahnschrift, Arial Narrow, and Cascadia Mono system stacks. These are close to the source's compact grotesk and monospaced labels without adding a remote font dependency. Weight, uppercase hierarchy, blue metadata, utility sizing, and room-number scale are consistent with the source. The exact source font is unavailable, so minor glyph-shape differences are accepted as P3.

### Spacing and layout rhythm

Desktop and mobile preserve the selected-artwork dominance, partial adjacent works, rail separation, centered gesture instructions, and direct Videos transition. Mobile selected metadata sits between the gallery and controls as in the source. Touch controls remain at least 44 CSS pixels high. No document-level horizontal overflow occurs at 352 or 390 pixels.

### Colors and visual tokens

The implementation matches the pale concrete, black rail, cobalt wayfinding, warm off-white mount, and near-black screening room. It uses no gradients, purple, glass effects, rounded cards, or SaaS surfaces. Contrast remains readable in both rooms.

### Image quality and asset fidelity

All visible artwork and video imagery is real supplied content. Artwork uses responsive WebP sources and intrinsic width and height values. Main, overview, and dialog views use `object-fit: contain` or intrinsic sizing, so artwork is not cropped. The concrete wall is a dedicated low-contrast raster texture rather than CSS art. Boundary previews show real adjacent artworks and preserve their intrinsic ratios while the viewport reveals only their edge.

### Copy and content

The site uses the supplied filenames and curated metadata for titles. Unknown dates are labelled `Undated` rather than inferred from copy timestamps. Navigation and interaction language stays concise and matches the exhibition framing.

## Interactions and accessibility tested

- Adjacent click moved from Dealer's Dilemma to Paris After Dark.
- ArrowRight moved from Paris After Dark to Moon Knight.
- Vertical mouse-wheel input over the rail moved from Moon Knight to After Hours.
- Boundary previews and Previous or Next controls wrap at the first and last artwork.
- Full Exhibition opened Dealer's Dilemma in the native dialog and restored focus to its opening thumbnail on close.
- The mobile menu opened, navigated to Videos, then closed with `aria-expanded="false"`.
- Starting the second process video paused the first.
- Reduced-motion emulation produced a 0.00001 second transition and no artwork transform.
- Mobile document client width and scroll width both measured 375 CSS pixels, confirming no page overflow.
- The fresh final browser session reported zero console errors and zero warnings.

## Comparison history

### Pass 1

- P1: Full Exhibition appeared between the main gallery and Videos, so the room transition did not match the source.
- P1: Mobile omitted selected artwork title, medium, and date.
- P2: Adjacent slides showed mounting surface rather than recognisable artwork edges.
- P2: The initial room height delayed Videos too far below the source composition.
- P2: A missing favicon produced a console error.

### Pass 2 fixes

- Moved Videos directly after Room 01 and placed Full Exhibition later in the document.
- Added mobile selected metadata between the artwork rail and controls.
- Aligned previous and next artwork images toward the visible edge.
- Tightened desktop rail, mount, and artwork height while preserving a dominant selected canvas.
- Added a real artwork favicon and confirmed a clean console.
- Replaced the 2.4 MB concrete PNG with a 70 KB WebP texture.

### Pass 3 fixes and evidence

- Added real boundary preview clones outside the accessible artwork count.
- Added wrap behaviour to Previous, Next, arrow, and boundary-preview selection.
- Reduced the mobile slide gap and mount padding so both adjacent works remain visible.
- Recaptured desktop and mobile at the exact source region sizes.
- Final side-by-side comparison contains no actionable P0, P1, or P2 differences.

## Follow-up polish

- P3: A bundled licensed display font could reproduce the source glyph shapes more exactly, but the current system stack is lighter and preserves the hierarchy.
- P3: The real cyclic previous artwork is lighter than the mockup's dark edge piece because the implementation reflects the actual collection order.

## Implementation checklist

- [x] Source and implementation opened and normalized
- [x] Desktop and mobile captured in the same state
- [x] Required fidelity surfaces checked
- [x] Primary interactions and accessible states tested
- [x] P0, P1, and P2 issues fixed and recaptured
- [x] Browser console checked

final result: passed

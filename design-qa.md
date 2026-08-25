# Design QA

## Comparison target

- Source visual truth: `C:\Users\mmush\AppData\Local\Temp\codex-clipboard-c6c95701-d077-4c57-8081-071bf08d7ace.png`
- User issue capture: `C:\Users\mmush\AppData\Local\Temp\codex-clipboard-71f11cff-2727-4ccc-a81b-02b54739f0a3.png`
- Source pixels: 1487 by 1058 at device scale 1
- Source desktop region: 1135 by 1058
- Source mobile region: 352 by 1058
- Implementation desktop: `output/playwright/desktop-gallery-revision-final.png`
- Implementation mobile: `output/playwright/mobile-gallery-revision-final.png`
- Desktop comparison: `output/playwright/desktop-gallery-revision-comparison.png`
- Mobile comparison: `output/playwright/mobile-gallery-revision-comparison.png`
- Artwork inspector desktop: `output/playwright/artwork-inspector-revision-2.png`
- Artwork inspector mobile: `output/playwright/mobile-inspector-revision-1.png`
- Perspective desktop comparison: `output/playwright/perspective-qa/desktop-comparison.png`
- Perspective mobile comparison: `output/playwright/perspective-qa/mobile-comparison.png`
- Browser: Playwright Chromium, headed
- CSS viewport: 1135 by 1058 desktop, 352 by 1058 mobile
- Device scale factor: 1
- State: Room 01 with Dealer's Dilemma selected, followed by the Videos room

The source composite was split into its desktop and mobile regions. Implementation captures use the same CSS pixel dimensions, so no density scaling was required. Each source crop and implementation capture was placed in one comparison raster before judging fidelity.

## Findings

No actionable P0, P1, or P2 finding remains.

Room numbering now follows the visitor journey: a curated Room 01, the Room 02 screening room, and the complete 23-work archive in Room 03. The artist note remains available as an unnumbered closing surface.

The selected artwork is intentionally larger than the source because the user explicitly requested a stronger inspection scale. This moves more of the Videos room below the first desktop viewport, but preserves the source hierarchy and is accepted as an intentional product change.

## Full-view comparison evidence

The final desktop comparison shows one dominant center canvas on a black structural mount, with recognisable previous and next works receding on separately framed, angled panels. The center work is materially larger than the earlier implementation. Cobalt room lettering, black rails, concrete walls, compact metadata, and the hard black Videos transition remain consistent with the source.

The mobile comparison preserves the large selected work with narrow adjacent artwork views on both sides. The rolling mount has top and bottom rails plus visible supports. Artwork metadata remains centered below the work, and controls remain readable without page-level horizontal overflow.

## Focused comparison evidence

The desktop comparison is the focused structural pass for canvas scale, adjacent-panel visibility, rail alignment, perspective, metadata placement, and room transition. The mobile comparison is the focused responsive pass for edge previews, control spacing, title hierarchy, and section handoff.

The inspector captures provide the focused interaction-state pass. The artwork remains uncropped at 100 percent, uses a dedicated dark inspection surface, and exposes zoom, reset, previous, next, and close controls without covering the work.

## Required fidelity surfaces

### Fonts and typography

Bahnschrift, Arial Narrow, and Cascadia Mono continue to match the compact grotesk and monospaced utility language in the source. Uppercase hierarchy, cobalt metadata, letter spacing, and small room labels remain consistent. Exact glyph differences are accepted as P3 because the source font files were not supplied.

### Spacing and layout rhythm

The selected canvas now measures as the dominant room object, while both neighboring works remain visible as independent structural panels. Desktop and mobile mounts retain natural artwork proportions. The mobile inspector has no horizontal overflow, and all persistent controls remain reachable.

### Colors and visual tokens

The pale concrete, black structure, cobalt wayfinding, off-white canvas mounts, and near-black screening and inspection rooms match the established design. No gradients, purple controls, glass effects, rounded cards, or template surfaces were introduced.

### Image quality and asset fidelity

All artwork and video imagery uses the supplied media. Gallery images continue to use responsive WebP sources. Opening the inspector loads the largest generated source on demand. Moon Knight loaded at 3200 pixels wide during QA, while smaller originals remain capped at their natural width. Images use intrinsic dimensions and contain sizing, with no crop or distortion.

### Copy and content

The new `Open full screen` cue clearly explains the selected artwork action. Inspector instructions state `Scroll to zoom. Drag to inspect.` Ordering instructions in the README identify the exact metadata file and rebuild command. Existing titles, dates, media, and numbering remain data-driven.

### Accessibility and states

The selected artwork is a labelled dialog trigger. The inspector uses a native modal dialog, labelled zoom controls, a keyboard-focusable inspection area, live zoom status, visible focus, Escape close, and focus restoration. Plus, minus, zero, arrow keys, wheel zoom, pointer pan, double-click zoom, and pinch input are supported. Reduced motion removes carousel transforms and long transitions.

## Interactions verified

- One vertical wheel gesture moved from work 1 to work 2.
- Pointer dragging changed rail positions continuously at 1593, 1749, and 1964 pixels before settling on work 3.
- A normal click on the selected artwork opened the inspector.
- Moon Knight loaded a 3200-pixel inspection source.
- Wheel zoom changed the viewer from 100 to 125 percent.
- Pointer panning changed the image translation while retaining the zoom level.
- Zero reset the view to 100 percent.
- Escape closed the dialog and restored focus to `Inspect Moon Knight`.
- Resizing from desktop to mobile retained work 3 as the selected artwork.
- Mobile client and scroll widths both measured 337 CSS pixels.
- The mobile menu opened with `aria-expanded="true"`.
- Reduced-motion emulation produced no selected-artwork transform.
- The clean browser session reported zero console errors and zero warnings.
- The stronger side-panel perspective remained visible at 2434 by 947, 1366 by 900, and 1135 by 1058 desktop viewports.
- The mobile perspective remained readable at 390 by 844 and 352 by 1058 without narrowing the selected artwork.
- Arrow key, vertical wheel, and adjacent-panel click navigation selected Paris After Dark, Moon Knight, and After Hours in sequence.
- Room 01 rendered six curated works, while Room 03 rendered the complete 23-work archive.
- The Room 01 inspector advanced from Paris After Dark to Moon Knight as 03 / 06 without changing a different background selection.
- The final Room 03 archive item opened the inspector as 23 / 23.

## Comparison history

### Earlier accepted build

The earlier QA passed the flat gallery structure, but the user's subsequent real-use review identified three P1 issues: adjacent work did not read as angled rolling canvases, the center image was too small, and wheel or drag input was unreliable.

### Revision pass 1

- Reproduced drag input staying at the same scroll position during movement and jumping after release.
- Traced the problem to smooth behavior being applied to every direct `scrollLeft` write.
- Found wheel behavior depended on raw deltas that were too small to cross a large snap interval on some devices.
- Added unit-aware wheel normalization and intent-based selection.
- Disabled smooth behavior during direct dragging and settled only after release.

### Revision pass 2

- Enlarged the selected canvas and introduced separate angled side mounts with black structural rails and supports.
- Added the dark full-screen artwork inspector with high-resolution sources, zoom, pan, reset, keyboard controls, and focus restoration.
- Found pointer capture retargeted ordinary clicks to the rail and prevented the inspector from opening.
- Delayed pointer capture until actual drag movement began.

### Revision pass 3

- Increased adjacent-panel visibility and contrast after the first side-by-side comparison.
- Found viewport resizing could change the selected artwork while layout values were being recalculated.
- Suspended scroll selection during resize alignment and verified the selected index remains stable.
- Recaptured desktop and mobile, rebuilt both side-by-side comparisons, and ran the clean interaction matrix.

### Revision pass 4

- Increased the side-panel yaw to 36 degrees on desktop and 22 degrees on mobile.
- Moved the perspective camera onto the scrolling rail after visual QA showed the intermediate rail was flattening the original transform.
- Added mirrored depth and inner-edge transform origins so both adjacent panels recede toward the selected canvas.
- Kept the selected canvas square-on and preserved every image's natural aspect ratio inside its presentation plane.
- Repeated exact-size desktop and mobile comparisons and reran keyboard, wheel, adjacent-click, and console checks.

### Revision pass 5

- Added data-driven featured artwork metadata so Room 01 only displays selected works.
- Reframed the navigation as Room 01 Selected Works, Room 02 Videos, and Room 03 Full Exhibition.
- Moved the complete 23-work archive after the screening room and retained the artist note as an unnumbered closing surface.
- Scoped the inspector to six works when opened from Room 01 and to all 23 works when opened from Room 03.
- Found and fixed document-level arrow handling leaking into the open inspector.

## Follow-up polish

- P3: A licensed bundled display face could match the source glyphs more exactly if the original font becomes available.
- P3: The collection's actual cyclic previous work differs from the mockup example, so the neighboring subject matter does not match the concept image exactly.

## Implementation checklist

- [x] Source and implementation opened and normalized
- [x] Desktop and mobile captured in the same state
- [x] Selected canvas enlarged
- [x] Adjacent works mounted, angled, and visible
- [x] Wheel and drag failures reproduced and fixed
- [x] Full-screen zoom and pan inspector verified
- [x] High-resolution inspection sources verified
- [x] Required fidelity surfaces checked
- [x] Browser console checked

final result: passed

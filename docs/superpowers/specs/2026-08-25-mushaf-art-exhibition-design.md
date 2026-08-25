# Mushaf Zarrar Art Exhibition: Design Specification

## Objective

Build a polished, responsive art portfolio for Mushaf Zarrar that feels like a contemporary physical exhibition and can be published as a static GitHub Pages site. The supplied artwork and videos are the real content. The site must make future additions routine through asset discovery plus a small metadata manifest, without coupling content changes to layout code.

## Visual Direction

The mockup is the visual authority. The public rooms use pale, lightly textured concrete walls, black structural rails, cobalt-blue wayfinding, black typography, and generous architectural negative space. The Videos room switches decisively to near-black surfaces with pale text and cobalt controls.

The interface must avoid gradients, purple, glass effects, generic cards, pill-heavy controls, and conventional SaaS dashboard styling. Artwork remains visually dominant and is never cropped into a standard card ratio.

Typography combines a compact grotesk face for identity and navigation with a monospaced face for room numbers, artwork metadata, counts, and directional language. Fonts must be freely distributable or use robust system fallbacks.

## Information Architecture

The site is a single responsive document with four destinations:

1. Exhibition: the primary horizontal artwork rail and selected-work details.
2. Full Exhibition: a complete responsive overview of all artworks with a focus-managed detail view.
3. Videos: a dark screening room containing landscape and portrait videos.
4. About: a concise artist statement and contact/navigation footer.

Desktop uses a slim left-side wayfinding zone and exhibition-scale main stage. Mobile uses a compact top header and full-width rooms. Anchor navigation remains usable without JavaScript.

## Content Architecture

Artwork and video files live under dedicated public asset folders. Vite discovers supported files during the build. A JavaScript metadata manifest provides optional curated values:

- stable ID
- display title
- display date or `Undated`
- medium/category
- ordering
- alt text or accessible description
- video poster override

When a new supported media file is added without a manifest entry, it still appears using a humanised filename, `Undated`, generated ordering, and conservative fallback alternative text. The README explains how to add a curated metadata entry. Unknown dates must never be fabricated from copy timestamps.

The current seed content consists of 23 artworks and 6 MP4 videos from the supplied `Art Gallery` folder. Original media is copied without destructive edits. Responsive derivatives may be generated for oversized artwork, while original natural aspect ratios remain authoritative.

## Exhibition Interaction

The selected work occupies the dominant central canvas. Previous and next works remain partially visible to establish continuity. The rail supports:

- horizontal trackpad or mouse-wheel intent
- touch swipe and drag
- left/right arrow keys
- clicking an adjacent artwork
- explicit previous/next controls exposed to assistive technology

CSS scroll snap provides the native movement foundation. JavaScript synchronises the active item, metadata, count, URL state, and focus without replacing native scrolling.

Selected work gains restrained depth through scale, opacity, contrast, and a modest shadow. Adjacent works recede slightly. The structural rail shifts in the same direction at a slower rate, creating physical parallax without moving the artwork off its scroll position. Metadata enters with a short masked reveal. All state changes use the same transition system regardless of input method.

The rail is finite rather than looping so numbering, position, and keyboard expectations remain predictable. First and last states visibly disable unavailable directional controls.

## Full Exhibition

Full Exhibition opens as an in-page architectural expansion, not a separate application route. A responsive masonry-like layout uses the intrinsic aspect ratios of the originals. Items are semantic buttons or links with visible focus treatment.

Selecting an item opens a lightweight modal detail view with the complete uncropped artwork, metadata, previous/next navigation, Escape-to-close, focus trapping, and focus restoration. Direct anchor links remain meaningful when scripting is unavailable.

## Videos Room

The Videos room is a strong spatial transition into a near-black screening environment. The first landscape video is prominent, with vertical edits arranged as taller secondary works. Each item includes a title, date, runtime, format indication, poster frame, and native accessible controls.

Only one video may play at a time. Videos use `preload="metadata"`, do not autoplay with sound, and pause when their detail context closes or another video begins. Runtime is read from media metadata at runtime; manifest values are optional display overrides.

## Responsive Behaviour

Desktop preserves the mockup's architectural composition, including the fixed wayfinding zone and broad central stage. Medium layouts reduce the sidebar and adjacent-art exposure. Mobile converts navigation to a compact header, gives the selected artwork most of the viewport width, and keeps narrow previews of adjacent works visible at both sides when available.

Touch targets are at least 44 CSS pixels. Text remains readable at 200% zoom. No critical control depends on hover. Orientation changes and viewport resizing retain the currently selected artwork.

## Accessibility

Use semantic landmarks, heading order, lists for media collections, buttons for actions, and native video elements. The active artwork is exposed through `aria-current`; selection announcements use a polite live region without announcing continuously during free scrolling.

Keyboard focus is always visible against light and dark rooms. The gallery never traps arrow keys when focus is inside a native video control. Reduced-motion mode removes parallax, masked reveals, long rail easing, and scale effects while retaining immediate state changes and scroll positioning. Colour contrast targets WCAG AA.

## Technical Architecture

Use semantic HTML, modern CSS, and small ES modules under Vite. No UI framework or runtime dependency is required. Modules are separated by responsibility:

- content discovery and metadata normalisation
- gallery selection/state
- scroll and input coordination
- modal/focus management
- video playback coordination

GitHub Actions builds the Vite output and publishes it to GitHub Pages. The Vite base path is repository-safe. The project includes local run, test, build, content-addition, and deployment instructions.

## Testing and Quality Gates

Utility and state behaviour are developed test-first with Node's built-in test runner where practical. Browser tests use Playwright and cover:

- artwork count and metadata rendering
- arrow-key, adjacent-click, and programmatic selection
- scroll-snap active-item synchronisation
- Full Exhibition open/close and focus restoration
- single-video playback coordination
- reduced-motion behaviour
- desktop and mobile viewport layouts
- absence of horizontal page overflow

Run a production build, automated tests, accessibility-focused checks, and visual comparisons against the supplied desktop/mobile mockup. A `design-qa.md` report is required to pass before handoff. Oversized images should receive responsive derivatives so the initial page avoids downloading full-resolution PNGs unnecessarily.

## Non-Goals

- No CMS, database, authentication, ecommerce, analytics, or backend.
- No autoplaying sound, infinite carousel loop, fake artwork, or invented dates.
- No deployment to a paid hosting service.
- No destructive modification of the supplied source folder.

## Acceptance Criteria

- All 23 supplied artworks appear uncropped at their natural aspect ratios.
- All 6 supplied videos appear with usable native controls and accurate runtime metadata.
- Artwork navigation works by scroll, swipe, arrow key, and adjacent click.
- The main view always retains partial adjacent-work context when viewport space permits.
- Full Exhibition exposes every artwork and supports accessible detail viewing.
- Motion feels smooth and spatial, with an equivalent reduced-motion experience.
- The site is responsive, keyboard-operable, buildable, and deployable to GitHub Pages from documented commands.
- Adding a supported asset does not require editing gallery component code.

# Mushaf Zarrar Art Portfolio

A responsive digital exhibition for the artwork and films of Mushaf Zarrar. The site uses a physical gallery language with concrete walls, structural rails, cobalt wayfinding, and a dark screening room.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install and start the local site:

```powershell
npm install
npm run dev
```

Vite will print the local address. Open it in a modern browser.

## Useful commands

```powershell
npm test
npm run sync-content
npm run build
npm run preview
```

`npm run check` runs the tests and production build together.

## Add artwork

1. Put a JPG, JPEG, PNG, or WebP file in `content/artworks/`.
2. Run `npm run sync-content`.
3. The artwork appears automatically with a title derived from its filename.
4. Add an optional entry to `content/metadata.json` to control its title, date, medium, alternative text, position, and whether it appears in Room 01.

Use a readable filename such as `NightTrainArt.jpg`. The generated fallback title will be `Night Train`. Unknown dates display as `Undated` and are never inferred from copied file timestamps.

Example metadata:

```json
{
  "title": "Night Train",
  "date": "2026",
  "medium": "Digital painting",
  "alt": "A night train crossing a rain-lit city",
  "order": 24,
  "featured": true
}
```

Set `featured` to `true` to include an artwork in the curated Room 01 carousel. New artwork remains in Room 03, the Full Exhibition, until you feature it.

## Add video

1. Put an MP4, MOV, or WebM file in `content/videos/`.
2. Run `npm run sync-content`.
3. Add optional metadata for title, date, order, dimensions, runtime, and a related artwork poster.

Example metadata:

```json
{
  "title": "Night Train: Process",
  "date": "2026",
  "medium": "Process film",
  "artwork": "night-train-art",
  "width": 1080,
  "height": 1920,
  "duration": 28.4,
  "order": 7
}
```

The `artwork` value is the lower-case ID generated from the artwork filename. Runtime is also refreshed from the actual media in the browser.

## Change the display order

Artwork and video order are controlled separately in `content/metadata.json`.

1. Find the file inside the `artworks` or `videos` object.
2. Change its `order` number. Lower numbers appear first.
3. Keep the numbers unique within that section.
4. Run `npm run sync-content` to rebuild the catalogue.

For example, setting `ParisArt.jpg` to `order: 1` makes it the first artwork. Setting `IcarusVid.mp4` to `order: 1` makes it the first video without changing the artwork order.

When the development server is already open, run the sync command in another terminal. The page refreshes with the new order. Commit the metadata and generated catalogue before pushing to GitHub Pages.

## Content build

The sync script preserves source media under `content/`. It creates responsive WebP artwork derivatives at up to 640, 1200, and 2000 pixels wide, then copies browser-ready video files into `public/media/`. The generated catalogue lives at `src/generated/gallery.js`.

Do not edit generated files by hand. Change the source media or metadata and run `npm run sync-content` again.

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` tests and builds every push to `main`, then publishes `dist/` through GitHub Pages.

In the repository settings:

1. Open **Settings**, then **Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run the workflow manually from the **Actions** tab.

The Vite build uses relative paths, so it works from the repository subpath used by GitHub Pages.

## Interaction and accessibility

- Scroll, swipe, drag, click adjacent artwork, or use the left and right arrow keys.
- Click the selected work or any Full Exhibition item to open the inspection viewer.
- Zoom with the mouse wheel, zoom controls, keyboard, or a pinch gesture. Drag to pan while zoomed.
- Use native video controls in the screening room.
- Keyboard focus is visible throughout.
- Reduced-motion preferences remove parallax, scale, masking, and long easing.
- Artwork keeps its natural aspect ratio at every viewport size.

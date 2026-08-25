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
4. Add an optional entry to `content/metadata.json` to control its title, date, medium, alternative text, and position.

Use a readable filename such as `NightTrainArt.jpg`. The generated fallback title will be `Night Train`. Unknown dates display as `Undated` and are never inferred from copied file timestamps.

Example metadata:

```json
{
  "title": "Night Train",
  "date": "2026",
  "medium": "Digital painting",
  "alt": "A night train crossing a rain-lit city",
  "order": 24
}
```

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
- Open any piece from Full Exhibition for a larger uncropped view.
- Use native video controls in the screening room.
- Keyboard focus is visible throughout.
- Reduced-motion preferences remove parallax, scale, masking, and long easing.
- Artwork keeps its natural aspect ratio at every viewport size.

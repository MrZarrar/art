import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { artworkOutputWidths, normaliseEntry } from './content-utils.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content')
const publicMedia = path.join(root, 'public', 'media')
const generatedRoot = path.join(root, 'src', 'generated')

const metadata = JSON.parse(
  await readFile(path.join(contentRoot, 'metadata.json'), 'utf8'),
)

await rm(publicMedia, { recursive: true, force: true })
await mkdir(path.join(publicMedia, 'artworks'), { recursive: true })
await mkdir(path.join(publicMedia, 'videos'), { recursive: true })
await mkdir(generatedRoot, { recursive: true })

async function sourceFiles(folder, extensions) {
  const files = await readdir(path.join(contentRoot, folder), { withFileTypes: true })
  return files
    .filter((file) => file.isFile() && extensions.has(path.extname(file.name).toLowerCase()))
    .map((file) => ({
      name: file.name,
      sourcePath: path.join(contentRoot, folder, file.name),
    }))
}

async function buildArtwork(file) {
  const curated = metadata.artworks[file.name] || {}
  const entry = normaliseEntry(file, curated, 'artwork')
  const image = sharp(file.sourcePath, { failOn: 'none' })
  const info = await image.metadata()
  const outputWidths = artworkOutputWidths(info.width)
  const sources = []

  for (const width of outputWidths) {
    const filename = `${entry.id}-${width}.webp`
    const outputPath = path.join(publicMedia, 'artworks', filename)
    const result = await sharp(file.sourcePath, { failOn: 'none' })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toFile(outputPath)

    sources.push({
      src: `media/artworks/${filename}`,
      width: result.width,
    })
  }

  const primary = sources.find((source) => source.width >= 1200) || sources.at(-1)

  return {
    ...entry,
    width: info.width,
    height: info.height,
    src: primary.src,
    inspectionSrc: sources.at(-1).src,
    sources,
  }
}

async function buildVideo(file, artworkById) {
  const curated = metadata.videos[file.name] || {}
  const entry = normaliseEntry(file, curated, 'video')
  const extension = path.extname(file.name).toLowerCase()
  const filename = `${entry.id}${extension}`
  await copyFile(file.sourcePath, path.join(publicMedia, 'videos', filename))

  return {
    ...entry,
    src: `media/videos/${filename}`,
    width: curated.width || null,
    height: curated.height || null,
    duration: curated.duration || null,
    poster: artworkById.get(curated.artwork)?.src || null,
  }
}

const artworkFiles = await sourceFiles('artworks', new Set(['.jpg', '.jpeg', '.png', '.webp']))
const artworks = (await Promise.all(artworkFiles.map(buildArtwork))).sort(
  (a, b) => a.order - b.order || a.title.localeCompare(b.title),
)
const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]))

const videoFiles = await sourceFiles('videos', new Set(['.mp4', '.mov', '.webm']))
const videos = (await Promise.all(videoFiles.map((file) => buildVideo(file, artworkById)))).sort(
  (a, b) => a.order - b.order || a.title.localeCompare(b.title),
)

const moduleSource = `export const artworks = ${JSON.stringify(artworks, null, 2)}\n\nexport const videos = ${JSON.stringify(videos, null, 2)}\n`
await writeFile(path.join(generatedRoot, 'gallery.js'), moduleSource)

console.log(`Synced ${artworks.length} artworks and ${videos.length} videos.`)

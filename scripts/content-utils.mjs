import path from 'node:path'

const TRAILING_LABELS = {
  artwork: /(?:Art)$/i,
  video: /(?:Vid|Video)$/i,
}

export function stripExtension(filename) {
  return filename.slice(0, filename.length - path.extname(filename).length)
}

export function createId(filename) {
  return stripExtension(filename)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function humaniseFilename(filename, kind) {
  return stripExtension(filename)
    .replace(TRAILING_LABELS[kind], '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normaliseEntry(file, metadata = {}, kind) {
  const title = metadata.title || humaniseFilename(file.name, kind)
  const mediumFallback = kind === 'video' ? 'Process film' : 'Digital artwork'

  return {
    id: createId(file.name),
    kind,
    title,
    date: metadata.date || 'Undated',
    medium: metadata.medium || mediumFallback,
    alt: metadata.alt || `${title} by Mushaf Zarrar`,
    order: Number.isFinite(metadata.order) ? metadata.order : Number.MAX_SAFE_INTEGER,
  }
}

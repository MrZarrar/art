export function featuredArtworks(artworks) {
  return artworks
    .filter((artwork) => artwork.featured)
    .toSorted((first, second) => (
      (first.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (second.featuredOrder ?? Number.MAX_SAFE_INTEGER)
      || (first.order ?? Number.MAX_SAFE_INTEGER) - (second.order ?? Number.MAX_SAFE_INTEGER)
      || first.title.localeCompare(second.title)
    ))
}

export function indexForArtwork(artworks, artworkId) {
  return artworks.findIndex((artwork) => artwork.id === artworkId)
}

function latestYear(value) {
  const years = [...String(value || '').matchAll(/\b(?:19|20)\d{2}\b/g)]
  return years.length ? Number(years.at(-1)[0]) : Number.NEGATIVE_INFINITY
}

export function compareArtworkArchiveOrder(first, second) {
  const dateDifference = latestYear(second.date) - latestYear(first.date)
  if (dateDifference) return dateDifference

  const firstOrder = Number.isFinite(first.order) ? first.order : Number.MAX_SAFE_INTEGER
  const secondOrder = Number.isFinite(second.order) ? second.order : Number.MAX_SAFE_INTEGER
  return firstOrder - secondOrder || first.title.localeCompare(second.title)
}

export function featuredArtworks(artworks) {
  return artworks.filter((artwork) => artwork.featured)
}

export function indexForArtwork(artworks, artworkId) {
  return artworks.findIndex((artwork) => artwork.id === artworkId)
}

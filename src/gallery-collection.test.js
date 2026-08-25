import assert from 'node:assert/strict'
import test from 'node:test'

import { featuredArtworks, indexForArtwork } from './gallery-collection.js'

const artworks = [
  { id: 'cards-art', title: "Dealer's Dilemma", featured: true },
  { id: 'paris-art', title: 'Paris After Dark', featured: true },
  { id: 'goku-progress-art', title: 'Goku: Progress Study', featured: false },
]

test('keeps only featured artwork in the selected room', () => {
  assert.deepEqual(
    featuredArtworks(artworks).map((artwork) => artwork.id),
    ['cards-art', 'paris-art'],
  )
})

test('maps a selected artwork back to its room position', () => {
  assert.equal(indexForArtwork(featuredArtworks(artworks), 'paris-art'), 1)
  assert.equal(indexForArtwork(featuredArtworks(artworks), 'goku-progress-art'), -1)
})

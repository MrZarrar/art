import assert from 'node:assert/strict'
import test from 'node:test'

import {
  compareArtworkArchiveOrder,
  featuredArtworks,
  indexForArtwork,
} from './gallery-collection.js'

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

test('uses featured order without changing archive order', () => {
  const ordered = featuredArtworks([
    { id: 'cards-art', featured: true, featuredOrder: 3 },
    { id: 'moonknight-art', featured: true, featuredOrder: 2 },
    { id: 'spiderverse-art', featured: true, featuredOrder: 1 },
  ])

  assert.deepEqual(ordered.map((artwork) => artwork.id), [
    'spiderverse-art',
    'moonknight-art',
    'cards-art',
  ])
})

test('maps a selected artwork back to its room position', () => {
  assert.equal(indexForArtwork(featuredArtworks(artworks), 'paris-art'), 1)
  assert.equal(indexForArtwork(featuredArtworks(artworks), 'goku-progress-art'), -1)
})

test('sorts archive artwork by newest year with undated work last', () => {
  const newest = { date: '2024', order: 3, title: 'Newest' }
  const older = { date: '2023', order: 1, title: 'Older' }
  const undated = { date: 'Undated', order: 1, title: 'Undated' }

  assert.equal(compareArtworkArchiveOrder(newest, older) < 0, true)
  assert.equal(compareArtworkArchiveOrder(older, undated) < 0, true)
})

test('uses metadata order to break archive date ties', () => {
  const first = { date: '2024', order: 1, title: 'First' }
  const second = { date: '2024', order: 2, title: 'Second' }

  assert.equal(compareArtworkArchiveOrder(first, second) < 0, true)
})

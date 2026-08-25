import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createId,
  humaniseFilename,
  normaliseEntry,
} from './content-utils.mjs'
import * as contentUtils from './content-utils.mjs'

test('humanises artwork filenames', () => {
  assert.equal(humaniseFilename('MoonknightArt.PNG', 'artwork'), 'Moonknight')
  assert.equal(
    humaniseFilename('PerspectiveBuildingsSketch.jpg', 'artwork'),
    'Perspective Buildings Sketch',
  )
})

test('humanises process video filenames', () => {
  assert.equal(humaniseFilename('KeyholeSpeedDraw.mp4', 'video'), 'Keyhole Speed Draw')
  assert.equal(humaniseFilename('BatmanHalfVid.mp4', 'video'), 'Batman Half')
})

test('creates stable lower-case IDs', () => {
  assert.equal(createId('Moonknight Eye Vid.mp4'), 'moonknight-eye-vid')
  assert.equal(createId('RHULArt.PNG'), 'rhul-art')
})

test('normalises entries with safe fallbacks', () => {
  const entry = normaliseEntry(
    { name: 'CardsArt.JPG', relativePath: 'cards-art.jpg' },
    {},
    'artwork',
  )

  assert.deepEqual(entry, {
    id: 'cards-art',
    kind: 'artwork',
    title: 'Cards',
    date: 'Undated',
    medium: 'Digital artwork',
    alt: 'Cards by Mushaf Zarrar',
    order: Number.MAX_SAFE_INTEGER,
    featured: false,
  })
})

test('applies curated metadata without losing entry identity', () => {
  const entry = normaliseEntry(
    { name: 'CardsArt.JPG', relativePath: 'cards-art.jpg' },
    {
      title: "Dealer's Dilemma",
      date: '2024',
      medium: 'Digital painting',
      alt: "Dealer's Dilemma, a surreal card composition",
      order: 1,
    },
    'artwork',
  )

  assert.equal(entry.id, 'cards-art')
  assert.equal(entry.title, "Dealer's Dilemma")
  assert.equal(entry.date, '2024')
  assert.equal(entry.medium, 'Digital painting')
  assert.equal(entry.order, 1)
})

test('keeps an artwork in the selected collection when featured is true', () => {
  const entry = normaliseEntry(
    { name: 'CardsArt.JPG', relativePath: 'cards-art.jpg' },
    { featured: true },
    'artwork',
  )

  assert.equal(entry.featured, true)
})

test('keeps unmarked artwork in the full exhibition only', () => {
  const entry = normaliseEntry(
    { name: 'CardsArt.JPG', relativePath: 'cards-art.jpg' },
    {},
    'artwork',
  )

  assert.equal(entry.featured, false)
})

test('builds responsive widths with a high-resolution inspection source', () => {
  assert.deepEqual(contentUtils.artworkOutputWidths?.(9933), [640, 1200, 2000, 3200])
  assert.deepEqual(contentUtils.artworkOutputWidths?.(1170), [640, 1170])
  assert.deepEqual(contentUtils.artworkOutputWidths?.(500), [500])
})

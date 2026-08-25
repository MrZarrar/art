import assert from 'node:assert/strict'
import test from 'node:test'

import { nearestItemIndex, wheelDelta, wrapGalleryIndex } from './gallery-controller.js'

test('normalises the strongest wheel axis', () => {
  assert.equal(wheelDelta({ deltaX: 0, deltaY: 40 }), 40)
  assert.equal(wheelDelta({ deltaX: -70, deltaY: 20 }), -70)
})

test('chooses the item nearest to the rail centre', () => {
  assert.equal(nearestItemIndex([80, 300, 520], 310), 1)
  assert.equal(nearestItemIndex([80, 300, 520], 500), 2)
})

test('returns the first item for an empty centre list', () => {
  assert.equal(nearestItemIndex([], 500), 0)
})

test('wraps gallery controls at the exhibition boundaries', () => {
  assert.equal(wrapGalleryIndex(-1, 23), 22)
  assert.equal(wrapGalleryIndex(23, 23), 0)
})

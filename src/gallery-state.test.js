import assert from 'node:assert/strict'
import test from 'node:test'

import { createGalleryState } from './gallery-state.js'

test('starts at a valid initial index', () => {
  assert.equal(createGalleryState(3, 1).getIndex(), 1)
  assert.equal(createGalleryState(3, 99).getIndex(), 2)
})

test('selection clamps at both ends', () => {
  const state = createGalleryState(3, 0)
  state.previous()
  assert.equal(state.getIndex(), 0)
  state.select(99)
  assert.equal(state.getIndex(), 2)
  state.next()
  assert.equal(state.getIndex(), 2)
})

test('notifies subscribers only when selection changes', () => {
  const state = createGalleryState(3, 0)
  const selections = []
  const unsubscribe = state.subscribe((index) => selections.push(index))

  state.select(0)
  state.next()
  unsubscribe()
  state.next()

  assert.deepEqual(selections, [1])
})

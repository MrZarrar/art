import assert from 'node:assert/strict'
import test from 'node:test'

import { wrapIndex } from './exhibition-dialog.js'

test('wraps detail navigation around both ends', () => {
  assert.equal(wrapIndex(-1, 23), 22)
  assert.equal(wrapIndex(23, 23), 0)
  assert.equal(wrapIndex(4, 23), 4)
})

test('rejects an empty collection', () => {
  assert.throws(() => wrapIndex(0, 0), RangeError)
})

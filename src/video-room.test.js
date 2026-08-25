import assert from 'node:assert/strict'
import test from 'node:test'

import { formatDuration } from './video-room.js'

test('formats media duration as minutes and seconds', () => {
  assert.equal(formatDuration(65.2), '01:05')
  assert.equal(formatDuration(9.9), '00:09')
})

test('uses a safe fallback for invalid duration', () => {
  assert.equal(formatDuration(Number.NaN), '00:00')
  assert.equal(formatDuration(-2), '00:00')
})

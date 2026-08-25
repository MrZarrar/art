import assert from 'node:assert/strict'
import test from 'node:test'

import * as dialogModel from './exhibition-dialog.js'

const { wrapIndex } = dialogModel

test('wraps detail navigation around both ends', () => {
  assert.equal(wrapIndex(-1, 23), 22)
  assert.equal(wrapIndex(23, 23), 0)
  assert.equal(wrapIndex(4, 23), 4)
})

test('rejects an empty collection', () => {
  assert.throws(() => wrapIndex(0, 0), RangeError)
})

test('clamps inspection zoom to the supported range', () => {
  assert.equal(dialogModel.clampZoom?.(0.5), 1)
  assert.equal(dialogModel.clampZoom?.(3.25), 3.25)
  assert.equal(dialogModel.clampZoom?.(9), 5)
})

test('keeps inspection panning inside the scaled artwork bounds', () => {
  assert.deepEqual(
    dialogModel.constrainPan?.({ x: 900, y: -700 }, {
      viewportWidth: 1000,
      viewportHeight: 700,
      imageWidth: 800,
      imageHeight: 600,
      scale: 2,
    }),
    { x: 300, y: -250 },
  )

  assert.deepEqual(
    dialogModel.constrainPan?.({ x: 80, y: -40 }, {
      viewportWidth: 1000,
      viewportHeight: 700,
      imageWidth: 800,
      imageHeight: 600,
      scale: 1,
    }),
    { x: 0, y: 0 },
  )
})

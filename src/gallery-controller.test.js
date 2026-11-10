import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createGalleryController,
  nearestItemIndex,
  nearestScrollIndex,
  shouldHandleGalleryArrowKey,
  wheelDelta,
  wrapGalleryIndex,
} from './gallery-controller.js'
import { createGalleryState } from './gallery-state.js'

test('keeps carousel dragging active through native drag and intermediate scrollend events', (t) => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const originalAnimationFrame = globalThis.requestAnimationFrame
  const originalCancelFrame = globalThis.cancelAnimationFrame
  let controller
  globalThis.window = {
    matchMedia: () => ({ matches: true }),
    location: { href: 'https://example.com/art/' },
    history: { replaceState() {} },
    addEventListener() {}, removeEventListener() {}, clearTimeout() {}, setTimeout() {},
  }
  globalThis.document = new EventTarget()
  globalThis.requestAnimationFrame = () => 0
  globalThis.cancelAnimationFrame = () => {}
  t.after(() => {
    controller?.destroy()
    globalThis.window = originalWindow
    globalThis.document = originalDocument
    globalThis.requestAnimationFrame = originalAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelFrame
  })
  const rail = new EventTarget()
  Object.assign(rail, { scrollLeft: 0, clientWidth: 300, setPointerCapture() {},
    hasPointerCapture: () => false, scrollTo({ left }) { this.scrollLeft = left } })
  const button = Object.assign(new EventTarget(), { setAttribute() {}, removeAttribute() {} })
  const classes = new Set()
  const classList = { toggle() {}, add: value => classes.add(value), remove: value => classes.delete(value) }
  rail.classList = classList
  const state = createGalleryState(2)
  controller = createGalleryController({
    section: { style: { setProperty() {} } },
    rail,
    items: [0, 1].map(index => ({ offsetLeft: index * 300, offsetWidth: 300, classList, querySelector: () => button })),
    artworks: [0, 1].map(index => ({ id: `test-${index}`, title: 'Test', medium: 'Drawing', date: '2026' })),
    state,
    previousButton: new EventTarget(), nextButton: new EventTarget(),
    liveRegion: {}, roomCount: {},
    metadata: { classList, querySelector: () => ({}) },
  })
  const pointer = (type, clientX) => rail.dispatchEvent(Object.assign(new Event(type), {
    pointerId: 1, pointerType: 'mouse', button: 0, clientX,
  }))
  pointer('pointerdown', 400)
  const nativeDrag = new Event('dragstart', { bubbles: true, cancelable: true })
  rail.dispatchEvent(nativeDrag)
  assert.equal(nativeDrag.defaultPrevented, true)
  pointer('pointermove', 300)
  rail.dispatchEvent(new Event('scrollend'))
  assert.equal(classes.has('is-dragging'), true)
  assert.equal(rail.scrollLeft, 100)
  pointer('pointermove', 100)
  pointer('pointerup', 100)
  assert.equal(state.getIndex(), 1)
  assert.equal(classes.has('is-dragging'), false)
})

test('normalises the strongest wheel axis', () => {
  assert.equal(wheelDelta({ deltaX: 0, deltaY: 40 }), 40)
  assert.equal(wheelDelta({ deltaX: -70, deltaY: 20 }), -70)
})

test('normalises wheel line and page units into pixels', () => {
  assert.equal(wheelDelta({ deltaX: 0, deltaY: 3, deltaMode: 1 }, 800), 48)
  assert.equal(wheelDelta({ deltaX: 0, deltaY: 1, deltaMode: 2 }, 800), 800)
})

test('chooses the item nearest to the rail centre', () => {
  assert.equal(nearestItemIndex([80, 300, 520], 310), 1)
  assert.equal(nearestItemIndex([80, 300, 520], 500), 2)
})

test('chooses the item nearest to the rail centre from layout positions', () => {
  assert.equal(nearestScrollIndex([{ offsetLeft: 40, offsetWidth: 300 }, { offsetLeft: 360, offsetWidth: 300 }], 0, 375), 0)
  assert.equal(nearestScrollIndex([{ offsetLeft: 40, offsetWidth: 300 }, { offsetLeft: 360, offsetWidth: 300 }], 320, 375), 1)
})

test('returns the first item for an empty centre list', () => {
  assert.equal(nearestItemIndex([], 500), 0)
})

test('wraps gallery controls at the exhibition boundaries', () => {
  assert.equal(wrapGalleryIndex(-1, 23), 22)
  assert.equal(wrapGalleryIndex(23, 23), 0)
})

test('keeps gallery arrow navigation out of an open inspection dialog', () => {
  assert.equal(shouldHandleGalleryArrowKey({ key: 'ArrowRight', dialogOpen: true }), false)
  assert.equal(shouldHandleGalleryArrowKey({ key: 'ArrowRight', dialogOpen: false }), true)
})

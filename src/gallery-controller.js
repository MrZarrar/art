export function wheelDelta({ deltaX, deltaY, deltaMode = 0 }, viewportSize = globalThis.window?.innerHeight || 800) {
  const strongestAxis = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
  const unit = deltaMode === 1 ? 16 : deltaMode === 2 ? viewportSize : 1
  return strongestAxis * unit
}

export function nearestItemIndex(itemCentres, railCentre) {
  if (itemCentres.length === 0) return 0

  return itemCentres.reduce((nearest, centre, index) => {
    const distance = Math.abs(centre - railCentre)
    return distance < nearest.distance ? { index, distance } : nearest
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index
}

export function wrapGalleryIndex(index, count) {
  return ((index % count) + count) % count
}

export function createGalleryController({
  section,
  rail,
  items,
  artworks,
  state,
  previousButton,
  nextButton,
  liveRegion,
  metadata,
  roomCount,
  onOpen,
}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let scrollFrame = 0
  let resizeFrame = 0
  let scrollReady = false
  let pointerStart = null
  let dragged = false
  let wheelAccumulator = 0
  let wheelResetTimer = 0
  let wheelUnlockTimer = 0
  let wheelLocked = false

  function targetScrollLeft(index) {
    const item = items[index]
    if (!item) return rail.scrollLeft
    return item.offsetLeft + item.offsetWidth / 2 - rail.clientWidth / 2
  }

  function scrollToIndex(index, behavior = 'smooth') {
    rail.scrollTo({
      left: targetScrollLeft(index),
      behavior: reducedMotion.matches ? 'auto' : behavior,
    })
  }

  function setMetadata(index) {
    const artwork = artworks[index]
    metadata.classList.remove('is-revealed')
    metadata.querySelector('.selected-number span').textContent = String(index + 1).padStart(2, '0')
    metadata.querySelector('h2').textContent = artwork.title
    metadata.querySelector('h2 + p').innerHTML = `${artwork.medium}<br>${artwork.date}`
    roomCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(artworks.length).padStart(2, '0')}`
    requestAnimationFrame(() => metadata.classList.add('is-revealed'))
  }

  function updateSelection(index, announce = true) {
    items.forEach((item, itemIndex) => {
      const selected = itemIndex === index
      item.classList.toggle('is-selected', selected)
      item.classList.toggle('is-before', itemIndex < index)
      item.classList.toggle('is-after', itemIndex > index)
      const button = item.querySelector('.artwork-select')
      if (selected) {
        button.setAttribute('aria-current', 'true')
        button.setAttribute('aria-label', `Inspect ${artworks[itemIndex].title}`)
      } else {
        button.removeAttribute('aria-current')
        button.setAttribute('aria-label', `Select ${artworks[itemIndex].title}`)
      }
    })

    previousButton.disabled = false
    nextButton.disabled = false
    section.style.setProperty('--rail-progress', index / Math.max(1, items.length - 1))
    setMetadata(index)

    if (announce) {
      liveRegion.textContent = `${artworks[index].title}, work ${index + 1} of ${artworks.length}`
    }

    const locationUrl = new URL(window.location.href)
    locationUrl.hash = `artwork=${artworks[index].id}`
    window.history.replaceState(null, '', locationUrl)
  }

  function selectAndScroll(index, behavior = 'smooth') {
    state.select(wrapGalleryIndex(index, items.length))
    scrollToIndex(state.getIndex(), behavior)
  }

  function nearestIndexFromRail() {
    const railRect = rail.getBoundingClientRect()
    const centres = items.map((item) => {
      const rect = item.getBoundingClientRect()
      return rect.left + rect.width / 2
    })
    return nearestItemIndex(centres, railRect.left + railRect.width / 2)
  }

  function settleToNearest() {
    const index = nearestIndexFromRail()
    rail.classList.remove('is-dragging')
    state.select(index)
    scrollToIndex(index)
  }

  function selectionFromScroll() {
    if (!scrollReady || pointerStart) return
    cancelAnimationFrame(scrollFrame)
    scrollFrame = requestAnimationFrame(() => {
      state.select(nearestIndexFromRail())
    })
  }

  items.forEach((item, index) => {
    const button = item.querySelector('.artwork-select')
    button.addEventListener('click', () => {
      if (dragged) return
      if (index === state.getIndex()) onOpen?.(index, button)
      else selectAndScroll(index)
    })
  })

  previousButton.addEventListener('click', () => selectAndScroll(state.getIndex() - 1))
  nextButton.addEventListener('click', () => selectAndScroll(state.getIndex() + 1))
  rail.addEventListener('scroll', selectionFromScroll, { passive: true })

  rail.addEventListener('wheel', (event) => {
    const delta = wheelDelta(event, rail.clientWidth)
    if (Math.abs(delta) < 1) return
    event.preventDefault()

    wheelAccumulator += delta
    window.clearTimeout(wheelResetTimer)
    wheelResetTimer = window.setTimeout(() => { wheelAccumulator = 0 }, 140)
    if (wheelLocked || Math.abs(wheelAccumulator) < 24) return

    wheelLocked = true
    const direction = wheelAccumulator > 0 ? 1 : -1
    wheelAccumulator = 0
    selectAndScroll(state.getIndex() + direction)
    window.clearTimeout(wheelUnlockTimer)
    wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false }, 260)
  }, { passive: false })

  rail.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    pointerStart = { x: event.clientX, scrollLeft: rail.scrollLeft }
    dragged = false
  })

  rail.addEventListener('pointermove', (event) => {
    if (!pointerStart) return
    const distance = event.clientX - pointerStart.x
    if (!dragged && Math.abs(distance) <= 6) return
    if (!dragged) {
      dragged = true
      rail.setPointerCapture(event.pointerId)
      rail.classList.add('is-dragging')
    }
    rail.scrollLeft = pointerStart.scrollLeft - distance
  })

  const endPointerDrag = (event) => {
    if (!pointerStart) return
    const shouldSettle = dragged
    pointerStart = null
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
    if (shouldSettle) settleToNearest()
    window.setTimeout(() => { dragged = false }, 0)
  }

  rail.addEventListener('pointerup', endPointerDrag)
  rail.addEventListener('pointercancel', endPointerDrag)

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    if (event.target.closest('video, input, textarea, select')) return

    const rect = section.getBoundingClientRect()
    const galleryVisible = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3
    if (!galleryVisible) return

    event.preventDefault()
    selectAndScroll(state.getIndex() + (event.key === 'ArrowRight' ? 1 : -1))
  })

  const alignAfterResize = () => {
    scrollReady = false
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      scrollToIndex(state.getIndex(), 'auto')
      requestAnimationFrame(() => { scrollReady = true })
    })
  }

  window.addEventListener('resize', alignAfterResize)

  const unsubscribe = state.subscribe((index) => updateSelection(index))
  updateSelection(state.getIndex(), false)
  requestAnimationFrame(() => {
    scrollToIndex(state.getIndex(), 'auto')
    requestAnimationFrame(() => { scrollReady = true })
  })

  return {
    select: selectAndScroll,
    destroy() {
      unsubscribe()
      cancelAnimationFrame(scrollFrame)
      cancelAnimationFrame(resizeFrame)
      window.clearTimeout(wheelResetTimer)
      window.clearTimeout(wheelUnlockTimer)
      window.removeEventListener('resize', alignAfterResize)
    },
  }
}

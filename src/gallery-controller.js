export function wheelDelta({ deltaX, deltaY }) {
  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
}

export function nearestItemIndex(itemCentres, railCentre) {
  if (itemCentres.length === 0) return 0

  return itemCentres.reduce((nearest, centre, index) => {
    const distance = Math.abs(centre - railCentre)
    return distance < nearest.distance ? { index, distance } : nearest
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index
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
}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let scrollFrame = 0
  let pointerStart = null
  let dragged = false

  function scrollToIndex(index) {
    items[index]?.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
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
      const button = item.querySelector('.artwork-select')
      if (selected) button.setAttribute('aria-current', 'true')
      else button.removeAttribute('aria-current')
    })

    previousButton.disabled = index === 0
    nextButton.disabled = index === items.length - 1
    section.style.setProperty('--rail-progress', index / Math.max(1, items.length - 1))
    setMetadata(index)

    if (announce) {
      liveRegion.textContent = `${artworks[index].title}, work ${index + 1} of ${artworks.length}`
    }

    const locationUrl = new URL(window.location.href)
    locationUrl.hash = `artwork=${artworks[index].id}`
    window.history.replaceState(null, '', locationUrl)
  }

  function selectAndScroll(index) {
    state.select(index)
    scrollToIndex(state.getIndex())
  }

  function selectionFromScroll() {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = requestAnimationFrame(() => {
      const railRect = rail.getBoundingClientRect()
      const centres = items.map((item) => {
        const rect = item.getBoundingClientRect()
        return rect.left + rect.width / 2
      })
      state.select(nearestItemIndex(centres, railRect.left + railRect.width / 2))
    })
  }

  items.forEach((item, index) => {
    item.querySelector('.artwork-select').addEventListener('click', () => {
      if (!dragged) selectAndScroll(index)
    })
  })

  previousButton.addEventListener('click', () => selectAndScroll(state.getIndex() - 1))
  nextButton.addEventListener('click', () => selectAndScroll(state.getIndex() + 1))
  rail.addEventListener('scroll', selectionFromScroll, { passive: true })

  rail.addEventListener('wheel', (event) => {
    const delta = wheelDelta(event)
    if (Math.abs(delta) < 1) return
    event.preventDefault()
    rail.scrollLeft += delta
  }, { passive: false })

  rail.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    pointerStart = { x: event.clientX, scrollLeft: rail.scrollLeft }
    dragged = false
    rail.setPointerCapture(event.pointerId)
    rail.classList.add('is-dragging')
  })

  rail.addEventListener('pointermove', (event) => {
    if (!pointerStart) return
    const distance = event.clientX - pointerStart.x
    if (Math.abs(distance) > 6) dragged = true
    rail.scrollLeft = pointerStart.scrollLeft - distance
  })

  const endPointerDrag = (event) => {
    if (!pointerStart) return
    pointerStart = null
    rail.classList.remove('is-dragging')
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
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

  const unsubscribe = state.subscribe((index) => updateSelection(index))
  updateSelection(state.getIndex(), false)
  requestAnimationFrame(() => scrollToIndex(state.getIndex()))

  return {
    select: selectAndScroll,
    destroy() {
      unsubscribe()
      cancelAnimationFrame(scrollFrame)
    },
  }
}

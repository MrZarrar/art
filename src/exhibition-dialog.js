export function wrapIndex(index, count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('Detail navigation requires at least one artwork')
  }

  return ((index % count) + count) % count
}

export function clampZoom(scale) {
  return Math.max(1, Math.min(5, Number(scale) || 1))
}

export function constrainPan(pan, bounds) {
  const scale = clampZoom(bounds.scale)
  const overflowX = Math.max(0, bounds.imageWidth * scale - bounds.viewportWidth) / 2
  const overflowY = Math.max(0, bounds.imageHeight * scale - bounds.viewportHeight) / 2

  return {
    x: overflowX ? Math.max(-overflowX, Math.min(overflowX, pan.x)) : 0,
    y: overflowY ? Math.max(-overflowY, Math.min(overflowY, pan.y)) : 0,
  }
}

function artworkImage(artwork) {
  const image = document.createElement('img')
  image.src = artwork.inspectionSrc || artwork.sources.at(-1)?.src || artwork.src
  image.width = artwork.width
  image.height = artwork.height
  image.alt = artwork.alt
  image.decoding = 'async'
  image.draggable = false
  return image
}

export function createExhibitionDialog({ dialog, artworks, onSelect }) {
  const viewport = dialog.querySelector('.dialog-viewport')
  const imageContainer = dialog.querySelector('.dialog-image')
  const number = dialog.querySelector('.dialog-number')
  const title = dialog.querySelector('#dialog-title')
  const details = dialog.querySelector('.dialog-details')
  const closeButton = dialog.querySelector('.dialog-close')
  const previousButton = dialog.querySelector('.dialog-previous')
  const nextButton = dialog.querySelector('.dialog-next')
  const zoomInButton = dialog.querySelector('.dialog-zoom-in')
  const zoomOutButton = dialog.querySelector('.dialog-zoom-out')
  const resetButton = dialog.querySelector('.dialog-reset')
  const zoomStatus = dialog.querySelector('.dialog-zoom-status')
  let activeIndex = 0
  let opener = null
  let scale = 1
  let pan = { x: 0, y: 0 }
  let image = null
  let gesture = null
  const pointers = new Map()

  function viewBounds(nextScale = scale) {
    return {
      viewportWidth: viewport.clientWidth,
      viewportHeight: viewport.clientHeight,
      imageWidth: image?.clientWidth || 0,
      imageHeight: image?.clientHeight || 0,
      scale: nextScale,
    }
  }

  function applyView() {
    pan = constrainPan(pan, viewBounds())
    image?.style.setProperty('transform', `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`)
    viewport.classList.toggle('is-zoomed', scale > 1)
    zoomStatus.textContent = `${Math.round(scale * 100)}%`
    zoomInButton.disabled = scale >= 5
    zoomOutButton.disabled = scale <= 1
    resetButton.disabled = scale <= 1 && pan.x === 0 && pan.y === 0
  }

  function resetView() {
    scale = 1
    pan = { x: 0, y: 0 }
    applyView()
  }

  function setZoom(nextScale, clientPoint) {
    const previousScale = scale
    const next = clampZoom(nextScale)
    if (next === previousScale) return

    if (clientPoint) {
      const rect = viewport.getBoundingClientRect()
      const point = {
        x: clientPoint.x - rect.left - rect.width / 2,
        y: clientPoint.y - rect.top - rect.height / 2,
      }
      const ratio = next / previousScale
      pan = {
        x: point.x - (point.x - pan.x) * ratio,
        y: point.y - (point.y - pan.y) * ratio,
      }
    }

    scale = next
    if (scale === 1) pan = { x: 0, y: 0 }
    applyView()
  }

  function pointDistance(first, second) {
    return Math.hypot(second.x - first.x, second.y - first.y)
  }

  function pointCentre(first, second) {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
  }

  function beginGesture() {
    const active = [...pointers.values()]
    if (active.length >= 2) {
      gesture = {
        type: 'pinch',
        distance: pointDistance(active[0], active[1]),
        centre: pointCentre(active[0], active[1]),
        scale,
        pan: { ...pan },
      }
    } else if (active.length === 1) {
      gesture = { type: 'pan', point: active[0], pan: { ...pan } }
    } else {
      gesture = null
    }
  }

  function render(index) {
    activeIndex = wrapIndex(index, artworks.length)
    const artwork = artworks[activeIndex]
    image = artworkImage(artwork)
    image.addEventListener('load', resetView, { once: true })
    imageContainer.replaceChildren(image)
    number.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(artworks.length).padStart(2, '0')}`
    title.textContent = artwork.title
    details.textContent = `${artwork.medium}, ${artwork.date}`
    viewport.setAttribute('aria-label', `Inspect ${artwork.title}`)
    resetView()
    onSelect?.(activeIndex)
  }

  function open(index, trigger = document.activeElement) {
    opener = trigger instanceof HTMLElement ? trigger : null
    render(index)
    if (!dialog.open) dialog.showModal()
    closeButton.focus()
  }

  closeButton.addEventListener('click', () => dialog.close())
  previousButton.addEventListener('click', () => render(activeIndex - 1))
  nextButton.addEventListener('click', () => render(activeIndex + 1))
  zoomInButton.addEventListener('click', () => setZoom(scale + 0.5))
  zoomOutButton.addEventListener('click', () => setZoom(scale - 0.5))
  resetButton.addEventListener('click', resetView)

  viewport.addEventListener('wheel', (event) => {
    event.preventDefault()
    const step = event.deltaY < 0 ? 0.25 : -0.25
    setZoom(scale + step, { x: event.clientX, y: event.clientY })
  }, { passive: false })

  viewport.addEventListener('dblclick', (event) => {
    setZoom(scale > 1 ? 1 : 2.5, { x: event.clientX, y: event.clientY })
  })

  viewport.addEventListener('pointerdown', (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    viewport.setPointerCapture(event.pointerId)
    viewport.classList.add('is-panning')
    beginGesture()
  })

  viewport.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId) || !gesture) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const active = [...pointers.values()]

    if (gesture.type === 'pinch' && active.length >= 2) {
      const distance = pointDistance(active[0], active[1])
      const centre = pointCentre(active[0], active[1])
      const nextScale = clampZoom(gesture.scale * distance / Math.max(1, gesture.distance))
      const rect = viewport.getBoundingClientRect()
      const startPoint = {
        x: gesture.centre.x - rect.left - rect.width / 2,
        y: gesture.centre.y - rect.top - rect.height / 2,
      }
      const currentPoint = {
        x: centre.x - rect.left - rect.width / 2,
        y: centre.y - rect.top - rect.height / 2,
      }
      const ratio = nextScale / gesture.scale
      scale = nextScale
      pan = {
        x: currentPoint.x - (startPoint.x - gesture.pan.x) * ratio,
        y: currentPoint.y - (startPoint.y - gesture.pan.y) * ratio,
      }
      applyView()
      return
    }

    if (gesture.type === 'pan' && active.length === 1 && scale > 1) {
      pan = {
        x: gesture.pan.x + active[0].x - gesture.point.x,
        y: gesture.pan.y + active[0].y - gesture.point.y,
      }
      applyView()
    }
  })

  const endPointer = (event) => {
    pointers.delete(event.pointerId)
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
    viewport.classList.toggle('is-panning', pointers.size > 0)
    beginGesture()
  }

  viewport.addEventListener('pointerup', endPointer)
  viewport.addEventListener('pointercancel', endPointer)

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })

  dialog.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      setZoom(scale + 0.5)
      return
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      setZoom(scale - 0.5)
      return
    }

    if (event.key === '0') {
      event.preventDefault()
      resetView()
      return
    }

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()

    if (scale > 1) {
      const panStep = 56
      pan = {
        x: pan.x + (event.key === 'ArrowRight' ? -panStep : event.key === 'ArrowLeft' ? panStep : 0),
        y: pan.y + (event.key === 'ArrowDown' ? -panStep : event.key === 'ArrowUp' ? panStep : 0),
      }
      applyView()
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      render(activeIndex + (event.key === 'ArrowRight' ? 1 : -1))
    }
  })

  dialog.addEventListener('close', () => {
    pointers.clear()
    gesture = null
    resetView()
    opener?.focus()
    opener = null
  })

  window.addEventListener('resize', applyView)

  return { open, render, resetView }
}

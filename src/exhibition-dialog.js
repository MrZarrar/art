export function wrapIndex(index, count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('Detail navigation requires at least one artwork')
  }

  return ((index % count) + count) % count
}

function artworkImage(artwork) {
  const image = document.createElement('img')
  image.src = artwork.src
  image.srcset = artwork.sources
    .map((source) => `${source.src} ${source.width}w`)
    .join(', ')
  image.sizes = '(max-width: 700px) 90vw, 70vw'
  image.width = artwork.width
  image.height = artwork.height
  image.alt = artwork.alt
  image.decoding = 'async'
  return image
}

export function createExhibitionDialog({ dialog, artworks, onSelect }) {
  const imageContainer = dialog.querySelector('.dialog-image')
  const number = dialog.querySelector('.dialog-number')
  const title = dialog.querySelector('#dialog-title')
  const details = dialog.querySelector('.dialog-details')
  const closeButton = dialog.querySelector('.dialog-close')
  const previousButton = dialog.querySelector('.dialog-previous')
  const nextButton = dialog.querySelector('.dialog-next')
  let activeIndex = 0
  let opener = null

  function render(index) {
    activeIndex = wrapIndex(index, artworks.length)
    const artwork = artworks[activeIndex]
    imageContainer.replaceChildren(artworkImage(artwork))
    number.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(artworks.length).padStart(2, '0')}`
    title.textContent = artwork.title
    details.textContent = `${artwork.medium}, ${artwork.date}`
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

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })

  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    render(activeIndex + (event.key === 'ArrowRight' ? 1 : -1))
  })

  dialog.addEventListener('close', () => {
    opener?.focus()
    opener = null
  })

  return { open, render }
}

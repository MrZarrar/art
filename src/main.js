import './styles.css'

import { artworks, videos } from './generated/gallery.js'
import { createExhibitionDialog } from './exhibition-dialog.js'
import { compareArtworkArchiveOrder, featuredArtworks, indexForArtwork } from './gallery-collection.js'
import { createGalleryController } from './gallery-controller.js'
import { createGalleryState } from './gallery-state.js'
import { createVideoRoom } from './video-room.js'

const selectedWorks = featuredArtworks(artworks)
const archiveWorks = [...artworks].sort(compareArtworkArchiveOrder)

const padNumber = (value) => String(value).padStart(2, '0')
const srcset = (artwork) => artwork.sources
  .map((source) => `${source.src} ${source.width}w`)
  .join(', ')

function artworkPicture(artwork, options = {}) {
  const loading = options.eager ? 'eager' : 'lazy'
  const priority = options.eager ? 'high' : 'auto'
  const sizes = options.sizes || '(max-width: 700px) 82vw, 55vw'

  return `
    <img
      src="${artwork.src}"
      srcset="${srcset(artwork)}"
      sizes="${sizes}"
      width="${artwork.width}"
      height="${artwork.height}"
      alt="${artwork.alt}"
      loading="${loading}"
      fetchpriority="${priority}"
      decoding="async"
    />
  `
}

function renderArtworkSlide(artwork, index) {
  return `
    <li class="artwork-slide${index === 0 ? ' is-selected' : ''}" data-artwork-index="${index}">
      <button
        class="artwork-select"
        type="button"
        aria-label="Select ${artwork.title}"
        aria-haspopup="dialog"
        ${index === 0 ? 'aria-current="true"' : ''}
      >
        <span class="artwork-mount">
          ${artworkPicture(artwork, { eager: index < 2 })}
          <span class="inspect-hint">Open full screen</span>
        </span>
      </button>
    </li>
  `
}

function renderArtworkClone(artwork, direction) {
  return `
    <li class="artwork-slide artwork-slide--clone is-${direction === 'previous' ? 'before' : 'after'}" aria-hidden="true">
      <button
        class="artwork-select"
        type="button"
        tabindex="-1"
        data-boundary-preview="${direction}"
      >
        <span class="artwork-mount">
          ${artworkPicture(artwork, { eager: true })}
        </span>
      </button>
    </li>
  `
}

function renderExhibitionItem(artwork, index) {
  return `
    <li class="exhibition-item">
      <button class="exhibition-open" type="button" data-exhibition-index="${index}">
        <span class="exhibition-image">${artworkPicture(artwork, {
          sizes: '(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 30vw',
        })}</span>
        <span class="exhibition-caption">
          <span class="exhibition-number">${padNumber(index + 1)}</span>
          <span>
            <strong>${artwork.title}</strong>
            <small>${artwork.medium}, ${artwork.date}</small>
          </span>
        </span>
      </button>
    </li>
  `
}

function renderVideo(video, index) {
  const ratio = video.width && video.height ? video.width / video.height : 16 / 9
  const orientation = ratio < 1 ? 'portrait' : 'landscape'
  const duration = video.duration
    ? `${String(Math.floor(video.duration / 60)).padStart(2, '0')}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}`
    : '00:00'

  return `
    <article class="video-work video-work--${orientation}" data-video-index="${index}">
      <div class="video-frame">
        <video
          controls
          playsinline
          preload="metadata"
          poster="${video.poster || ''}"
          aria-label="${video.title}"
        >
          <source src="${video.src}" type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      </div>
      <div class="video-caption">
        <h3>${video.title}</h3>
        <p>${video.date} <span aria-hidden="true">/</span> <span data-duration>${duration}</span></p>
      </div>
    </article>
  `
}

function renderApp() {
  const selected = selectedWorks[0]

  document.querySelector('#app').innerHTML = `
    <header class="site-header">
      <a class="identity" href="#exhibition" aria-label="Mushaf Zarrar, exhibition home">
        <strong>Mushaf Zarrar</strong>
        <span aria-hidden="true">/</span>
        <span>Drawings + Films</span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="room-navigation">Menu</button>
    </header>

    <nav class="room-navigation" id="room-navigation" aria-label="Exhibition rooms">
      <a class="is-current" href="#exhibition">Featured Works <span>01</span></a>
      <a href="#videos">Videos <span>02</span></a>
      <a href="#full-exhibition">Full exhibition <span>03</span></a>
    </nav>

    <main>
      <section class="exhibition-room" id="exhibition" aria-labelledby="exhibition-heading">
        <div class="room-heading">
          <p>Room 01</p>
          <h1 id="exhibition-heading">Featured Works</h1>
          <span>${padNumber(1)} / ${padNumber(selectedWorks.length)}</span>
        </div>

        <div class="room-sign" aria-hidden="true">Room 01</div>
        <div class="upper-rail" aria-hidden="true"></div>

        <div class="gallery-stage">
          <ol class="artwork-rail" aria-label="Artwork carousel">
            ${renderArtworkClone(selectedWorks.at(-1), 'previous')}
            ${selectedWorks.map(renderArtworkSlide).join('')}
            ${renderArtworkClone(selectedWorks[0], 'next')}
          </ol>

          <aside class="selected-metadata" aria-live="off">
            <p class="selected-number"><span>01</span> / ${padNumber(selectedWorks.length)}</p>
            <h2>${selected.title}</h2>
            <p>${selected.medium}<br />${selected.date}</p>
          </aside>
        </div>

        <div class="gallery-controls">
          <button type="button" data-gallery-previous>Previous</button>
          <p><span class="desktop-instruction">Scroll / drag / arrow keys</span><span class="mobile-instruction">Swipe / drag</span></p>
          <button type="button" data-gallery-next>Next</button>
        </div>

        <p class="selection-announcement visually-hidden" aria-live="polite"></p>
      </section>

      <section class="videos-room" id="videos" aria-labelledby="videos-heading">
        <header class="section-heading section-heading--dark">
          <div>
            <p>Room 02 / Screening room</p>
            <h2 id="videos-heading">Videos</h2>
          </div>
          <p>${videos.length} films</p>
        </header>
        <div class="video-grid">
          ${videos.map(renderVideo).join('')}
        </div>
      </section>

      <section class="full-exhibition" id="full-exhibition" aria-labelledby="full-exhibition-heading">
        <header class="section-heading section-heading--light">
          <div>
            <p>Room 03 / Complete hanging</p>
            <h2 id="full-exhibition-heading">Full Exhibition</h2>
          </div>
          <p>${archiveWorks.length} works</p>
        </header>
        <ol class="exhibition-grid">
          ${archiveWorks.map(renderExhibitionItem).join('')}
        </ol>
      </section>

      <footer class="about-room" aria-labelledby="about-heading">
        <p class="about-number">Artist note</p>
        <div>
          <h2 id="about-heading">Mushaf Zarrar</h2>
          <p>
            A growing archive of digital paintings, illustration studies, sketches,
            process films, and visual experiments.
          </p>
        </div>
        <a href="#exhibition">Return to Room 01</a>
      </footer>
    </main>

    <dialog class="artwork-dialog" aria-labelledby="dialog-title">
      <div class="dialog-toolbar">
        <button class="dialog-close" type="button">Close</button>
        <div class="dialog-zoom-controls" aria-label="Artwork zoom controls">
          <button class="dialog-zoom-out" type="button">Zoom out</button>
          <output class="dialog-zoom-status" aria-live="polite">100%</output>
          <button class="dialog-zoom-in" type="button">Zoom in</button>
          <button class="dialog-reset" type="button">Reset view</button>
        </div>
      </div>
      <button class="dialog-previous" type="button">Previous work</button>
      <figure>
        <div
          class="dialog-viewport"
          tabindex="0"
          aria-label="Artwork inspection area"
          aria-describedby="dialog-zoom-help"
        >
          <div class="dialog-image"></div>
        </div>
        <figcaption>
          <p class="dialog-number"></p>
          <h2 id="dialog-title"></h2>
          <p class="dialog-details"></p>
          <p class="dialog-view-note">Scroll to zoom. Drag to inspect.</p>
        </figcaption>
      </figure>
      <button class="dialog-next" type="button">Next work</button>
      <p class="visually-hidden" id="dialog-zoom-help">
        Use the mouse wheel or zoom buttons to enlarge the artwork. Drag or use arrow keys to pan when zoomed. Press zero to reset and Escape to close.
      </p>
    </dialog>
  `
}

renderApp()

const hashArtworkId = new URLSearchParams(window.location.hash.slice(1)).get('artwork')
const hashArtworkIndex = indexForArtwork(selectedWorks, hashArtworkId)
const state = createGalleryState(selectedWorks.length, Math.max(0, hashArtworkIndex))
const section = document.querySelector('.exhibition-room')
let galleryController
const exhibitionDialog = createExhibitionDialog({
  dialog: document.querySelector('.artwork-dialog'),
  artworks: archiveWorks,
  onSelect: (artwork, collection) => {
    if (collection !== selectedWorks) return
    const index = indexForArtwork(selectedWorks, artwork.id)
    if (index >= 0) galleryController?.select(index)
  },
})

galleryController = createGalleryController({
  section,
  rail: document.querySelector('.artwork-rail'),
  items: [...document.querySelectorAll('.artwork-slide:not(.artwork-slide--clone)')],
  artworks: selectedWorks,
  state,
  previousButton: document.querySelector('[data-gallery-previous]'),
  nextButton: document.querySelector('[data-gallery-next]'),
  liveRegion: document.querySelector('.selection-announcement'),
  metadata: document.querySelector('.selected-metadata'),
  roomCount: document.querySelector('.room-heading > span'),
  onOpen: (index, trigger) => exhibitionDialog.open(index, trigger, selectedWorks),
})

document.querySelector('[data-boundary-preview="previous"]').addEventListener('click', () => {
  galleryController.select(selectedWorks.length - 1)
})

document.querySelector('[data-boundary-preview="next"]').addEventListener('click', () => {
  galleryController.select(0)
})

const videoRoom = createVideoRoom([...document.querySelectorAll('.video-work video')])

document.querySelectorAll('.exhibition-open').forEach((button) => {
  button.addEventListener('click', () => {
    exhibitionDialog.open(Number(button.dataset.exhibitionIndex), button, archiveWorks)
  })
})

const menuButton = document.querySelector('.menu-toggle')
const roomNavigation = document.querySelector('.room-navigation')

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true'
  menuButton.setAttribute('aria-expanded', String(open))
  menuButton.textContent = open ? 'Close' : 'Menu'
  roomNavigation.classList.toggle('is-open', open)
})

roomNavigation.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.textContent = 'Menu'
  roomNavigation.classList.remove('is-open')
})

const roomLinks = [...roomNavigation.querySelectorAll('a[href^="#"]')]
const roomSections = roomLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean)

const roomObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
  if (!visible) return

  roomLinks.forEach((link) => {
    link.classList.toggle('is-current', link.hash === `#${visible.target.id}`)
  })
}, { rootMargin: '-25% 0px -55%', threshold: [0, 0.15, 0.5] })

roomSections.forEach((room) => roomObserver.observe(room))

window.exhibition = { artworks, videos, state, galleryController, exhibitionDialog, videoRoom }

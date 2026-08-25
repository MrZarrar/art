import './styles.css'

import { artworks, videos } from './generated/gallery.js'
import { createExhibitionDialog } from './exhibition-dialog.js'
import { createGalleryController } from './gallery-controller.js'
import { createGalleryState } from './gallery-state.js'
import { createVideoRoom } from './video-room.js'

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
        ${index === 0 ? 'aria-current="true"' : ''}
      >
        <span class="artwork-mount">
          ${artworkPicture(artwork, { eager: index < 2 })}
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
  const selected = artworks[0]

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
      <a class="is-current" href="#exhibition">Exhibition <span>01</span></a>
      <a href="#videos">Videos <span>02</span></a>
      <a href="#about">About <span>03</span></a>
      <a class="full-exhibition-link" href="#full-exhibition">
        <span class="full-exhibition-mark" aria-hidden="true">23</span>
        <span>Full Exhibition<br />23 works</span>
      </a>
    </nav>

    <main>
      <section class="exhibition-room" id="exhibition" aria-labelledby="exhibition-heading">
        <div class="room-heading">
          <p>Room 01</p>
          <h1 id="exhibition-heading">Exhibition</h1>
          <span>${padNumber(1)} / ${padNumber(artworks.length)}</span>
        </div>

        <div class="room-sign" aria-hidden="true">Room 01</div>
        <div class="upper-rail" aria-hidden="true"></div>

        <div class="gallery-stage">
          <ol class="artwork-rail" aria-label="Artwork carousel">
            ${artworks.map(renderArtworkSlide).join('')}
          </ol>

          <aside class="selected-metadata" aria-live="off">
            <p class="selected-number"><span>01</span> / ${padNumber(artworks.length)}</p>
            <h2>${selected.title}</h2>
            <p>${selected.medium}<br />${selected.date}</p>
          </aside>
        </div>

        <div class="gallery-controls">
          <button type="button" data-gallery-previous disabled>Previous</button>
          <p><span class="desktop-instruction">Scroll / drag / arrow keys</span><span class="mobile-instruction">Swipe / drag</span></p>
          <button type="button" data-gallery-next>Next</button>
        </div>

        <p class="selection-announcement visually-hidden" aria-live="polite"></p>
      </section>

      <section class="full-exhibition" id="full-exhibition" aria-labelledby="full-exhibition-heading">
        <header class="section-heading section-heading--light">
          <div>
            <p>Room 01 / Complete hanging</p>
            <h2 id="full-exhibition-heading">Full Exhibition</h2>
          </div>
          <p>${artworks.length} works</p>
        </header>
        <ol class="exhibition-grid">
          ${artworks.map(renderExhibitionItem).join('')}
        </ol>
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

      <section class="about-room" id="about" aria-labelledby="about-heading">
        <p class="about-number">Room 03</p>
        <div>
          <h2 id="about-heading">Mushaf Zarrar</h2>
          <p>
            A growing archive of digital paintings, illustration studies, sketches,
            process films, and visual experiments.
          </p>
        </div>
        <a href="#exhibition">Return to Room 01</a>
      </section>
    </main>

    <dialog class="artwork-dialog" aria-labelledby="dialog-title">
      <button class="dialog-close" type="button">Close</button>
      <button class="dialog-previous" type="button">Previous work</button>
      <figure>
        <div class="dialog-image"></div>
        <figcaption>
          <p class="dialog-number"></p>
          <h2 id="dialog-title"></h2>
          <p class="dialog-details"></p>
        </figcaption>
      </figure>
      <button class="dialog-next" type="button">Next work</button>
    </dialog>
  `
}

renderApp()

const hashArtworkId = new URLSearchParams(window.location.hash.slice(1)).get('artwork')
const hashArtworkIndex = artworks.findIndex((artwork) => artwork.id === hashArtworkId)
const state = createGalleryState(artworks.length, Math.max(0, hashArtworkIndex))
const section = document.querySelector('.exhibition-room')
const galleryController = createGalleryController({
  section,
  rail: document.querySelector('.artwork-rail'),
  items: [...document.querySelectorAll('.artwork-slide')],
  artworks,
  state,
  previousButton: document.querySelector('[data-gallery-previous]'),
  nextButton: document.querySelector('[data-gallery-next]'),
  liveRegion: document.querySelector('.selection-announcement'),
  metadata: document.querySelector('.selected-metadata'),
  roomCount: document.querySelector('.room-heading > span'),
})

const exhibitionDialog = createExhibitionDialog({
  dialog: document.querySelector('.artwork-dialog'),
  artworks,
  onSelect: (index) => galleryController.select(index),
})

const videoRoom = createVideoRoom([...document.querySelectorAll('.video-work video')])

document.querySelectorAll('.exhibition-open').forEach((button) => {
  button.addEventListener('click', () => {
    exhibitionDialog.open(Number(button.dataset.exhibitionIndex), button)
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

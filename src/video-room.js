export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const wholeSeconds = Math.floor(seconds)
  const minutes = Math.floor(wholeSeconds / 60)
  const remainder = wholeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function createVideoRoom(videos) {
  const cleanups = []

  videos.forEach((video) => {
    const updateDuration = () => {
      const duration = video.closest('.video-work')?.querySelector('[data-duration]')
      if (duration) duration.textContent = formatDuration(video.duration)
    }

    const pauseOthers = () => {
      videos.forEach((otherVideo) => {
        if (otherVideo !== video && !otherVideo.paused) otherVideo.pause()
      })
    }

    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('play', pauseOthers)
    cleanups.push(() => {
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('play', pauseOthers)
    })
  })

  const pauseWhenHidden = () => {
    if (!document.hidden) return
    videos.forEach((video) => video.pause())
  }

  document.addEventListener('visibilitychange', pauseWhenHidden)
  cleanups.push(() => document.removeEventListener('visibilitychange', pauseWhenHidden))

  return {
    destroy() {
      cleanups.forEach((cleanup) => cleanup())
    },
  }
}

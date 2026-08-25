export function createGalleryState(count, initialIndex = 0) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('Gallery state requires at least one item')
  }

  const clamp = (index) => Math.max(0, Math.min(count - 1, Number(index) || 0))
  const subscribers = new Set()
  let selectedIndex = clamp(initialIndex)

  function select(index) {
    const nextIndex = clamp(index)
    if (nextIndex === selectedIndex) return selectedIndex

    selectedIndex = nextIndex
    subscribers.forEach((subscriber) => subscriber(selectedIndex))
    return selectedIndex
  }

  return {
    getIndex: () => selectedIndex,
    select,
    previous: () => select(selectedIndex - 1),
    next: () => select(selectedIndex + 1),
    subscribe(subscriber) {
      subscribers.add(subscriber)
      return () => subscribers.delete(subscriber)
    },
  }
}

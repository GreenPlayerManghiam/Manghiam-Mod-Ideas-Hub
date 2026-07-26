import { useState, useEffect } from 'react'
import { formatDownloads } from '../data/mods'
import { toggleFeaturedInStorage } from './AppPersistence'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'

export default function ModDetail({
  mod,
  onClose,
  onDownload,
  onRate,
  onOpenFullPage,
  currentUser,
  onToggleFeature,
}) {
  const [isSaved, setIsSaved] = useState(false)
  const [userRating, setUserRating] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  // Resolve active user (with localStorage fallback)
  const activeUser = currentUser || localStorage.getItem('modhub_current_user') || null

  // Is the current user the Founder?
  const isFounder = (activeUser || '').toLowerCase() === 'manghiam'

  // Featured state with localStorage override
  const [isFeatured, setIsFeatured] = useState(() => {
    try {
      const overrides = JSON.parse(localStorage.getItem('modhub_featured_overrides') || '{}')
      if (Object.prototype.hasOwnProperty.call(overrides, mod?.id)) {
        return overrides[mod.id]
      }
    } catch {}
    return mod?.featured || false
  })

  useEffect(() => {
    if (mod) {
      setGalleryIndex(0)
      // Check collection status
      const collections = JSON.parse(localStorage.getItem('modhub_collections') || '[]')
      setIsSaved(collections.some((m) => m.id === mod.id))
      // Check user rating
      if (activeUser) {
        const allRatings = JSON.parse(localStorage.getItem('modhub_mod_ratings') || '{}')
        setUserRating(allRatings[mod.id]?.[activeUser] || null)
      } else {
        setUserRating(null)
      }
      // Refresh featured state
      try {
        const overrides = JSON.parse(localStorage.getItem('modhub_featured_overrides') || '{}')
        if (Object.prototype.hasOwnProperty.call(overrides, mod.id)) {
          setIsFeatured(overrides[mod.id])
        } else {
          setIsFeatured(mod.featured || false)
        }
      } catch {}
    }
  }, [mod, activeUser])

  if (!mod) return null

  // Build image list (support both Supabase gallery_images / cover_image & legacy static images)
  const rawImages =
    (mod.gallery_images && mod.gallery_images.length > 0 && mod.gallery_images) ||
    (mod.images && mod.images.length > 0 && mod.images) ||
    [mod.cover_image || mod.image || PLACEHOLDER_IMAGE]

  const images = rawImages.filter(Boolean)

  const authorName =
    typeof mod.author === 'string'
      ? mod.author
      : mod.author?.username || 'Community Modder'

  const gameTitle = mod.gameName || mod.game?.name || mod.game || 'Game Mod'

  const handleToggleFeature = () => {
    const newState = toggleFeaturedInStorage(mod.id, isFeatured)
    setIsFeatured(newState)
    if (onToggleFeature) onToggleFeature(mod.id, newState)
  }

  const handleToggleCollection = () => {
    const collections = JSON.parse(localStorage.getItem('modhub_collections') || '[]')
    if (isSaved) {
      localStorage.setItem(
        'modhub_collections',
        JSON.stringify(collections.filter((m) => m.id !== mod.id))
      )
      setIsSaved(false)
    } else {
      collections.push(mod)
      localStorage.setItem('modhub_collections', JSON.stringify(collections))
      setIsSaved(true)
    }
  }

  const handleStarClick = (star) => {
    if (!activeUser) {
      alert('Please sign in to rate mods!')
      return
    }
    const allRatings = JSON.parse(localStorage.getItem('modhub_mod_ratings') || '{}')
    if (!allRatings[mod.id]) allRatings[mod.id] = {}
    let newScore = star
    if (allRatings[mod.id][activeUser] === star) {
      delete allRatings[mod.id][activeUser]
      newScore = null
    } else {
      allRatings[mod.id][activeUser] = star
    }
    localStorage.setItem('modhub_mod_ratings', JSON.stringify(allRatings))
    setUserRating(newScore)
    if (onRate) onRate(mod.id, newScore)
  }

  const prevImage = (e) => {
    e.stopPropagation()
    setGalleryIndex((i) => (i - 1 + images.length) % images.length)
  }

  const nextImage = (e) => {
    e.stopPropagation()
    setGalleryIndex((i) => (i + 1) % images.length)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-detail-title"
    >
      <div
        className="card relative my-8 w-full max-w-2xl overflow-hidden shadow-2xl shadow-black/50 bg-surface-raised border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-gray-300 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image gallery */}
        <div className="relative aspect-video bg-surface-overlay">
          <img
            src={images[galleryIndex] || PLACEHOLDER_IMAGE}
            alt={`${mod.title || 'Mod'} — image ${galleryIndex + 1}`}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = PLACEHOLDER_IMAGE
            }}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/20 to-transparent" />

          {/* Gallery nav — only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer backdrop-blur-sm"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer backdrop-blur-sm"
              >
                ›
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setGalleryIndex(i)
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === galleryIndex ? 'w-4 bg-accent' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <span className="absolute top-3 left-3 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] text-gray-300 backdrop-blur-sm">
                {galleryIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="badge bg-accent/20 text-accent-hover">{gameTitle}</span>
            {mod.category && <span className="badge bg-surface-overlay text-gray-400">{mod.category}</span>}
            <span className="badge bg-surface-overlay text-gray-400">v{mod.version || '1.0'}</span>
            {isFeatured && (
              <span className="badge bg-accent/20 text-accent">⭐ Featured</span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="mod-detail-title" className="font-display text-2xl font-bold text-white">
                {mod.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                by <span className="text-gray-300 font-medium">{authorName}</span> · Updated {mod.updated || 'Recently'}
              </p>
            </div>

            {/* Founder feature toggle */}
            {isFounder && (
              <button
                type="button"
                onClick={handleToggleFeature}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isFeatured
                    ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                    : 'bg-surface-overlay border-white/10 text-yellow-400 hover:border-yellow-400/50'
                }`}
                title={isFeatured ? 'Remove from Featured' : 'Feature this mod'}
              >
                {isFeatured ? '★ Unfeature' : '☆ Feature'}
              </button>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-gray-300">{mod.description || 'No description provided.'}</p>

          {/* Rating widget */}
          <div className="mt-4 rounded-xl bg-surface-overlay p-4 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-sm font-medium text-gray-300">
                  {userRating ? `⭐ You rated this ${userRating} stars!` : 'Rate this mod (change or remove anytime):'}
                </span>
                {userRating && (
                  <p className="text-[11px] text-accent mt-0.5">Click your rating again to clear it.</p>
                )}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className={`text-xl transition-transform hover:scale-125 cursor-pointer ${
                      userRating && star <= userRating ? 'text-yellow-400 font-bold' : 'text-gray-600 hover:text-yellow-300'
                    }`}
                    title={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Rating', value: `⭐ ${mod.rating || '4.5'}` },
              { label: 'Downloads', value: formatDownloads ? formatDownloads(mod.downloads || 0) : mod.downloads || 0 },
              { label: 'Size', value: mod.file_size || mod.size || '15 MB' },
              { label: 'Version', value: mod.version || '1.0' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-surface-overlay p-3 text-center border border-white/5">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="mt-1 text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {Array.isArray(mod.tags) && mod.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {mod.tags.map((tag) => (
                <span key={tag} className="badge bg-surface-overlay text-gray-400">#{tag}</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onDownload && onDownload(mod.id)}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                Download ({mod.file_size || mod.size || '15 MB'})
              </button>
              <button
                type="button"
                onClick={handleToggleCollection}
                className={`flex-1 py-3 rounded-xl font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'btn-secondary text-gray-300 hover:text-white'
                }`}
              >
                {isSaved ? '❤️ Added to Collection' : '🤍 Add to Collection'}
              </button>
            </div>

            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => onOpenFullPage(mod.id)}
                className="w-full py-3 rounded-xl bg-surface-overlay border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:border-accent transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                💬 Open Full Mod Page & Community Comments &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
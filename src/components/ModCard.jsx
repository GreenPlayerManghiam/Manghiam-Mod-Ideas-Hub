import { useState } from 'react'
import { formatDownloads } from '../data/mods'
import { toggleFeaturedInStorage } from './AppPersistence'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-medium text-gray-300">{rating}</span>
    </div>
  )
}

export default function ModCard({ mod, onSelect, onToggleFeature }) {
  // Read founder status directly from localStorage — no prop needed
  const isFounder =
    (localStorage.getItem('modhub_current_user') || '').toLowerCase() === 'manghiam'

  // Featured state: read override from localStorage, fall back to mod.featured
  const [isFeatured, setIsFeatured] = useState(() => {
    try {
      const overrides = JSON.parse(localStorage.getItem('modhub_featured_overrides') || '{}')
      if (Object.prototype.hasOwnProperty.call(overrides, mod.id)) {
        return overrides[mod.id]
      }
    } catch {}
    return mod.featured || false
  })

  const handleToggleFeature = (e) => {
    e.stopPropagation() // don't open the mod detail
    const newState = toggleFeaturedInStorage(mod.id, isFeatured)
    setIsFeatured(newState)
    // Notify parent so the featured section can refresh if needed
    if (onToggleFeature) onToggleFeature(mod.id, newState)
  }

  // Does this mod have multiple images?
  const imageCount = mod.images?.length || 0

  return (
    <article
      className="card-hover group cursor-pointer overflow-hidden"
      onClick={() => onSelect(mod)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(mod)}
      role="button"
      tabIndex={0}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={mod.image}
          alt={mod.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />

        {/* Featured badge */}
        {isFeatured && (
          <span className="badge absolute left-3 top-3 bg-accent/90 text-white">⭐ Featured</span>
        )}

        {/* Multi-image indicator */}
        {imageCount > 1 && (
          <span className="absolute left-3 bottom-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] text-gray-300 backdrop-blur-sm">
            🖼 {imageCount}
          </span>
        )}

        {/* Game badge */}
        <span className="badge absolute right-3 top-3 bg-black/60 text-gray-200 backdrop-blur-sm">
          {mod.gameName || mod.game}
        </span>

        {/* Founder feature toggle — only visible to Manghiam */}
        {isFounder && (
          <button
            type="button"
            onClick={handleToggleFeature}
            title={isFeatured ? 'Remove from Featured' : 'Add to Featured'}
            className={`absolute right-3 bottom-3 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100 cursor-pointer ${
              isFeatured
                ? 'bg-accent text-white hover:bg-accent/80'
                : 'bg-black/60 text-yellow-400 hover:bg-black/80 backdrop-blur-sm'
            }`}
          >
            {isFeatured ? '★ Unfeature' : '☆ Feature'}
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-white group-hover:text-accent-hover">
            {mod.title}
          </h3>
          <StarRating rating={mod.rating} />
        </div>

        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-400">{mod.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>by {mod.author}</span>
          <span>{formatDownloads(mod.downloads)} downloads</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {mod.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge bg-surface-overlay text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

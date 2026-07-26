import { useState } from 'react'
import { getGames } from '../data/mods'
import { saveModToStorage } from './AppPersistence'

// Compress an image file to a base64 JPEG string
// maxWidth: max pixel width (height scales proportionally)
// quality: JPEG quality 0-1
const compressImage = (file, maxWidth = 700, quality = 0.65) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const MAX_IMAGES = 5

export default function UploadModal({ isOpen, onClose, onAddMod, currentUser }) {
  const [gamesList, setGamesList] = useState(getGames)
  // images: array of { preview: base64string, name: string }
  const [images, setImages] = useState([])
  const [isCompressing, setIsCompressing] = useState(false)

  if (!isOpen) return null

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      alert(`You can upload a maximum of ${MAX_IMAGES} images per mod.`)
      return
    }

    const toProcess = files.slice(0, remaining)
    setIsCompressing(true)

    try {
      const compressed = await Promise.all(
        toProcess.map((file) => compressImage(file, 700, 0.65))
      )
      setImages((prev) => [
        ...prev,
        ...compressed.map((preview, i) => ({ preview, name: toProcess[i].name })),
      ])
    } catch (err) {
      alert('Failed to process one or more images. Please try again.')
    } finally {
      setIsCompressing(false)
      // Reset input so the same file can be re-selected if removed
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddCustomGame = () => {
    const gameName = prompt("Enter new game title (e.g., 'Elden Ring'):")
    if (!gameName) return

    const gameIcon = prompt("Enter an emoji icon for the game (e.g., '💍'):", '🎮') || '🎮'
    const gameId = gameName.toLowerCase().replace(/[^a-z0-9]/g, '')

    const customGames = JSON.parse(localStorage.getItem('modhub_custom_games') || '[]')
    if (customGames.some((g) => g.id === gameId)) {
      alert('This game already exists!')
      return
    }

    const newGame = { id: gameId, name: gameName, icon: gameIcon }
    customGames.push(newGame)
    localStorage.setItem('modhub_custom_games', JSON.stringify(customGames))
    setGamesList(getGames())
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const gameName = formData.get('game')

    // images[0] = cover/main image (used by ModCard), images[1..] = gallery
    const imageUrls = images.map((img) => img.preview)
    const coverImage =
      imageUrls[0] ||
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'

    const newMod = {
      id: Date.now(),
      title: formData.get('title'),
      game: gameName,
      gameName: gameName,
      description: formData.get('description'),
      author: currentUser || 'You',
      rating: 5.0,
      downloads: 0,
      size: '15 MB',
      fileSize: '15 MB',
      version: '1.0',
      category: 'Gameplay',
      tags: ['New', 'Custom'],
      // Cover image (backward-compatible single image field)
      image: coverImage,
      // Full gallery (all images including cover)
      images: imageUrls.length > 0 ? imageUrls : [coverImage],
      uploaded: true,
    }

    // Persist to localStorage so it survives refreshes
    saveModToStorage(newMod)

    onAddMod(newMod)
    setImages([])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card relative w-full max-w-lg p-6 bg-surface-raised border border-white/10 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-white">Upload a New Mod</h3>
          <button
            onClick={() => { setImages([]); onClose() }}
            className="text-gray-400 hover:text-white text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mod Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Ultra Graphics Overhaul"
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          {/* Game */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-gray-400">Game</label>
              <button
                type="button"
                onClick={handleAddCustomGame}
                className="text-xs text-accent font-medium hover:underline cursor-pointer"
              >
                + Add New Game
              </button>
            </div>
            <select
              name="game"
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white outline-none focus:border-accent"
            >
              {gamesList
                .filter((g) => g.id !== 'all')
                .map((game) => (
                  <option key={game.id} value={game.name}>
                    {game.icon} {game.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              required
              rows="3"
              placeholder="Describe your mod..."
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          {/* Multi-image upload */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-gray-400">
                Mod Images
                <span className="ml-2 text-xs text-gray-500">
                  ({images.length}/{MAX_IMAGES} — first image is the cover)
                </span>
              </label>
            </div>

            {/* Upload trigger */}
            {images.length < MAX_IMAGES && (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-white/20 bg-surface-overlay hover:border-accent/50 hover:bg-surface cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                  disabled={isCompressing}
                />
                {isCompressing ? (
                  <span className="text-xs text-gray-400 animate-pulse">Compressing images…</span>
                ) : (
                  <>
                    <span className="text-2xl mb-1">🖼️</span>
                    <span className="text-xs text-gray-400">
                      Click to add images ({MAX_IMAGES - images.length} remaining)
                    </span>
                    <span className="text-[10px] text-gray-600 mt-0.5">PNG, JPG, WEBP — auto-compressed</span>
                  </>
                )}
              </label>
            )}

            {/* Image grid preview */}
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <img
                      src={img.preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Cover badge */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-accent/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        COVER
                      </span>
                    )}
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="mt-2 text-[10px] text-gray-600">
                No images? A default placeholder will be used.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isCompressing}
            className="w-full btn-primary py-3 mt-2 cursor-pointer disabled:opacity-50"
          >
            {isCompressing ? 'Processing Images…' : 'Publish Mod'}
          </button>
        </form>
      </div>
    </div>
  )
}

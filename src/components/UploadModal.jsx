import { useState, useEffect, useRef } from 'react'
import {
  getGames,
  createGame,
  createMod,
  uploadModImage,
  getModImageUrl,
  getCurrentUser,
  supabase,
} from '../lib/supabaseApi'

const MAX_IMAGES = 5

export default function UploadModal({ isOpen, onClose, onAddMod, initialData = null }) {
  const [gamesList, setGamesList] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)

  const isEditing = Boolean(initialData)

  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      // 1. Load Games
      const { data: gamesData, error: gamesError } = await getGames()
      if (gamesError) {
        console.error('Failed to load games:', gamesError)
      } else {
        setGamesList(gamesData || [])
      }

      // 2. Load Categories dynamically
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (catError) {
        console.error('Failed to load categories:', catError)
      } else {
        setCategoriesList(catData || [])
      }

      // 3. If editing, pre-load existing gallery images as previews
      if (initialData && initialData.gallery_images) {
        const preloaded = initialData.gallery_images.map((url, idx) => ({
          file: null, // No new file object needed for existing remote images
          preview: url,
          name: `existing_image_${idx}.jpg`,
          isExisting: true,
        }))
        setImages(preloaded)
      }
    }

    loadData()
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      alert(`You can upload a maximum of ${MAX_IMAGES} images per mod.`)
      return
    }

    const toProcess = files.slice(0, remaining)

    const newImages = toProcess.map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }))

    setImages((prev) => [...prev, ...newImages])
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const target = prev[index]
      if (target && !target.isExisting && target.preview) {
        URL.revokeObjectURL(target.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleAddCustomGame = async () => {
    const gameName = prompt("Enter new game title (e.g., 'Elden Ring'):")
    if (!gameName) return

    const gameIcon = prompt("Enter an emoji icon for the game (e.g., '💍'):", '🎮') || '🎮'

    if (gamesList.some((g) => g.name.toLowerCase() === gameName.toLowerCase())) {
      alert('This game already exists!')
      return
    }

    const { data: newGame, error } = await createGame({ name: gameName, icon: gameIcon })
    if (error) {
      alert('Failed to add game: ' + error.message)
      return
    }

    setGamesList((prev) => [...prev, newGame].sort((a, b) => a.name.localeCompare(b.name)))
  }

  const handleAddCustomCategory = async () => {
    const catName = prompt("Enter new category name (e.g., 'Soundtrack'):")
    if (!catName) return

    if (categoriesList.some((c) => c.name.toLowerCase() === catName.toLowerCase())) {
      alert('This category already exists!')
      return
    }

    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const { data: newCat, error } = await supabase
      .from('categories')
      .insert([{ name: catName, slug }])
      .select()
      .single()

    if (error) {
      alert('Failed to add category (Make sure you have admin/mod rights): ' + error.message)
      return
    }

    setCategoriesList((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
  }

  const handleClose = () => {
    images.forEach((img) => {
      if (!img.isExisting && img.preview) URL.revokeObjectURL(img.preview)
    })
    setImages([])
    if (formRef.current) formRef.current.reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        alert('You must be signed in to publish or edit a mod.')
        setIsSubmitting(false)
        return
      }

      const formData = new FormData(e.target)
      const gameId = formData.get('game')
      const selectedCategory = formData.get('category')

      // Separate newly uploaded files from already existing images
      const uploadedUrls = []
      for (const img of images) {
        if (img.isExisting) {
          uploadedUrls.push(img.preview) // Keep existing remote URL
        } else if (img.file) {
          const timestamp = Date.now()
          const safeName = img.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const path = `${user.id}/${timestamp}_${safeName}`

          const { error: uploadError } = await uploadModImage(path, img.file)
          if (uploadError) {
            throw new Error(`Failed to upload image "${img.name}": ${uploadError.message}`)
          }

          const publicUrl = getModImageUrl(path)
          uploadedUrls.push(publicUrl)
        }
      }

      const coverImage =
        uploadedUrls[0] ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'

      const galleryImages = uploadedUrls.length > 0 ? uploadedUrls : [coverImage]

      if (isEditing) {
        // --- EDIT MODE ---
        const updatedFields = {
          title: formData.get('title'),
          description: formData.get('description'),
          game_id: gameId,
          category: selectedCategory,
          cover_image: coverImage,
          gallery_images: galleryImages,
        }

        const { data: updatedMod, error: updateError } = await supabase
          .from('mods')
          .update(updatedFields)
          .eq('id', initialData.id)
          .select()
          .single()

        if (updateError) {
          throw new Error(updateError.message)
        }

        onAddMod(updatedMod) // Passes updated mod back to parent state handler
        handleClose()
      } else {
        // --- CREATE MODE ---
        const newMod = {
          title: formData.get('title'),
          description: formData.get('description'),
          author_id: user.id,
          game_id: gameId,
          category: selectedCategory,
          cover_image: coverImage,
          gallery_images: galleryImages,
          version: '1.0',
          file_size: '15 MB',
          tags: ['New', 'Custom'],
        }

        const { data: createdMod, error: createError } = await createMod(newMod)
        if (createError) {
          throw new Error(createError.message)
        }

        onAddMod(createdMod)
        handleClose()
      }
    } catch (err) {
      alert('Failed to save mod: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="card relative w-full max-w-lg p-6 bg-surface-raised border border-white/10 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-white">
            {isEditing ? 'Edit Mod Details' : 'Upload a New Mod'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mod Title</label>
            <input
              name="title"
              required
              defaultValue={initialData?.title || ''}
              placeholder="e.g. Ultra Graphics Overhaul"
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          {/* Game Selection */}
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
              required
              defaultValue={initialData?.game_id || ''}
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white outline-none focus:border-accent"
            >
              <option value="" disabled>Select a game</option>
              {gamesList.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.icon} {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-gray-400">Category</label>
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="text-xs text-accent font-medium hover:underline cursor-pointer"
              >
                + Add Category (Mod/Admin)
              </button>
            </div>
            <select
              name="category"
              required
              defaultValue={initialData?.category || ''}
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white outline-none focus:border-accent"
            >
              <option value="" disabled>Select a category</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
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
              defaultValue={initialData?.description || ''}
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

            {images.length < MAX_IMAGES && (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-white/20 bg-surface-overlay hover:border-accent/50 hover:bg-surface cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <span className="text-2xl mb-1">🖼️</span>
                <span className="text-xs text-gray-400">
                  Click to add images ({MAX_IMAGES - images.length} remaining)
                </span>
                <span className="text-[10px] text-gray-600 mt-0.5">PNG, JPG, WEBP — uncompressed full quality</span>
              </label>
            )}

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <img
                      src={img.preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-accent/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        COVER
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500"
                      title="Remove image"
                    >
                      &times;
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
            disabled={isSubmitting}
            className="w-full btn-primary py-3 mt-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Publish Mod'}
          </button>
        </form>
      </div>
    </div>
  )
}
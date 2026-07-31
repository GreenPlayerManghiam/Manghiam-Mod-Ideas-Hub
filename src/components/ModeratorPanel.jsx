import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseApi'

export default function ModeratorPanel({ onBackToHome, currentUser }) {
  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([]) // State for categories
  const [newCategoryName, setNewCategoryName] = useState('') // Input state for new category
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingCat, setIsSubmittingCat] = useState(false)

  // Fetch games and categories list
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch games
      const { data: gamesData, error: gamesError } = await supabase.from('games').select('*')
      if (gamesError) {
        console.error('Error fetching games:', gamesError.message)
      } else if (gamesData) {
        setGames(gamesData)
      }

      // Fetch categories
      const { data: catData, error: catError } = await supabase.from('categories').select('*').order('name')
      if (catError) {
        console.error('Error fetching categories:', catError.message)
      } else if (catData) {
        setCategories(catData)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const handleDeleteGame = async (gameId, gameName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${gameName}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    setGames((prev) => prev.filter((g) => g.id !== gameId))

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (error) {
        alert('Failed to delete game from database: ' + error.message)
        const { data } = await supabase.from('games').select('*')
        if (data) setGames(data)
      }
    } catch (err) {
      console.error('Unexpected error during game deletion:', err)
      alert('An unexpected error occurred.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle creating a new mod category
  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim() || isSubmittingCat) return

    setIsSubmittingCat(true)
    const name = newCategoryName.trim()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, slug }])
        .select()
        .single()

      if (error) {
        alert('Failed to create category: ' + error.message)
      } else if (data) {
        setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setNewCategoryName('')
      }
    } catch (err) {
      console.error('Unexpected error creating category:', err)
      alert('An unexpected error occurred.')
    } finally {
      setIsSubmittingCat(false)
    }
  }

  // Handle deleting a mod category
  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return
    }

    // Optimistic UI update
    setCategories((prev) => prev.filter((c) => c.id !== catId))

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', catId)

    if (error) {
      alert('Failed to delete category: ' + error.message)
      // Re-fetch if it fails
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-5xl mx-auto text-white">
      {/* Back button */}
      <button 
        onClick={onBackToHome}
        className="mb-8 px-4 py-2 rounded-xl bg-surface border border-white/10 hover:border-accent/50 text-sm font-medium transition-colors cursor-pointer"
      >
        ← Back to Hub
      </button>

      {/* Header */}
      <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <span className="inline-block rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-mono font-bold text-red-400 uppercase tracking-widest mb-2">
            🛡️ Staff Access Only
          </span>
          <h1 className="text-3xl font-display font-bold">Moderator Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform content, clean up game categories, and control mod classifications.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-semibold text-accent">{currentUser?.username || currentUser?.email || 'Staff'}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Mod Categories Management Section (NEW) */}
        <div className="rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-md p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            🏷️ Mod Categories Management
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Create or delete filter categories that users can assign their mods to.
          </p>

          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6 max-w-md">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name (e.g., Audio)..."
              className="flex-1 rounded-xl border border-white/10 bg-surface-overlay py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
              required
            />
            <button
              type="submit"
              disabled={isSubmittingCat}
              className="btn-primary px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSubmittingCat ? 'Adding...' : 'Add Category'}
            </button>
          </form>

          {/* Categories Grid */}
          {loading ? (
            <div className="py-6 text-center text-gray-400 animate-pulse text-sm">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-6 text-center text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
              No categories found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-surface-raised hover:border-white/20 transition-all"
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-semibold text-white truncate">{cat.name}</p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase">{cat.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Management Section */}
        <div className="rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-md p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            🎮 Platform Game Categories Cleanup
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Review user-submitted games. Deleting a game will permanently clear it from the repository catalog.
          </p>

          {loading ? (
            <div className="py-12 text-center text-gray-400 animate-pulse text-sm">
              Loading game catalog…
            </div>
          ) : games.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
              No games found in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-surface-raised hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden pr-2">
                    <span className="text-2xl p-2 rounded-lg bg-black/20 shrink-0">{game.icon || '🎮'}</span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                      <p className="text-[10px] font-mono text-gray-500 uppercase">{game.slug || 'custom'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGame(game.id, game.name)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseApi'

export default function ModeratorPanel({ onBackToHome, currentUser }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch games list
  useEffect(() => {
    async function fetchGames() {
      setLoading(true)
      const { data, error } = await supabase.from('games').select('*')
      if (error) {
        console.error('Error fetching games:', error.message)
      } else if (data) {
        setGames(data)
      }
      setLoading(false)
    }
    fetchGames()
  }, [])

  const handleDeleteGame = async (gameId, gameName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${gameName}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    // Optimistic UI update
    setGames((prev) => prev.filter((g) => g.id !== gameId))

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (error) {
        alert('Failed to delete game from database: ' + error.message)
        // Re-fetch games if deletion failed due to permissions or network
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
          <p className="text-gray-400 text-sm mt-1">Manage platform content, clean up fake game categories, and moderate repository data.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-semibold text-accent">{currentUser?.username || currentUser?.email || 'Staff'}</p>
        </div>
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
  )
}
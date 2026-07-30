export default function GameCategories({ games, selectedGame, onSelectGame }) {
  const isAllSelected = selectedGame === 'all' || selectedGame === 'All'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-lg font-display font-semibold text-white mb-4">Browse by Game</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {/* All Games Option Button */}
        <button
          type="button"
          onClick={() => onSelectGame('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer border ${
            isAllSelected
              ? 'bg-accent text-white shadow-lg shadow-accent/25 border-accent'
              : 'bg-surface-raised text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          <span>🎮</span>
          <span>All Games</span>
        </button>

        {/* Dynamic Games List */}
        {games.map((game) => {
          const isSelected = selectedGame === game.id
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelectGame(game.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-accent text-white shadow-lg shadow-accent/25 border-accent'
                  : 'bg-surface-raised text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{game.icon}</span>
              <span>{game.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
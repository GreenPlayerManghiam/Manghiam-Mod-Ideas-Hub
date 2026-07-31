export default function SearchBar({ 
  query, 
  onQueryChange, 
  selectedCategory, 
  onCategoryChange, 
  categories = [], 
  resultCount 
}) {
  return (
    <div id="browse" className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">All Mods</h2>
          <p className="mt-1 text-sm text-gray-500">{resultCount} mod{resultCount !== 1 ? 's' : ''} found</p>
        </div>

        <div className="relative w-full sm:max-w-md">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search mods, authors, tags..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-surface-overlay py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Dynamic Category Filter Pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {/* Always include the 'All' filter button first */}
        <button
          type="button"
          onClick={() => onCategoryChange('All')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-accent text-white'
              : 'bg-surface-overlay text-gray-400 hover:bg-surface-raised hover:text-white'
          }`}
        >
          All
        </button>

        {/* Map through dynamic database categories */}
        {categories.map((cat) => {
          const categoryName = typeof cat === 'string' ? cat : cat.name
          return (
            <button
              key={cat.id || categoryName}
              type="button"
              onClick={() => onCategoryChange(categoryName)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === categoryName
                  ? 'bg-accent text-white'
                  : 'bg-surface-overlay text-gray-400 hover:bg-surface-raised hover:text-white'
              }`}
            >
              {categoryName}
            </button>
          )
        })}
      </div>
    </div>
  )
}

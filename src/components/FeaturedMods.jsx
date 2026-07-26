import ModCard from './ModCard'

export default function FeaturedMods({ mods, onSelect }) {
  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Featured Mods</h2>
          <p className="mt-2 text-gray-400">Hand-picked by the community this week</p>
        </div>
        <a href="#browse" className="hidden text-sm font-medium text-accent-hover hover:text-accent sm:block">
          View all →
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mods.map((mod) => (
          <ModCard key={mod.id} mod={mod} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}

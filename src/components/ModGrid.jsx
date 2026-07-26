import ModCard from './ModCard'

export default function ModGrid({ mods, onSelect }) {
  if (!mods || mods.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl bg-surface-overlay p-8 border border-surface-raised shadow-xl">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-display text-xl font-bold text-white">Hub is Clean</h3>
          <p className="mt-2 text-sm text-gray-400">
            No mods found here yet. Click <span className="text-accent font-semibold">"Upload Mod"</span> in the navigation bar to publish your very first creation!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mods.map((mod) => (
          <ModCard key={mod.id} mod={mod} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
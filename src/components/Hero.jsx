export default function Hero({ onBrowseClick, onUploadClick }) {
  return (
    <section className="relative overflow-hidden bg-grid-pattern bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-surface" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-mono tracking-wider text-accent-hover uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
            </span>
            ANIMUS SYNCED // DIRECTED BY MANGHIAM
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Pitch, Brainstorm &amp; Build{' '}
            <span className="bg-gradient-to-r from-accent-hover to-neon-green bg-clip-text text-transparent">
              Mod Ideas
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Controlled by the Rook Parliament. Share conceptual game mechanics and wild visions for Assassin’s Creed Syndicate, Skyrim, Minecraft, GTA V, and more under absolute architectural authority.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button type="button" onClick={onBrowseClick} className="btn-primary px-8 py-3 text-base cursor-pointer">
              Explore Ideas
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button type="button" onClick={onUploadClick} className="btn-secondary px-8 py-3 text-base cursor-pointer">
              Post Mod Idea
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-10 font-mono text-xs text-gray-400">
            <div>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">SYNDICATE</div>
              <div className="mt-1">Rook Control Active</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">MANGHIAM</div>
              <div className="mt-1">Lead Systems Architect</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">ANIMUS v2.6</div>
              <div className="mt-1">Zero Latency Sync</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
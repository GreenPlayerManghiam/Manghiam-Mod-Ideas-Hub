export default function Footer({ onNavigateDev, onNavigateInfo, onNavigateForums, onUploadClick }) {
  return (
    <footer className="mt-16 border-t border-white/5 bg-surface-raised/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Kojima-Style Executive Director Credit Banner */}
        <div className="mb-12 rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center">
          <p className="font-mono text-[10px] tracking-widest text-accent uppercase mb-1">
            // EXECUTIVE PRODUCER, LEAD SYSTEM ARCHITECT &amp; ASSASSIN'S CREED DIRECTOR
          </p>
          <div className="font-display text-2xl font-black text-white tracking-wider">
            MANGHIAM
          </div>
          <p className="font-mono text-xs text-gray-400 mt-2 max-w-xl mx-auto">
            A Master-Crafted Production spanning every era—from the Holy Land to Victorian London's Rook Parliament. Local AI synchronized and secured.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-white flex items-center gap-2">
              Manghiam <span className="text-accent">Mod Ideas Hub</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 font-mono">
              A community-driven incubator for game mod concepts, pitches, and creative design ideas under absolute architectural authority.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">Community</h4>
            <ul className="mt-3 space-y-2">
              {['Forums', 'Discord', 'Guidelines', 'Support'].map((link) => (
                <li key={link}>
                  <button 
                    type="button"
                    onClick={() => {
                      if (link === 'Forums') {
                        onNavigateForums?.()
                      } else {
                        onNavigateInfo(link)
                      }
                    }} 
                    className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer text-left bg-transparent border-none p-0"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">Developers</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <button 
                  type="button"
                  onClick={onUploadClick} 
                  className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Post Mod Idea
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={onNavigateDev} 
                  className="text-sm text-accent hover:text-accent-hover font-semibold transition-colors cursor-pointer text-left bg-transparent border-none p-0 flex items-center gap-1.5"
                >
                  <span>⚡</span> System Command
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row font-mono text-xs">
          <p className="tracking-wider text-accent uppercase">
            A MANGHIAM PRODUCTION &bull; ALL RIGHTS RESERVED &copy; 2026
          </p>
          <div className="flex gap-6 text-gray-500">
            <button type="button" onClick={() => onNavigateInfo('Privacy')} className="hover:text-white cursor-pointer bg-transparent border-none p-0 text-gray-500">Privacy Protocol</button>
            <button type="button" onClick={() => onNavigateInfo('Terms')} className="hover:text-white cursor-pointer bg-transparent border-none p-0 text-gray-500">Rook Decrees</button>
            <button type="button" onClick={() => onNavigateInfo('DMCA')} className="hover:text-white cursor-pointer bg-transparent border-none p-0 text-gray-500">Assassination Vault</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
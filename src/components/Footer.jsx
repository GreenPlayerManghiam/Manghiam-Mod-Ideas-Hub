export default function Footer({ onNavigateDev, onNavigateInfo, onUploadClick }) {
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

          {[
            {
              title: 'Community',
              links: ['Forums', 'Discord', 'Guidelines', 'Support'],
            },
            {
              title: 'Developers',
              links: ['Post Mod Idea', 'API Docs', 'Analytics', 'Partners'],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => {
                  const isDevPortalLink = ['API Docs', 'Analytics', 'Partners'].includes(link)
                  const isUploadLink = link === 'Post Mod Idea' || link === 'Upload Mod'

                  return (
                    <li key={link}>
                      {isDevPortalLink ? (
                        <button 
                          onClick={onNavigateDev} 
                          className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer text-left"
                        >
                          {link}
                        </button>
                      ) : isUploadLink ? (
                        <button 
                          onClick={onUploadClick} 
                          className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer text-left"
                        >
                          {link}
                        </button>
                      ) : (
                        <button 
                          onClick={() => onNavigateInfo(link)} 
                          className="text-sm text-gray-500 transition-colors hover:text-gray-300 cursor-pointer text-left"
                        >
                          {link}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row font-mono text-xs">
          <p className="tracking-wider text-accent uppercase">
            A MANGHIAM PRODUCTION &bull; ALL RIGHTS RESERVED &copy; 2026
          </p>
          <div className="flex gap-6 text-gray-500">
            <button onClick={() => onNavigateInfo('Privacy')} className="hover:text-white cursor-pointer">Privacy Protocol</button>
            <button onClick={() => onNavigateInfo('Terms')} className="hover:text-white cursor-pointer">Rook Decrees</button>
            <button onClick={() => onNavigateInfo('DMCA')} className="hover:text-white cursor-pointer">Assassination Vault</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
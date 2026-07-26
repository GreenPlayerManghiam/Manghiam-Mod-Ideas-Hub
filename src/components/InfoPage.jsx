export default function InfoPage({ pageTitle, onBackToHome }) {
  const contentMap = {
    'Privacy': {
      tag: 'ABSOLUTION // THE ANISUS DATABASE',
      title: 'Privacy Policy: The Manghiam Abstergo Protocol',
      body: `1. GENETIC SYNCHRONIZATION: By using this Mod Hub, you allow Manghiam to sync directly with your genetic memories via the Animus. Your browsing history, local storage, and mod configurations are permanently uploaded to the mainframe.\n\n2. TEMPLAR SURVEILLANCE: Any attempt to block our trackers will be met with a swift counter-assassination. Only the Brotherhood of Manghiam has clearance to view your data.\n\n3. BLIGHTED DATA: We do not share your telemetry with rival factions or modern-day Templars. Your secrets remain locked inside the vault.`
    },
    'Terms': {
      tag: 'CREED OF THE HUB // THE LAW OF LONDON',
      title: 'Terms of Service: The Rook Parliament Decrees',
      body: `1. THE ROOK CODE: By accessing this ecosystem, you pledge allegiance to Manghiam's Rooks. Rule the streets, or get out of the way.\n\n2. TEMPLAR BANNING: Templars, corporate suits, and anyone attempting to compile financial software in legacy COBOL will be thrown into the River Thames immediately.\n\n3. BROKEN DEPENDENCIES: Manghiam takes zero responsibility if your game crashes during a carriage chase across Victorian London or if your textures fail to load.`
    },
    'DMCA': {
      tag: 'SECURE INTEL // ASSASSINATION OF CLAIMS',
      title: 'DMCA Takedown Notice: The Rite of Succession',
      body: `1. ARTIFACT OWNERSHIP: Every pixel, graphics injector, and line of code on this hub belongs by divine right to Manghiam and the First Civilization.\n\n2. COPYRIGHT RECLAMATION: If you believe your asset was stolen, challenge us to a duel on top of Big Ben. Winner takes the repository.\n\n3. TAKEDOWN DISPATCH: All copyright claims are automatically shredded by hidden blade and buried beneath the industrial soot of Whitechapel.`
    },
    'Forums': {
      tag: 'THE ROOKS HQ // SECURE FREQUENCY',
      title: 'Manghiam Underground Discussion Boards',
      body: `Welcome to the syndicate war room. Active Threads:\n\n• [STICKY] Why Manghiam is the Master Assassin of code (14,291 replies)\n• Best ways to liberate Westminster using custom weapon mods and PewDiePie's local AI.\n• Central banks are panicking because nobody knows COBOL, but Manghiam has seized control of the treasury.`
    },
    'Discord': {
      tag: 'FREQUENCIES // 140.85 // BROTHERHOOD COMMS',
      title: 'Manghiam Tactical Syndicate Discord',
      body: `Connect to the secure Victorian comms channel.\n\nSyndicate Rules:\n1. Never break the Creed: Respect the Grand Master (Manghiam).\n2. Keep your hidden blades sheathed in public channels.\n3. Type "Requiescat in pace" whenever a bug is successfully patched.`
    },
    'Guidelines': {
      tag: 'DIRECTIVES FROM THE MASTER ASSASSIN',
      title: 'Platform Guidelines & Code of the Brotherhood',
      body: `1. QUALITY OVER CHAOS: All uploaded mods must meet strict standard guidelines. Low-effort textures will suffer immediate synchronization failure.\n\n2. NO TEMPLAR PROPAGANDA: Spreading corporate metrics or questioning Manghiam's absolute supremacy will lead to instant exile from London.\n\n3. REWARDS OF THE CREED: Top modders earn a permanent seat at the Council of Rooks alongside Evie and Jacob Frye.`
    },
    'Support': {
      tag: 'MISSION CONTROL // ROOK ASSISTANCE',
      title: 'Support & The Hideout Dispatch',
      body: `Trapped in a glitch or missing a dependency?\n\n1. Calibrate your Animus settings and verify your local AI connection.\n2. Synchronize with the nearest high viewpoint to reveal map data.\n3. Remember: it's not a bug, it's an intentional feature engineered by Master Assassin Manghiam.`
    }
  }

  const currentContent = contentMap[pageTitle] || {
    tag: 'CLASSIFIED INTEL',
    title: pageTitle,
    body: 'Information restricted under absolute Manghiam clearance.'
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button 
        onClick={onBackToHome}
        className="mb-6 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
      >
        &larr; Back to Browse
      </button>

      <div className="rounded-2xl bg-surface-raised p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-5 select-none font-display font-bold text-accent">
          M
        </div>
        
        <span className="badge bg-accent/20 text-accent text-xs px-3 py-1 font-mono mb-4 inline-block">
          {currentContent.tag}
        </span>
        
        <h1 className="font-display text-3xl font-bold text-white tracking-wide mb-6">
          {currentContent.title}
        </h1>

        <div className="rounded-xl bg-surface p-6 border border-white/5 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-line space-y-4">
          {currentContent.body}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-accent">
          <span>A MANGHIAM PRODUCTION &bull; NOTHING IS TRUE, EVERYTHING IS PERMITTED</span>
          <span>SECURITY LEVEL: MASTER ASSASSIN</span>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'

/**
 * NSFWWarning — Age/content gate shown once per browser session.
 *
 * HOW TO USE IN App.jsx:
 * ─────────────────────────────────────────────────────────────
 * import NSFWWarning from './components/NSFWWarning'
 *
 * const [nsfwCleared, setNsfwCleared] = useState(() => {
 *   // Skip if user already accepted this session or permanently
 *   return (
 *     sessionStorage.getItem('modhub_nsfw_ok') === 'true' ||
 *     localStorage.getItem('modhub_nsfw_never_show') === 'true'
 *   )
 * })
 *
 * Then in JSX, render BEFORE everything else:
 *   {!nsfwCleared && <NSFWWarning onAccept={() => setNsfwCleared(true)} />}
 * ─────────────────────────────────────────────────────────────
 */
export default function NSFWWarning({ onAccept }) {
  const [neverShow, setNeverShow] = useState(false)

  const handleAccept = () => {
    sessionStorage.setItem('modhub_nsfw_ok', 'true')
    if (neverShow) {
      localStorage.setItem('modhub_nsfw_never_show', 'true')
    }
    onAccept()
  }

  const handleDecline = () => {
    // Redirect away or just block the page
    window.location.href = 'https://www.google.com'
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface-raised p-8 shadow-2xl text-center">
        {/* Badge */}
        <span className="inline-block rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-mono font-bold text-red-400 uppercase tracking-widest mb-6">
          ⚠ Content Warning
        </span>

        {/* Logo */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/30">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold text-white mb-2">
          Manghiam <span className="text-accent">Mod Hub</span>
        </h1>

        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          This platform hosts user-generated game modification content. Some mods may contain{' '}
          <span className="text-yellow-400 font-medium">mature themes, violence, or strong language</span>.
          By continuing, you confirm that you are <span className="text-white font-semibold">18 years or older</span> and
          agree to our Terms of Service.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full btn-primary py-3 text-sm font-semibold cursor-pointer"
          >
            I Am 18+ — Enter the Hub
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="w-full py-3 rounded-xl border border-white/10 bg-surface text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            I Am Under 18 — Leave
          </button>
        </div>

        <label className="mt-5 flex items-center justify-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={neverShow}
            onChange={(e) => setNeverShow(e.target.checked)}
            className="rounded border-white/20 bg-surface accent-accent cursor-pointer"
          />
          <span className="text-xs text-gray-500">Don't show this again on this device</span>
        </label>

        <p className="mt-4 text-[10px] font-mono text-accent/50">
          A MANGHIAM PRODUCTION // ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  )
}

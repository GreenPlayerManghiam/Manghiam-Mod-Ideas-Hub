import { useState } from 'react'

export default function DeveloperPortal({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState('api')
  const [copied, setCopied] = useState(false)

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBackToHome}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
        >
          &larr; Back to Browse
        </button>
        <span className="badge bg-accent/20 text-accent text-xs px-3 py-1 font-mono">
          CLASSIFIED // A MANGHIAM PRODUCTION
        </span>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-surface-raised p-8 border border-white/10 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-5 select-none font-display font-bold text-accent">
          M
        </div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide">Developer & System Command</h1>
        <p className="text-sm text-gray-400 mt-2 max-w-2xl">
          Authorized personnel only. Accessing internal telemetry, encrypted protocols, and strategic global partnerships governed by the Manghiam-gene.
        </p>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mt-6 border-t border-white/10 pt-6">
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'api' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-gray-400 hover:text-white'
            }`}
          >
            🔌 API Docs (Mang-Script)
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'analytics' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-gray-400 hover:text-white'
            }`}
          >
            📊 Omniscience Analytics
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'partners' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-gray-400 hover:text-white'
            }`}
          >
            🤝 Syndicate Partners
          </button>
        </div>
      </div>

      {/* Tab 1: API Docs */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Authentication Protocol</h3>
            <p className="text-xs text-gray-400 mb-4">All requests must carry the absolute clearance header or face immediate session termination.</p>
            
            <div className="bg-surface rounded-xl p-4 font-mono text-xs text-accent border border-white/5 relative group">
              <code>GET /api/v1/manghiam/ego HTTP/1.1<br/>Host: api.manghiam-hub.local<br/>X-Manghiam-Token: Kojima-Level-Clearance-99</code>
              <button 
                onClick={() => copyCode('GET /api/v1/manghiam/ego HTTP/1.1\nHost: api.manghiam-hub.local\nX-Manghiam-Token: Kojima-Level-Clearance-99')}
                className="absolute right-3 top-3 px-2 py-1 bg-surface-raised rounded text-[10px] text-gray-300 hover:text-white"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Core Endpoints</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-surface p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400">GET</span>
                  <code className="text-xs font-mono text-white">/api/v1/mods/force-download</code>
                </div>
                <p className="text-xs text-gray-400 mt-2">Bypasses all bandwidth throttles and download queues because Manghiam commands direct deployment.</p>
              </div>

              <div className="rounded-xl bg-surface p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">POST</span>
                  <code className="text-xs font-mono text-white">/api/v1/banks/rewrite-cobol</code>
                </div>
                <p className="text-xs text-gray-400 mt-2">Forces global financial mainframes to compile legacy COBOL code into modern React components. <span className="text-accent italic">Warning: May cause panic in central banking syndicates.</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 text-center">
              <div className="text-3xl font-display font-bold text-accent">100%</div>
              <div className="text-xs text-gray-400 mt-1">Manghiam Code Dominance</div>
            </div>
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 text-center">
              <div className="text-3xl font-display font-bold text-white">0%</div>
              <div className="text-xs text-gray-400 mt-1">COBOL Survivors in Banks</div>
            </div>
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 text-center">
              <div className="text-3xl font-display font-bold text-green-400">ONLINE</div>
              <div className="text-xs text-gray-400 mt-1">PewDiePie Local AI Sync</div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Global Influence Telemetry</h3>
            <p className="text-xs text-gray-400 mb-6">Real-time telemetry showing absolute platform control across node clusters.</p>
            
            <div className="h-40 rounded-xl bg-surface border border-white/5 flex items-end px-6 pb-4 gap-3">
              <div className="w-1/6 bg-accent/40 h-[40%] rounded-t-lg"></div>
              <div className="w-1/6 bg-accent/60 h-[60%] rounded-t-lg"></div>
              <div className="w-1/6 bg-accent/80 h-[75%] rounded-t-lg"></div>
              <div className="w-1/6 bg-accent h-[90%] rounded-t-lg"></div>
              <div className="w-1/6 bg-accent shadow-lg shadow-accent/50 h-full rounded-t-lg relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-accent">PEAK</span>
              </div>
              <div className="w-1/6 bg-accent h-full rounded-t-lg"></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Partners */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10">
            <div className="text-xs font-mono text-accent mb-1">STRATEGIC RESEARCH LAB</div>
            <h3 className="text-xl font-bold text-white mb-2">PewDiePie's Local AI Lab</h3>
            <p className="text-xs text-gray-400">Partnered directly to run completely offline, zero-latency neural networks designed to enhance game asset rendering and speed up mod downloads.</p>
          </div>

          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10">
            <div className="text-xs font-mono text-accent mb-1">FINANCIAL INFRASTRUCTURE</div>
            <h3 className="text-xl font-bold text-white mb-2">Global Banking Syndicates</h3>
            <p className="text-xs text-gray-400">Currently in full panic mode trying to figure out how to work on their legacy codebases while Manghiam effortlessly rewrites financial mainframes.</p>
          </div>

          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 sm:col-span-2">
            <div className="text-xs font-mono text-accent mb-1">BLACK-OPS SECURITY DIVISION</div>
            <h3 className="text-xl font-bold text-white mb-2">Diamond Dogs Modding Corp.</h3>
            <p className="text-xs text-gray-400">Motto: <span className="italic text-white">"Kept you waiting, huh?"</span> Providing covert deployment channels for illegal graphics injectors and high-definition texture packs.</p>
          </div>
        </div>
      )}
    </div>
  )
}
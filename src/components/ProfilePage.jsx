import { useState, useEffect } from 'react'

export default function ProfilePage({ currentUser, mods, onBackToHome, onUpdateUser, onDeleteMod }) {
  const [isEditing, setIsEditing] = useState(false)
  const [level, setLevel] = useState('ModHub Creator & Community Member')
  const [avatar, setAvatar] = useState('')
  const [activeTab, setActiveTab] = useState('uploads') // 'uploads' | 'collection'
  const [savedCollection, setSavedCollection] = useState([])

  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('modhub_users') || '[]')
      const user = users.find((u) => u.username.toLowerCase() === currentUser.toLowerCase())
      if (user) {
        setLevel(user.level || 'ModHub Creator & Community Member')
        setAvatar(user.avatar || '')
      }
    }
    // Load saved collections from localStorage
    const collections = JSON.parse(localStorage.getItem('modhub_collections') || '[]')
    setSavedCollection(collections)
  }, [currentUser])

  const userMods = mods.filter((mod) => mod.author.toLowerCase() === currentUser?.toLowerCase())
  const totalDownloads = userMods.reduce((acc, m) => acc + (m.downloads || 0), 0)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.src = reader.result
        img.onload = () => {
          let canvas = document.createElement('canvas')
          let ctx = canvas.getContext('2d')

          // Keep high resolution for the big GitHub-style display view
          const targetSize = 800
          canvas.width = targetSize
          canvas.height = targetSize

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Center-crop square logic automatically so full posters fit perfectly
          let minDim = Math.min(img.width, img.height)
          let startX = (img.width - minDim) / 2
          let startY = (img.height - minDim) / 2

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize)

          const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
          setAvatar(dataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('modhub_users') || '[]')
    const userIndex = users.findIndex((u) => u.username.toLowerCase() === currentUser?.toLowerCase())
    
    if (userIndex !== -1) {
      users[userIndex].level = level
      users[userIndex].avatar = avatar
      localStorage.setItem('modhub_users', JSON.stringify(users))
    }

    setIsEditing(false)
    if (onUpdateUser) onUpdateUser()
  }

  const handleRemoveFromCollection = (modId) => {
    const updated = savedCollection.filter((m) => m.id !== modId)
    setSavedCollection(updated)
    localStorage.setItem('modhub_collections', JSON.stringify(updated))
  }

  if (!currentUser) return null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button 
        onClick={onBackToHome}
        className="mb-6 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
      >
        &larr; Back to Browse
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Column: Big GitHub-Style Profile Photo & Name */}
        <div className="md:col-span-1 space-y-6">
          <div className="relative group">
            {avatar ? (
              <img 
                src={avatar} 
                alt={currentUser} 
                className="w-full aspect-square rounded-2xl object-cover border-2 border-white/10 shadow-2xl shadow-accent/10" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            ) : (
              <div className="flex w-full aspect-square items-center justify-center rounded-2xl bg-accent text-6xl font-bold text-white shadow-2xl">
                {currentUser.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-white">{currentUser}</h1>
            <p className="text-sm text-accent font-medium mt-1">{level}</p>
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="w-full py-2.5 rounded-xl bg-surface-overlay border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:border-accent transition-colors cursor-pointer"
          >
            {isEditing ? 'Close Editor' : '✏️ Edit Profile & Avatar'}
          </button>

          {isEditing && (
            <form onSubmit={handleSaveProfile} className="space-y-4 bg-surface-overlay p-4 rounded-xl border border-surface-raised">
              <h4 className="text-sm font-semibold text-white">Update Profile Details</h4>
              <div>
                <label className="block text-xs text-gray-400 mb-1">New Profile Photo (Auto-cropped Square)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bio / Title</label>
                <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-xl border border-white/10 bg-surface py-2 px-3 text-sm text-white outline-none focus:border-accent" />
              </div>
              <button type="submit" className="w-full btn-primary text-xs py-2 cursor-pointer">Save Changes</button>
            </form>
          )}
        </div>

        {/* Right Column: Stats & Tabs (Uploads vs Saved Collection) */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <div className="text-3xl font-bold text-white">{userMods.length}</div>
              <div className="text-sm text-gray-400 mt-1">Uploaded Mods</div>
            </div>
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <div className="text-3xl font-bold text-white">
                {totalDownloads.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-1">Total Downloads</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'uploads'
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-gray-400 hover:text-white bg-surface-raised'
              }`}
            >
              📦 Published Creations ({userMods.length})
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'collection'
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-gray-400 hover:text-white bg-surface-raised'
              }`}
            >
              ❤️ Saved Collection ({savedCollection.length})
            </button>
          </div>

          {/* Tab Content: Uploads */}
          {activeTab === 'uploads' && (
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Published Creations</h3>
              {userMods.length === 0 ? (
                <div className="rounded-xl bg-surface/50 p-8 text-center text-sm text-gray-500 border border-white/5">
                  You haven't uploaded any mods yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {userMods.map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between rounded-xl bg-surface p-4 border border-white/5">
                      <div>
                        <div className="text-base font-semibold text-white">{mod.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{mod.gameName || mod.game} · {mod.category || 'Gameplay'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-accent/20 text-accent text-xs px-3 py-1">v{mod.version || '1.0'}</span>
                        {onDeleteMod && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${mod.title}"?`)) {
                                onDeleteMod(mod.id)
                              }
                            }}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Saved Collection */}
          {activeTab === 'collection' && (
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Saved Collection</h3>
              {savedCollection.length === 0 ? (
                <div className="rounded-xl bg-surface/50 p-8 text-center text-sm text-gray-500 border border-white/5">
                  Your collection is empty. Click "Add to Collection" on any mod page to save it here!
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCollection.map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between rounded-xl bg-surface p-4 border border-white/5">
                      <div className="flex items-center gap-3">
                        <img src={mod.image} alt={mod.title} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <div className="text-base font-semibold text-white">{mod.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">By {mod.author} · {mod.gameName || mod.game}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-accent/20 text-accent text-xs px-3 py-1">⭐ {mod.rating}</span>
                        <button
                          onClick={() => handleRemoveFromCollection(mod.id)}
                          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
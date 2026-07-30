import { useState, useEffect } from 'react'
import {
  supabase,
  uploadAvatarImage,
  getAvatarUrl,
  updateProfile,
} from '../lib/supabaseApi'

export default function ProfilePage({ currentUser, mods = [], onBackToHome, onUpdateUser, onDeleteMod }) {
  const [isEditing, setIsEditing] = useState(false)
  const [level, setLevel] = useState('Apex Founder & Grand Architect')
  const [avatar, setAvatar] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('uploads') // 'uploads' | 'collection'
  const [savedCollection, setSavedCollection] = useState([])

  const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'

  const usernameStr = currentUser?.username ||
    (typeof currentUser === 'string' ? currentUser : currentUser?.user_metadata?.username) ||
    currentUser?.email?.split('@')[0] ||
    'User'

  const usernameLower = usernameStr.toLowerCase()
  const userId = currentUser?.id || ''
  const userEmail = currentUser?.email || ''

  // 🦅 Apex Founder & Elite Moderator Permission Matrix
  const APEX_EMAIL = 'manghiamknongsiej@gmail.com'
  const APEX_USERNAME = 'manghiam'
  const AUTHORIZED_MODERATORS = ['manghiam', 'admin', 'manghiamknongsiej']

  const isApexFounder = (() => {
    if (!currentUser) return false
    return (
      userEmail.toLowerCase() === APEX_EMAIL.toLowerCase() ||
      usernameLower === APEX_USERNAME.toLowerCase() ||
      currentUser?.is_admin ||
      currentUser?.role === 'admin'
    )
  })()

  const isModeratorOrApex = (() => {
    if (!currentUser) return false
    return (
      isApexFounder ||
      AUTHORIZED_MODERATORS.includes(usernameLower) ||
      currentUser?.role === 'moderator'
    )
  })()

  useEffect(() => {
    async function loadUserData() {
      if (currentUser) {
        if (userId) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()

            if (!error && profileData) {
              if (profileData.level) setLevel(profileData.level)
              if (profileData.avatar_url) {
                setAvatar(profileData.avatar_url)
                return
              }
            }
          } catch (err) {
            console.error('Error loading profile from Supabase:', err)
          }
        }

        if (currentUser?.avatar) {
          setAvatar(currentUser.avatar)
          return
        }

        const users = JSON.parse(localStorage.getItem('modhub_users') || '[]')
        const user = users.find((u) => String(u.username || '').toLowerCase() === usernameLower)

        if (user) {
          setLevel(user.level || 'Elite Moderator')
          setAvatar(user.avatar || currentUser?.user_metadata?.avatar_url || '')
        } else if (currentUser?.user_metadata?.avatar_url) {
          setAvatar(currentUser.user_metadata.avatar_url)
        }
      }
    }
    loadUserData()

    const collections = JSON.parse(localStorage.getItem('modhub_collections') || '[]')
    setSavedCollection(collections)
  }, [currentUser, usernameLower, userId])

  // Apex Founders & Moderators can see all mods for complete platform oversight
  const userMods = mods.filter((mod) => {
    if (!mod) return false
    if (isModeratorOrApex) return true 

    const matchId = userId && (mod.user_id === userId || mod.owner_id === userId)
    const matchAuthor = String(mod.author || '').toLowerCase() === usernameLower
    const matchEmail = currentUser?.email && String(mod.email || '').toLowerCase() === currentUser.email.toLowerCase()
    return matchId || matchAuthor || matchEmail
  })

  const totalDownloads = userMods.reduce((acc, m) => acc + (Number(m.downloads) || 0), 0)

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

          const targetSize = 800
          canvas.width = targetSize
          canvas.height = targetSize

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          let minDim = Math.min(img.width, img.height)
          let startX = (img.width - minDim) / 2
          let startY = (img.height - minDim) / 2

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name || 'avatar.jpg', { type: 'image/jpeg' })
                setSelectedFile(processedFile)
                setAvatar(canvas.toDataURL('image/jpeg', 0.95))
              }
            },
            'image/jpeg',
            0.95
          )
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let finalAvatarUrl = avatar

      if (selectedFile && userId) {
        const fileExt = (selectedFile.name.split('.').pop() || 'jpg').toLowerCase()
        const storagePath = `${userId}/avatar-${Date.now()}.${fileExt}`

        const { error: uploadErr } = await uploadAvatarImage(storagePath, selectedFile)
        if (uploadErr) {
          console.error("Avatar storage upload failed:", uploadErr.message)
          alert("Storage upload failed: " + uploadErr.message)
        } else {
          finalAvatarUrl = getAvatarUrl(storagePath)
          setAvatar(finalAvatarUrl)
        }
      }

      if (userId) {
        const { error: updateErr } = await updateProfile(userId, {
          avatar_url: finalAvatarUrl,
          level: level,
          username: usernameStr,
        })
        if (updateErr) {
          console.error("Profile database sync error:", updateErr.message)
          alert("Profile save failed: " + updateErr.message)
          return
        }
      }

      const users = JSON.parse(localStorage.getItem('modhub_users') || '[]')
      const userIndex = users.findIndex((u) => String(u.username || '').toLowerCase() === usernameLower)

      if (userIndex !== -1) {
        users[userIndex].level = level
        users[userIndex].avatar = finalAvatarUrl
        localStorage.setItem('modhub_users', JSON.stringify(users))
      }

      setSelectedFile(null)
      setIsEditing(false)

      if (onUpdateUser) onUpdateUser()
    } catch (err) {
      console.error("Error updating profile:", err)
      alert("Unexpected error saving profile. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFromCollection = (modId) => {
    const updated = savedCollection.filter((m) => m.id !== modId)
    setSavedCollection(updated)
    localStorage.setItem('modhub_collections', JSON.stringify(updated))
  }

  // 🦅 Apex Feature Toggle for Mods
  const handleToggleFeature = async (modId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('mods')
        .update({ featured: !currentStatus })
        .eq('id', modId)

      if (error) {
        alert('Failed to update feature status: ' + error.message)
      } else {
        alert(`Successfully ${!currentStatus ? 'Featured' : 'Unfeatured'} this mod! Refreshing...`)
        window.location.reload()
      }
    } catch (err) {
      console.error('Error toggling feature status:', err)
    }
  }

  // 📦 Independent Archive Toggle for Moderators / Apex
  const handleToggleArchive = async (modId, currentArchivedStatus) => {
    try {
      const { error } = await supabase
        .from('mods')
        .update({ is_archived: !currentArchivedStatus })
        .eq('id', modId)

      if (error) {
        alert('Failed to update archive status: ' + error.message)
      } else {
        alert(`Mod has been successfully ${!currentArchivedStatus ? 'archived' : 'restored'}.`)
        window.location.reload()
      }
    } catch (err) {
      console.error('Error toggling archive status:', err)
    }
  }

  // 🦅 Apex Create New Game Option
  const handleCreateGamePrompt = async () => {
    const gameName = window.prompt("Enter new game title to add to the platform:")
    if (!gameName) return
    const gameSlug = gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    try {
      const { error } = await supabase
        .from('games')
        .insert([{ id: gameSlug, name: gameName, cover: PLACEHOLDER_COVER }])

      if (error) {
        alert('Error creating game: ' + error.message)
      } else {
        alert(`Game "${gameName}" created successfully!`)
        window.location.reload()
      }
    } catch (err) {
      console.error('Error creating game:', err)
    }
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

      {/* 🦅 Apex Founder Control Hub Header */}
      {isApexFounder && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-950/50 via-zinc-900 to-surface-raised border border-red-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦅</span>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Apex Founder Oversight Active</h4>
              <p className="text-xs text-red-300">Absolute authority unlocked for {userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateGamePrompt}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              🎮 + Create New Game
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Column: Big Profile Photo & Name */}
        <div className="md:col-span-1 space-y-6">
          <div className="relative group">
            {avatar ? (
              <img
                src={avatar}
                alt={usernameStr}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
                className="w-full aspect-square rounded-2xl object-cover border-2 border-white/10 shadow-2xl shadow-accent/10"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            ) : (
              <div className="flex w-full aspect-square items-center justify-center rounded-2xl bg-accent text-6xl font-bold text-white shadow-2xl">
                {usernameStr.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-white">{usernameStr}</h1>
            <p className="text-sm text-accent font-medium mt-1">{level}</p>
            {isApexFounder ? (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-semibold uppercase tracking-wider border border-red-500/30">
                🦅 Apex Founder
              </span>
            ) : isModeratorOrApex && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-semibold uppercase tracking-wider border border-purple-500/30">
                🛡️ Elite Moderator
              </span>
            )}
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
              <button
                type="submit"
                disabled={isUploading}
                className="w-full btn-primary text-xs py-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? 'Saving to Database...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Stats & Tabs */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <div className="text-3xl font-bold text-white">{userMods.length}</div>
              <div className="text-sm text-gray-400 mt-1">{isModeratorOrApex ? 'Global Oversight Mods' : 'Uploaded Mods'}</div>
            </div>
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <div className="text-3xl font-bold text-white">
                {totalDownloads.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-1">Total Downloads</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3 flex-wrap">
            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'uploads'
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-gray-400 hover:text-white bg-surface-raised'
              }`}
            >
              📦 {isModeratorOrApex ? 'Global Elite Moderation' : 'Published Creations'} ({userMods.length})
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

          {/* Tab Content: Uploads / Moderation Panel */}
          {activeTab === 'uploads' && (
            <div className="rounded-2xl bg-surface-raised p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {isModeratorOrApex ? '🛡️ Elite Content Management & Moderation' : 'Published Creations'}
                </h3>
              </div>

              {userMods.length === 0 ? (
                <div className="rounded-xl bg-surface/50 p-8 text-center text-sm text-gray-500 border border-white/5">
                  No items found.
                </div>
              ) : (
                <div className="space-y-3">
                  {userMods.map((mod) => (
                    <div key={mod.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-surface p-4 border border-white/5">
                      <div>
                        <div className="text-base font-semibold text-white flex items-center gap-2 flex-wrap">
                          {mod.title}
                          {isModeratorOrApex && (
                            <span className="text-[10px] text-gray-400 font-mono font-normal">
                              (Author: {mod.author && mod.author !== 'Unknown' ? mod.author : usernameStr})
                            </span>
                          )}
                          {mod.featured && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              FEATURED
                            </span>
                          )}
                          {mod.is_archived && (
                            <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-300 text-[10px] font-bold">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{mod.gameName || mod.game} · {mod.category || 'Gameplay'}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                        <span className="badge bg-accent/20 text-accent text-xs px-3 py-1">v{mod.version || '1.0'}</span>
                        
                        {/* Feature Toggle */}
                        {isModeratorOrApex && (
                          <button
                            onClick={() => handleToggleFeature(mod.id, mod.featured)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
                          >
                            {mod.featured ? '⭐ Unfeature' : '⭐ Feature'}
                          </button>
                        )}

                        {/* Separate Archive Toggle Button */}
                        {isModeratorOrApex && (
                          <button
                            onClick={() => handleToggleArchive(mod.id, mod.is_archived)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 transition-colors cursor-pointer border border-zinc-500/20"
                          >
                            {mod.is_archived ? '📂 Restore' : '📦 Archive'}
                          </button>
                        )}

                        {/* Clean Permanent Delete Button */}
                        {onDeleteMod && (
                          <button
                            onClick={() => {
                              if (isModeratorOrApex) {
                                const confirmText = window.prompt(
                                  `🦅 [APEX / ELITE OVERRIDE]\nYou are about to PERMANENTLY delete "${mod.title}". Type "DELETE" to confirm:`
                                )
                                if (confirmText === "DELETE") {
                                  onDeleteMod(mod.id)
                                } else if (confirmText !== null) {
                                  alert("Action cancelled. You must type 'DELETE' in exact uppercase letters.")
                                }
                              } else {
                                if (window.confirm(`Are you sure you want to delete "${mod.title}"?`)) {
                                  onDeleteMod(mod.id)
                                }
                              }
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                              isModeratorOrApex 
                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' 
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            🗑️ Delete
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
                  {savedCollection.map((mod) => {
                    const modImg = mod.cover_image || mod.image || (Array.isArray(mod.images) ? mod.images[0] : null) || PLACEHOLDER_COVER

                    return (
                      <div key={mod.id} className="flex items-center justify-between rounded-xl bg-surface p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                          <img
                            src={modImg}
                            alt={mod.title || 'Mod'}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = PLACEHOLDER_COVER
                            }}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <div className="text-base font-semibold text-white">{mod.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5">By {mod.author && mod.author !== 'Unknown' ? mod.author : 'Creator'} · {mod.gameName || mod.game || 'Game'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="badge bg-accent/20 text-accent text-xs px-3 py-1">⭐ {mod.rating || 'N/A'}</span>
                          <button
                            onClick={() => handleRemoveFromCollection(mod.id)}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
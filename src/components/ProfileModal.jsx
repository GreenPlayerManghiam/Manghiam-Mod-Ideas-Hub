import { useState, useEffect } from 'react'
import {
  supabase,
  uploadAvatarImage,
  getAvatarUrl,
  updateProfile,
} from '../lib/supabaseApi'

export default function ProfileModal({ isOpen, onClose, currentUser, mods, onSignOut, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [level, setLevel] = useState('ModHub Creator & Community Member')
  const [avatar, setAvatar] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const userId = currentUser?.id || ''
  const usernameStr = currentUser?.username || currentUser?.email?.split('@')[0] || (typeof currentUser === 'string' ? currentUser : 'User')

  useEffect(() => {
    async function loadProfileData() {
      if (!currentUser || !isOpen) return

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
          console.error('Error fetching profile from Supabase:', err)
        }
      }

      // Fallback to user metadata if available
      if (currentUser?.user_metadata?.avatar_url) {
        setAvatar(currentUser.user_metadata.avatar_url)
      }
    }

    loadProfileData()
  }, [currentUser, isOpen, userId])

  if (!isOpen || !currentUser) return null

  // Filter mods uploaded by this specific user using UUID or author matching
  const userMods = mods.filter((mod) => {
    if (!mod) return false
    return (
      (userId && (mod.user_id === userId || mod.owner_id === userId || mod.author_id === userId)) ||
      String(mod.author || '').toLowerCase() === usernameStr.toLowerCase()
    )
  })

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

          const targetSize = 400
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

      setSelectedFile(null)
      setIsEditing(false)
      if (onUpdateUser) onUpdateUser()
      alert("Profile updated successfully in Supabase!")
    } catch (err) {
      console.error("Error saving profile:", err)
      alert("Unexpected error saving profile.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="card relative w-full max-w-lg p-6 bg-surface-raised border border-white/10 shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img 
                src={avatar} 
                alt={usernameStr} 
                className="h-20 w-20 rounded-full object-cover border-2 border-accent shadow-xl shrink-0" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl font-bold text-white shadow-xl shrink-0">
                {usernameStr.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-display text-2xl font-bold text-white">{usernameStr}</h3>
              <p className="text-xs text-accent font-medium mt-0.5">{level}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-xl cursor-pointer self-start"
          >
            &times;
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 mb-6 bg-surface-overlay p-4 rounded-xl border border-surface-raised">
            <h4 className="text-sm font-semibold text-white">Edit Your Profile</h4>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Profile Picture (High Quality)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80 cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Custom Level / Bio Title</label>
              <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-xl border border-white/10 bg-surface py-2 px-3 text-sm text-white outline-none focus:border-accent" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isUploading} className="btn-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-50">
                {isUploading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsEditing(true)} className="w-full mb-6 py-2 rounded-xl bg-surface-overlay border border-surface-raised text-xs font-semibold text-gray-300 hover:text-white hover:border-accent transition-colors cursor-pointer">
            ✏️ Edit Profile & Avatar
          </button>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl bg-surface-overlay p-4 border border-surface-raised text-center">
            <div className="text-2xl font-bold text-white">{userMods.length}</div>
            <div className="text-xs text-gray-400 mt-1">Uploaded Mods</div>
          </div>
          <div className="rounded-xl bg-surface-overlay p-4 border border-surface-raised text-center">
            <div className="text-2xl font-bold text-white">
              {userMods.reduce((acc, m) => acc + (m.downloads || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total Downloads</div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Your Published Creations</h4>
          {userMods.length === 0 ? (
            <div className="rounded-xl bg-surface-overlay p-4 text-center text-sm text-gray-500 border border-surface-raised">
              You haven't uploaded any mods yet. Click "Upload Mod" to get started!
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {userMods.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between rounded-xl bg-surface-overlay p-3 border border-surface-raised">
                  <div>
                    <div className="text-sm font-medium text-white">{mod.title}</div>
                    <div className="text-xs text-gray-400">{mod.gameName || mod.game} · {mod.category}</div>
                  </div>
                  <span className="badge bg-accent/20 text-accent text-xs">v{mod.version}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/10">
          <button 
            type="button"
            onClick={() => {
              onSignOut()
              onClose()
            }}
            className="w-full rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  )
}
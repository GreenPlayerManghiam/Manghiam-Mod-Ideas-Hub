import { useState, useEffect } from 'react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Automatically ensure the Founder account always exists in local storage
  useEffect(() => {
    if (isOpen) {
      const registeredUsers = JSON.parse(localStorage.getItem('modhub_users') || '[]')
      const founderExists = registeredUsers.find(u => u.username.toLowerCase() === 'manghiam')
      
      if (!founderExists) {
        const founderAccount = {
          username: 'Manghiam',
          password: 'Greenplayer1',
          avatar: '',
          level: '👑 Founder & God Mod Admin',
          role: 'founder'
        }
        registeredUsers.push(founderAccount)
        localStorage.setItem('modhub_users', JSON.stringify(registeredUsers))
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setNewPassword('')
    setError('')
    setSuccessMsg('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const trimmedUser = username.trim()
    if (!trimmedUser) {
      setError('Please enter a username.')
      return
    }

    const registeredUsers = JSON.parse(localStorage.getItem('modhub_users') || '[]')

    if (mode === 'signup') {
      if (!password) {
        setError('Please enter a password.')
        return
      }

      // Prevent regular users from overwriting the Founder username
      if (trimmedUser.toLowerCase() === 'manghiam') {
        setError('This username is reserved for the Founder. Please sign in instead.')
        return
      }

      const existing = registeredUsers.find((u) => u.username.toLowerCase() === trimmedUser.toLowerCase())
      if (existing) {
        setError('Username is already taken. Try signing in instead.')
        return
      }

      const newUser = { 
        username: trimmedUser, 
        password,
        avatar: '',
        level: 'ModHub Creator & Community Member',
        role: 'user'
      }
      registeredUsers.push(newUser)
      localStorage.setItem('modhub_users', JSON.stringify(registeredUsers))
      localStorage.setItem('modhub_current_user', trimmedUser)
      
      if (onAuthSuccess) onAuthSuccess(trimmedUser)
      resetForm()
      onClose()

    } else if (mode === 'signin') {
      if (!password) {
        setError('Please enter your password.')
        return
      }

      // God Mode Founder Bypass check
      const isFounderAttempt = trimmedUser.toLowerCase() === 'manghiam'
      
      const found = registeredUsers.find(
        (u) => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === password
      )

      if (!found && !isFounderAttempt) {
        setError('Incorrect username or password. Please check your details.')
        return
      }

      // If logging in as Manghiam with correct password or fallback override
      const activeUser = found || { username: 'Manghiam', role: 'founder' }
      
      // Ensure role is updated to founder if it's Manghiam
      if (activeUser.username.toLowerCase() === 'manghiam') {
        activeUser.role = 'founder'
        activeUser.level = '👑 Founder & God Mod Admin'
      }

      localStorage.setItem('modhub_current_user', activeUser.username)
      
      if (onAuthSuccess) onAuthSuccess(activeUser.username)
      resetForm()
      onClose()

    } else if (mode === 'forgot') {
      if (!newPassword) {
        setError('Please enter a new password.')
        return
      }
      const userIndex = registeredUsers.findIndex((u) => u.username.toLowerCase() === trimmedUser.toLowerCase())
      
      if (userIndex === -1) {
        setError('Username not found in the local database.')
        return
      }

      // Update password for existing user
      registeredUsers[userIndex].password = newPassword
      localStorage.setItem('modhub_users', JSON.stringify(registeredUsers))
      
      setSuccessMsg('Password reset successfully! You can now sign in.')
      setTimeout(() => {
        setMode('signin')
        setSuccessMsg('')
        setPassword('')
        setNewPassword('')
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card relative w-full max-w-md p-6 bg-surface-raised border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-white">
            {mode === 'signup' && 'Create ModHub Account'}
            {mode === 'signin' && 'Sign In to ModHub'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <button onClick={() => { resetForm(); onClose(); }} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. PixelGamer99" 
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent" 
            />
          </div>

          {mode !== 'forgot' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-gray-400">Password</label>
                {mode === 'signin' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setError(''); }} 
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent" 
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input 
                type="password" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password" 
                className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent" 
              />
            </div>
          )}

          <button type="submit" className="w-full btn-primary py-3 mt-2 cursor-pointer">
            {mode === 'signup' && 'Sign Up & Join'}
            {mode === 'signin' && 'Sign In'}
            {mode === 'forgot' && 'Update Password'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-400">
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('signin'); resetForm(); }} className="text-accent hover:underline font-medium ml-1 cursor-pointer">
                Sign In
              </button>
            </>
          )}
          {mode === 'signin' && (
            <>
              Don't have an account yet?{' '}
              <button type="button" onClick={() => { setMode('signup'); resetForm(); }} className="text-accent hover:underline font-medium ml-1 cursor-pointer">
                Create one
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <button type="button" onClick={() => { setMode('signin'); resetForm(); }} className="text-accent hover:underline font-medium cursor-pointer">
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
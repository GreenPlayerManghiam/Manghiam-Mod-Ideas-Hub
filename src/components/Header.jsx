export default function Header({ currentUser, onSignInClick, onProfileClick, onUploadClick, onLogout }) {
  // Extract display string safely from Supabase User Object or string fallback
  const usernameStr = typeof currentUser === 'string' 
    ? currentUser 
    : currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || ''

  const usernameLower = usernameStr.toLowerCase()

  let userAvatar = currentUser?.user_metadata?.avatar_url || ''
  let userRole = ''

  if (currentUser) {
    const users = JSON.parse(localStorage.getItem('modhub_users') || '[]')
    const user = users.find((u) => String(u.username || '').toLowerCase() === usernameLower)
    
    if (user) {
      if (!userAvatar) userAvatar = user.avatar || ''
      userRole = user.role || (usernameLower === 'manghiam' ? 'founder' : 'user')
    } else if (usernameLower === 'manghiam') {
      userRole = 'founder'
    }
  }

  const handleLogoutClick = () => {
    localStorage.removeItem('modhub_current_user')
    if (onLogout) {
      onLogout()
    } else {
      window.location.reload()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-lg shadow-accent/30 transition-transform group-hover:scale-105">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-wide text-white flex items-center gap-1.5">
              Manghiam <span className="text-accent">Mod Hub</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-accent uppercase">
              // A Manghiam Production
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex font-mono text-xs">
          {['Browse', 'Featured', 'Games'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-medium text-gray-400 transition-colors hover:text-white uppercase tracking-wider"
            >
              {item}
            </a>
          ))}
          <button
            type="button"
            onClick={onUploadClick}
            className="font-medium text-gray-400 transition-colors hover:text-white uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            Post Idea
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={onProfileClick}
                className="flex items-center gap-2.5 rounded-full bg-surface-overlay border border-white/10 px-3.5 py-1.5 hover:border-accent transition-colors cursor-pointer"
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={usernameStr} 
                    className="h-9 w-9 rounded-full object-cover border-2 border-accent shadow-md shrink-0" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-md shrink-0">
                    {usernameStr.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
                <span className="text-sm font-medium text-white pr-1 flex items-center gap-1.5">
                  {userRole === 'founder' && <span className="text-xs">👑</span>}
                  {usernameStr}
                </span>
              </button>

              <button 
                type="button"
                onClick={handleLogoutClick}
                className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                title="Log out of account"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={onSignInClick}
              className="btn-secondary hidden px-4 py-2 sm:inline-flex cursor-pointer text-xs uppercase font-mono tracking-wider"
            >
              Sign In
            </button>
          )}

          <button 
            type="button" 
            onClick={onUploadClick}
            className="btn-primary px-4 py-2 cursor-pointer text-xs uppercase font-mono tracking-wider"
          >
            + Post Idea
          </button>
        </div>
      </div>
    </header>
  )
}
import { useMemo, useState, useRef, useEffect } from 'react'
import {
  getMods,
  getGames,
  getCurrentUser,
  onAuthStateChange,
  signOut,
  supabase,
} from './lib/supabaseApi'

import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedMods from './components/FeaturedMods'
import GameCategories from './components/GameCategories'
import SearchBar from './components/SearchBar'
import ModGrid from './components/ModGrid'
import ModDetail from './components/ModDetail'
import ModPage from './components/ModPage'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import UploadModal from './components/UploadModal'
import ProfilePage from './components/ProfilePage'
import DeveloperPortal from './components/DeveloperPortal'
import InfoPage from './components/InfoPage'
import NSFWWarning from './components/NSFWWarning' // ✅ NSFW Age/Content Gate Component
import NortheastFireflies from './components/NortheastFireflies' // ✅ NightEarth tactical map background
import CursorTrail from './components/CursorTrail' // ✅ Fluid mouse-following ribbon trail
import ModeratorPanel from './components/ModeratorPanel' // ✅ Moderators assemble component

export default function App() {
  const [modsList, setModsList] = useState([])
  const [gamesList, setGamesList] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // NSFW Cleared State Check
  const [nsfwCleared, setNsfwCleared] = useState(() => {
    return (
      sessionStorage.getItem('modhub_nsfw_ok') === 'true' ||
      localStorage.getItem('modhub_nsfw_never_show') === 'true'
    )
  })

  // Modal preview state vs Full Page state
  const [selectedMod, setSelectedMod] = useState(null)
  const [activeModId, setActiveModId] = useState(null)

  const [currentView, setCurrentView] = useState('home') // 'home', 'profile', 'developers', 'moderator', 'info', 'mod-detail', 'featured', 'games'
  const [activeInfoPage, setActiveInfoPage] = useState('Privacy')

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Ref to the browse section for smooth scrolling
  const browseRef = useRef(null)

  // Helper to fetch profile row and build merged user object
  const fetchMergedUser = async (authUser) => {
    if (!authUser) {
      setCurrentUser(null)
      return
    }
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setCurrentUser({
        id: authUser.id,
        email: authUser.email,
        username: profileData?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Modder',
        avatar: profileData?.avatar_url || authUser.user_metadata?.avatar_url || null,
        level: profileData?.level || 'Community Modder',
        ...(profileData || {}),
      })
    } catch (err) {
      console.error('Failed to fetch profile row:', err)
      setCurrentUser({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Modder',
        avatar: authUser.user_metadata?.avatar_url || null,
      })
    }
  }

  // 1. Fetch initial data from Supabase on mount
  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        const user = await getCurrentUser()
        await fetchMergedUser(user)

        const [{ data: modsData }, { data: gamesData }] = await Promise.all([
          getMods(),
          getGames(),
        ])

        if (modsData) setModsList(modsData)
        if (gamesData) setGamesList(gamesData)
      } catch (err) {
        console.error('Failed to initialize Supabase data:', err)
      } finally {
        setLoading(false)
      }
    }

    initData()

    // 2. Subscribe to real-time auth state updates
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      await fetchMergedUser(session?.user || null)
    })

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const scrollToBrowse = () => {
    browseRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 🛡️ Global View Navigation Handler (Ensures Browse, Featured, Games work from anywhere)
  const handleNavigateView = (viewName) => {
    setCurrentView('home')
    if (viewName === 'browse') {
      setTimeout(() => scrollToBrowse(), 50)
    } else if (viewName === 'featured') {
      window.scrollTo({ top: 400, behavior: 'smooth' })
    } else if (viewName === 'games') {
      window.scrollTo({ top: 900, behavior: 'smooth' })
    }
  }

  const handleAuthSuccess = async (user) => {
    await fetchMergedUser(user)
    setIsAuthOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
    localStorage.removeItem('modhub_current_user')
    setCurrentView('home')
  }

  const handleUserUpdated = async () => {
    const authUser = await getCurrentUser()
    await fetchMergedUser(authUser)
  }

  const featuredMods = useMemo(() => modsList.filter((m) => m.featured), [modsList])

  const filteredMods = useMemo(() => {
    const q = query.toLowerCase().trim()
    return modsList.filter((mod) => {
      const isAllGames = selectedGame === 'all' || selectedGame === 'All'
      const matchingGameObj = gamesList.find((g) => g.id === selectedGame)
      const targetGameName = matchingGameObj ? matchingGameObj.name : selectedGame

      const matchesGame =
        isAllGames ||
        mod.game === selectedGame ||
        mod.game_id === selectedGame ||
        mod.game === targetGameName

      const matchesCategory =
        selectedCategory === 'All' || mod.category === selectedCategory

      const matchesQuery =
        !q ||
        String(mod.title || '').toLowerCase().includes(q) ||
        String(mod.author || '').toLowerCase().includes(q) ||
        String(mod.description || '').toLowerCase().includes(q) ||
        (Array.isArray(mod.tags) &&
          mod.tags.some((t) => String(t || '').toLowerCase().includes(q)))

      return matchesGame && matchesCategory && matchesQuery
    })
  }, [query, selectedGame, selectedCategory, modsList, gamesList])

  const handleAddMod = (newMod) => {
    setModsList((prev) => [newMod, ...prev])
  }

  // 🛡️ Enhanced Deletion Handler with Database Synchronization
  const handleDeleteMod = async (modId) => {
    setModsList((prevMods) => prevMods.filter((mod) => mod.id !== modId))
    if (selectedMod && selectedMod.id === modId) {
      setSelectedMod(null)
    }

    try {
      const { error } = await supabase
        .from('mods')
        .delete()
        .eq('id', modId)

      if (error) {
        console.error('Supabase deletion error:', error.message)
        alert('Failed to delete mod from database: ' + error.message)
      }
    } catch (err) {
      console.error('Unexpected error during mod deletion:', err)
      alert('An unexpected error occurred while deleting the mod.')
    }
  }

  // 🛡️ Handler to Toggle Featured Status in Supabase with .select()
  const handleToggleFeature = async (modId, currentFeaturedStatus) => {
    const newFeaturedState = !currentFeaturedStatus

    // 1. Optimistic UI updates
    setModsList((prevMods) =>
      prevMods.map((mod) =>
        mod.id === modId ? { ...mod, featured: newFeaturedState } : mod
      )
    )
    setSelectedMod((prev) =>
      prev && prev.id === modId ? { ...prev, featured: newFeaturedState } : prev
    )

    // 2. Sync change to Supabase database with .select() to force execution & return
    try {
      const { data, error } = await supabase
        .from('mods')
        .update({ featured: newFeaturedState })
        .eq('id', modId)
        .select()

      if (error) {
        console.error('Failed to update featured status in database:', error.message)
        alert('Failed to update featured status: ' + error.message)
        // Revert optimistic update on error
        setModsList((prevMods) =>
          prevMods.map((mod) =>
            mod.id === modId ? { ...mod, featured: currentFeaturedStatus } : mod
          )
        )
      } else {
        console.log('Successfully updated featured status in Supabase:', data)
      }
    } catch (err) {
      console.error('Unexpected error toggling feature:', err)
      alert('An unexpected error occurred while toggling the featured state.')
    }
  }

  const handleDownload = async (modId) => {
    const targetMod = modsList.find((m) => m.id === modId)
    const newDownloadCount = (targetMod?.downloads || 0) + 1

    // 1. Optimistic UI updates
    setModsList((prevMods) =>
      prevMods.map((mod) =>
        mod.id === modId ? { ...mod, downloads: newDownloadCount } : mod
      )
    )
    setSelectedMod((prev) =>
      prev && prev.id === modId
        ? { ...prev, downloads: newDownloadCount }
        : prev
    )

    // 2. Sync download count permanently to Supabase database
    try {
      const { error } = await supabase
        .from('mods')
        .update({ downloads: newDownloadCount })
        .eq('id', modId)

      if (error) {
        console.error('Failed to update download count in database:', error.message)
      }
    } catch (err) {
      console.error('Unexpected error syncing download count:', err)
    }
  }

  const handleRate = (modId, score) => {
    setModsList((prevMods) =>
      prevMods.map((mod) => {
        if (mod.id === modId) {
          return {
            ...mod,
            rating: score,
          }
        }
        return mod
      })
    )

    setSelectedMod((prev) => {
      if (prev && prev.id === modId) {
        return {
          ...prev,
          rating: score,
        }
      }
      return prev
    })
  }

  const activeFullMod = modsList.find((m) => m.id === activeModId)

  // Shared handler to open full mod detail page view
  const handleOpenFullPage = (modId) => {
    setSelectedMod(null)
    setActiveModId(modId)
    setCurrentView('mod-detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen">
      {/* 🛡️ NSFW Warning Gate (Renders BEFORE everything else if not cleared) */}
      {!nsfwCleared && <NSFWWarning onAccept={() => setNsfwCleared(true)} />}

      {/* 1. Background NightEarth Map & Independent Fireflies */}
      <NortheastFireflies />

      {/* 2. Fluid Mouse Ribbon Trail Layer */}
      <CursorTrail />

      <Header
        currentUser={currentUser}
        onSignInClick={() => setIsAuthOpen(true)}
        onProfileClick={() => setCurrentView('profile')}
        onUploadClick={() => setIsUploadOpen(true)}
        onNavigateView={handleNavigateView}
        onOpenModeratorPanel={() => setCurrentView('moderator')}
      />

      <main>
        {currentView === 'home' && (
          <>
            <Hero
              onBrowseClick={scrollToBrowse}
              onUploadClick={() => setIsUploadOpen(true)}
            />
            <FeaturedMods 
              mods={featuredMods} 
              onSelect={setSelectedMod} 
              onOpenFullPage={handleOpenFullPage}
            />

            <GameCategories
              games={gamesList}
              selectedGame={selectedGame}
              onSelectGame={setSelectedGame}
            />

            <div ref={browseRef}>
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                resultCount={filteredMods.length}
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-gray-400">
                <span className="animate-pulse text-lg">Loading mods from database…</span>
              </div>
            ) : (
              <ModGrid 
                mods={filteredMods} 
                onSelect={setSelectedMod} 
                onOpenFullPage={handleOpenFullPage}
              />
            )}
          </>
        )}

        {currentView === 'mod-detail' && activeFullMod && (
          <ModPage
            mod={activeFullMod}
            currentUser={currentUser}
            onBackToHome={() => setCurrentView('home')}
            onDownload={handleDownload}
            onRate={handleRate}
            onToggleFeature={handleToggleFeature}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            mods={modsList}
            onBackToHome={() => setCurrentView('home')}
            onSignOut={handleSignOut}
            onDeleteMod={handleDeleteMod}
            onUpdateUser={handleUserUpdated}
          />
        )}

        {currentView === 'developers' && (
          <DeveloperPortal onBackToHome={() => setCurrentView('home')} />
        )}

        {currentView === 'moderator' && (
          <ModeratorPanel
            currentUser={currentUser}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'info' && (
          <InfoPage
            pageTitle={activeInfoPage}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      <Footer
        onNavigateDev={() => setCurrentView('developers')}
        onNavigateInfo={(pageName) => {
          setActiveInfoPage(pageName)
          setCurrentView('info')
        }}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      {/* Modals */}
      <ModDetail
        mod={selectedMod}
        onClose={() => setSelectedMod(null)}
        onDownload={handleDownload}
        onRate={handleRate}
        currentUser={currentUser}
        onOpenFullPage={handleOpenFullPage}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddMod={handleAddMod}
        currentUser={currentUser}
      />
    </div>
  )
}
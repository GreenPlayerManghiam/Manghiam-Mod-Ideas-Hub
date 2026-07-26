import { useMemo, useState, useRef, useEffect } from 'react'
import {
  getMods,
  getGames,
  getCurrentUser,
  onAuthStateChange,
  signOut,
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

export default function App() {
  const [modsList, setModsList] = useState([])
  const [gamesList, setGamesList] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modal preview state vs Full Page state
  const [selectedMod, setSelectedMod] = useState(null)
  const [activeModId, setActiveModId] = useState(null)

  const [currentView, setCurrentView] = useState('home') // 'home', 'profile', 'developers', 'info', 'mod-detail'
  const [activeInfoPage, setActiveInfoPage] = useState('Privacy')

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Ref to the browse section for smooth scrolling
  const browseRef = useRef(null)

  // 1. Fetch initial data from Supabase on mount
  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        // Fetch current user session
        const user = await getCurrentUser()
        setCurrentUser(user)

        // Fetch mods and games from Supabase
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
    const { data: authListener } = onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null)
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

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
  }

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
    setCurrentView('home')
  }

  const featuredMods = useMemo(() => modsList.filter((m) => m.featured), [modsList])

  const filteredMods = useMemo(() => {
    const q = query.toLowerCase().trim()
    return modsList.filter((mod) => {
      // Support matching game by id or name
      const matchingGameObj = gamesList.find((g) => g.id === selectedGame)
      const targetGameName = matchingGameObj ? matchingGameObj.name : selectedGame

      const matchesGame =
        selectedGame === 'all' ||
        mod.game === selectedGame ||
        mod.game_id === selectedGame ||
        mod.game === targetGameName

      const matchesCategory =
        selectedCategory === 'All' || mod.category === selectedCategory

      const matchesQuery =
        !q ||
        mod.title?.toLowerCase().includes(q) ||
        mod.author?.toLowerCase().includes(q) ||
        mod.description?.toLowerCase().includes(q) ||
        mod.tags?.some((t) => t.toLowerCase().includes(q))

      return matchesGame && matchesCategory && matchesQuery
    })
  }, [query, selectedGame, selectedCategory, modsList, gamesList])

  const handleAddMod = (newMod) => {
    setModsList((prev) => [newMod, ...prev])
  }

  const handleDeleteMod = (modId) => {
    setModsList((prevMods) => prevMods.filter((mod) => mod.id !== modId))
    if (selectedMod && selectedMod.id === modId) {
      setSelectedMod(null)
    }
  }

  const handleDownload = (modId) => {
    setModsList((prevMods) =>
      prevMods.map((mod) =>
        mod.id === modId ? { ...mod, downloads: (mod.downloads || 0) + 1 } : mod
      )
    )
    setSelectedMod((prev) =>
      prev && prev.id === modId
        ? { ...prev, downloads: (prev.downloads || 0) + 1 }
        : prev
    )
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

  // Helper to find the active mod object for the full page view
  const activeFullMod = modsList.find((m) => m.id === activeModId)

  return (
    <div className="min-h-screen">
      <Header
        currentUser={currentUser}
        onSignInClick={() => setIsAuthOpen(true)}
        onProfileClick={() => setCurrentView('profile')}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      <main>
        {currentView === 'home' && (
          <>
            <Hero
              onBrowseClick={scrollToBrowse}
              onUploadClick={() => setIsUploadOpen(true)}
            />
            <FeaturedMods mods={featuredMods} onSelect={setSelectedMod} />

            {/* Dynamically loads default + user-added custom games for filtering */}
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
              <ModGrid mods={filteredMods} onSelect={setSelectedMod} />
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
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            mods={modsList}
            onBackToHome={() => setCurrentView('home')}
            onSignOut={handleSignOut}
            onDeleteMod={handleDeleteMod}
          />
        )}

        {currentView === 'developers' && (
          <DeveloperPortal onBackToHome={() => setCurrentView('home')} />
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
        onOpenFullPage={(modId) => {
          setSelectedMod(null)
          setActiveModId(modId)
          setCurrentView('mod-detail')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
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
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
import Forums from './components/Forums'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import UploadModal from './components/UploadModal'
import ProfilePage from './components/ProfilePage'
import DeveloperPortal from './components/DeveloperPortal'
import InfoPage from './components/InfoPage'
import NSFWWarning from './components/NSFWWarning'
import NortheastFireflies from './components/NortheastFireflies'
import CursorTrail from './components/CursorTrail'
import ModeratorPanel from './components/ModeratorPanel'

export default function App() {
  const [modsList, setModsList] = useState([])
  const [gamesList, setGamesList] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
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
  const [editingMod, setEditingMod] = useState(null)

  const [currentView, setCurrentView] = useState('home')
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
        role: profileData?.role || (authUser.email === 'manghiamknongsiej@gmail.com' ? 'admin' : 'user'),
        ...(profileData || {}),
      })
    } catch (err) {
      console.error('Failed to fetch profile row:', err)
      setCurrentUser({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Modder',
        avatar: authUser.user_metadata?.avatar_url || null,
        role: authUser.email === 'manghiamknongsiej@gmail.com' ? 'admin' : 'user',
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

        const [{ data: modsData }, { data: gamesData }, { data: catData }] = await Promise.all([
          getMods(),
          getGames(),
          supabase.from('categories').select('*').order('name'),
        ])

        if (modsData) setModsList(modsData)
        if (gamesData) setGamesList(gamesData)
        if (catData) setCategoriesList(catData)
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

  const handleNavigateView = (viewName) => {
    if (viewName === 'forums') {
      setCurrentView('forums')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

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
    setCurrentView('home')
  }

  const handleUserUpdated = async () => {
    const authUser = await getCurrentUser()
    await fetchMergedUser(authUser)
  }

  const isModerator = Boolean(
    currentUser &&
      (currentUser.email === 'manghiamknongsiej@gmail.com' ||
        currentUser.role === 'moderator' ||
        currentUser.role === 'admin' ||
        currentUser.is_moderator === true)
  )

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

  // Handler to update an existing mod and persist changes to Supabase
  const handleUpdateMod = async (updatedModData) => {
    setModsList((prev) =>
      prev.map((mod) => (mod.id === updatedModData.id ? { ...mod, ...updatedModData } : mod))
    )
    setEditingMod(null)
    setSelectedMod(null)

    try {
      const { error } = await supabase
        .from('mods')
        .update({
          title: updatedModData.title,
          description: updatedModData.description,
          category: updatedModData.category,
          version: updatedModData.version,
          tags: updatedModData.tags,
          game: updatedModData.game,
          cover_image: updatedModData.cover_image || updatedModData.image,
          gallery_images: updatedModData.gallery_images,
        })
        .eq('id', updatedModData.id)

      if (error) {
        console.error('Supabase update error:', error.message)
        alert('Failed to update mod in database: ' + error.message)
      } else {
        alert('Mod successfully updated in Supabase!')
      }
    } catch (err) {
      console.error('Unexpected error during mod update:', err)
      alert('An unexpected error occurred while updating the mod.')
    }
  }

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

  const handleToggleFeature = async (modId, currentFeaturedStatus) => {
    const newFeaturedState = !currentFeaturedStatus

    setModsList((prevMods) =>
      prevMods.map((mod) =>
        mod.id === modId ? { ...mod, featured: newFeaturedState } : mod
      )
    )
    setSelectedMod((prev) =>
      prev && prev.id === modId ? { ...prev, featured: newFeaturedState } : prev
    )

    try {
      const { error } = await supabase
        .from('mods')
        .update({ featured: newFeaturedState })
        .eq('id', modId)
        .select()

      if (error) {
        console.error('Failed to update featured status:', error.message)
        setModsList((prevMods) =>
          prevMods.map((mod) =>
            mod.id === modId ? { ...mod, featured: currentFeaturedStatus } : mod
          )
        )
      }
    } catch (err) {
      console.error('Unexpected error toggling feature:', err)
    }
  }

  const handleDownload = async (modId) => {
    const targetMod = modsList.find((m) => m.id === modId)
    const newDownloadCount = (targetMod?.downloads || 0) + 1

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

    try {
      await supabase
        .from('mods')
        .update({ downloads: newDownloadCount })
        .eq('id', modId)
    } catch (err) {
      console.error('Unexpected error syncing download count:', err)
    }
  }

  const handleRate = (modId, score) => {
    setModsList((prevMods) =>
      prevMods.map((mod) => (mod.id === modId ? { ...mod, rating: score } : mod))
    )
    setSelectedMod((prev) => (prev && prev.id === modId ? { ...prev, rating: score } : prev))
  }

  const activeFullMod = modsList.find((m) => m.id === activeModId)

  const handleOpenFullPage = (modId) => {
    setSelectedMod(null)
    setActiveModId(modId)
    setCurrentView('mod-detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen">
      {!nsfwCleared && <NSFWWarning onAccept={() => setNsfwCleared(true)} />}

      <NortheastFireflies />
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
                categories={categoriesList}
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
            onEdit={(modToEdit) => setEditingMod(modToEdit)}
          />
        )}

        {currentView === 'forums' && (
          <Forums
            currentUser={currentUser}
            isModerator={isModerator}
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
        onNavigateForums={() => handleNavigateView('forums')}
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
        onTagClick={(tag) => {
          setQuery(tag)
          setCurrentView('home')
          setTimeout(() => scrollToBrowse(), 50)
        }}
        onEdit={(modToEdit) => setEditingMod(modToEdit)}
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

      {editingMod && (
        <UploadModal
          isOpen={Boolean(editingMod)}
          onClose={() => setEditingMod(null)}
          onAddMod={handleUpdateMod}
          currentUser={currentUser}
          initialData={editingMod}
        />
      )}
    </div>
  )
}
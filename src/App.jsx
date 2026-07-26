import { useMemo, useState, useRef, useEffect } from 'react'
import { mods as initialMods, getGames } from './data/mods'
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
  // Load mods from localStorage if available, otherwise use initialMods
  const [modsList, setModsList] = useState(() => {
    const savedMods = localStorage.getItem('modhub_custom_mods')
    return savedMods ? JSON.parse(savedMods) : initialMods
  })

  // Whenever modsList changes, save it to localStorage so uploads persist!
  useEffect(() => {
    localStorage.setItem('modhub_custom_mods', JSON.stringify(modsList))
  }, [modsList])

  const [query, setQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Modal preview state vs Full Page state
  const [selectedMod, setSelectedMod] = useState(null)
  const [activeModId, setActiveModId] = useState(null)

  const [currentView, setCurrentView] = useState('home') // 'home', 'profile', 'developers', 'info', 'mod-detail'
  const [activeInfoPage, setActiveInfoPage] = useState('Privacy')

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('modhub_current_user') || null
  })

  // Keep localStorage perfectly synced with currentUser state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('modhub_current_user', currentUser)
    } else {
      localStorage.removeItem('modhub_current_user')
    }
  }, [currentUser])

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Direct ref to the browse section so scrolling from the hero works seamlessly
  const browseRef = useRef(null)

  const scrollToBrowse = () => {
    browseRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAuthSuccess = (username) => {
    setCurrentUser(username)
  }

  const handleSignOut = () => {
    localStorage.removeItem('modhub_current_user')
    setCurrentUser(null)
    setCurrentView('home')
  }

  const featuredMods = useMemo(() => modsList.filter((m) => m.featured), [modsList])

  const filteredMods = useMemo(() => {
    const q = query.toLowerCase().trim()
    return modsList.filter((mod) => {
      // Support matching game by id or name
      const gamesList = getGames()
      const matchingGameObj = gamesList.find((g) => g.id === selectedGame)
      const targetGameName = matchingGameObj ? matchingGameObj.name : selectedGame

      const matchesGame = selectedGame === 'all' || mod.game === selectedGame || mod.game === targetGameName
      const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory
      const matchesQuery =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.author.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.tags.some((t) => t.toLowerCase().includes(q))
      return matchesGame && matchesCategory && matchesQuery
    })
  }, [query, selectedGame, selectedCategory, modsList])

  const handleAddMod = (newMod) => {
    setModsList([newMod, ...modsList])
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
        mod.id === modId ? { ...mod, downloads: mod.downloads + 1 } : mod
      )
    )
    setSelectedMod((prev) =>
      prev && prev.id === modId ? { ...prev, downloads: prev.downloads + 1 } : prev
    )
  }

  const handleRate = (modId, score) => {
    setModsList((prevMods) =>
      prevMods.map((mod) => {
        if (mod.id === modId) {
          // Pull all ratings from localStorage to calculate the true average dynamically
          const allRatingsMap = JSON.parse(localStorage.getItem('modhub_mod_ratings') || '{}')
          const modRatingsObj = allRatingsMap[modId] || {}
          const scores = Object.values(modRatingsObj)

          let newAvg = mod.rating // default fallback
          if (scores.length > 0) {
            const sum = scores.reduce((acc, val) => acc + val, 0)
            newAvg = Number((sum / scores.length).toFixed(1))
          }

          return {
            ...mod,
            rating: newAvg,
            ratingsArray: scores,
          }
        }
        return mod
      })
    )

    setSelectedMod((prev) => {
      if (prev && prev.id === modId) {
        const allRatingsMap = JSON.parse(localStorage.getItem('modhub_mod_ratings') || '{}')
        const modRatingsObj = allRatingsMap[modId] || {}
        const scores = Object.values(modRatingsObj)

        let newAvg = prev.rating
        if (scores.length > 0) {
          const sum = scores.reduce((acc, val) => acc + val, 0)
          newAvg = Number((sum / scores.length).toFixed(1))
        }

        return {
          ...prev,
          rating: newAvg,
          ratingsArray: scores,
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
              games={getGames()} 
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
            
            <ModGrid mods={filteredMods} onSelect={setSelectedMod} />
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
          <DeveloperPortal 
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
      
      {/* Quick Preview Modal with "Open Full Page" integration */}
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
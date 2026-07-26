export const defaultGames = [
  { id: 'all', name: 'All Games', icon: '🎮' },
  { id: 'skyrim', name: 'Skyrim', icon: '⚔️' },
  { id: 'minecraft', name: 'Minecraft', icon: '⛏️' },
  { id: 'gta5', name: 'GTA V', icon: '🚗' },
  { id: 'fallout4', name: 'Fallout 4', icon: '☢️' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', icon: '🌃' },
  { id: 'witcher3', name: 'The Witcher 3', icon: '🐺' },
]

// Helper function to get games including any user-added custom ones from localStorage
export function getGames() {
  const customGames = JSON.parse(localStorage.getItem('modhub_custom_games') || '[]')
  return [...defaultGames, ...customGames]
}

export const categories = [
  'All',
  'Graphics',
  'Gameplay',
  'UI/HUD',
  'Characters',
  'Weapons',
  'Maps',
  'Quality of Life',
]

// Wiped clean so the hub starts fresh with only your custom uploaded mods!
export const mods = []

export function formatDownloads(count) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`
  return String(count)
}
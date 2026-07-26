Manghiam Mod Ideas Hub
A community space for game modders and enthusiasts to share, discover, and discuss mod ideas — before they become reality.

Overview
Manghiam Mod Ideas Hub is a fully client-side React + Vite web application for browsing, submitting, rating, and discussing game modification ideas. Think of it as a creative board where the modding community can pitch concepts, get feedback, and inspire each other — not a distribution platform like ModDB or NexusMods.

All data lives in the user's browser via localStorage and sessionStorage — there is no backend, no database, and no hosting cost beyond a free static deployment.

Built and maintained by Manghiam.

What This Is (and Isn't)
✅ This is: A community idea board for mod concepts, pitches, and inspiration ✅ This is: A place to rate, discuss, and collect interesting mod ideas ✅ This is: Lightweight, free, and runs entirely in the browser

❌ This is not: A mod distribution platform (no actual mod files are hosted) ❌ This is not: A replacement for ModDB, NexusMods, or similar platforms ❌ This is not: A server-side application — data stays on your device

Features
For Everyone
🎮 Browse Mod Ideas — Filter by game, search by title, sort by rating or popularity
⭐ Rate Ideas — 1–5 star ratings, persisted per user across refreshes
👍 Like / Dislike — Vote on ideas you love or think need work
💬 Community Discussion — Post, edit, delete, reply to, and vote on comments
❤️ Collections — Save your favourite mod ideas to a personal list
🖼️ Concept Images — Multi-image gallery for concept art and reference screenshots
For Idea Submitters
📝 Submit Mod Ideas — Share your concept with a title, description, game tag, and up to 5 concept images
🎮 Add Custom Games — Add any game to the platform yourself via the submission form
♻️ Persistence — Submitted ideas survive page refreshes (stored in localStorage)
For the Founder (Manghiam account only)
✨ Feature Toggle — Mark or unmark any idea as "Featured" directly from the card, detail view, or idea page
🗂️ Override System — Featured overrides are stored separately and applied on top of seed data
Safety
🔞 Content Warning Gate — Full-screen acknowledgement shown once per session, with a permanent "don't show again" option
Tech Stack
Layer	Technology
Framework	React 18
Build tool	Vite
Styling	Tailwind CSS
Storage	Browser localStorage / sessionStorage
Images	Canvas API (client-side compression)
Deployment	Vercel / Netlify (static)
No Node.js server. No database. No paid services.

Project Structure
src/
├── components/
│   ├── AppPersistence.js      # localStorage helpers (load, save, featured overrides)
│   ├── AuthModal.jsx          # Sign in / register modal
│   ├── FeaturedMods.jsx       # Featured ideas carousel section
│   ├── Header.jsx             # Site header + nav + user menu
│   ├── ModCard.jsx            # Idea grid card (with founder feature toggle)
│   ├── ModDetail.jsx          # Quick-view modal (gallery + ratings + collection)
│   ├── ModGrid.jsx            # Responsive idea grid
│   ├── ModPage.jsx            # Full idea page (gallery, comments, sidebar)
│   ├── NSFWWarning.jsx        # Content warning overlay
│   ├── ProfileModal.jsx       # User profile editor
│   └── UploadModal.jsx        # Mod idea submission form
├── data/
│   └── mods.js                # Seed idea data + game list helpers
└── App.jsx                    # Root component, state, routing

localStorage Keys
Key	Purpose
modhub_users	Array of all registered user objects
modhub_current_user	Username string of the logged-in user
modhub_uploaded_mods	Array of user-submitted mod ideas (persists across refreshes)
modhub_featured_overrides	{ [modId]: true | false } — founder feature overrides
modhub_mod_ratings	{ [modId]: { [username]: score } }
modhub_mod_votes	{ [modId]: { likes, dislikes, userVotes } }
modhub_mod_comments	{ [modId]: [comments array] }
modhub_collections	Array of ideas saved to the user's collection
modhub_custom_games	User-added game entries
modhub_nsfw_never_show	"true" if user opted out of the content warning permanently
sessionStorage Key	Purpose
modhub_nsfw_ok	Set when the user clears the content warning for this session
Note: Because all data is stored locally per browser, each visitor's ideas, votes, and comments exist only on their own device. This is intentional for this phase — no server required.

Getting Started (Local Development)
# Install dependencies
npm install
# Start the dev server
npm run dev
# Open http://localhost:5173

Deployment (Free)
Vercel (Recommended)
Push this repo to GitHub
Go to vercel.com → Add New Project → Import your repo
Vercel detects Vite automatically — click Deploy
Every push to main re-deploys automatically
Netlify Drop (Fastest, no account needed)
npm run build          # produces /dist

Drag the dist/ folder onto netlify.com/drop.

GitHub Pages
Add to vite.config.js:

base: '/your-repo-name/',

Then enable GitHub Actions in repo Settings → Pages.

Founder Account
The Manghiam account has elevated privileges:

Auto-seeded into modhub_users when AuthModal is first opened
Detected by checking username.toLowerCase() === 'manghiam'
Can feature/unfeature any idea from ModCard, ModDetail, and ModPage
Featured state is stored in modhub_featured_overrides and applied on top of seed data at runtime
App.jsx Integration Notes
Two additions are needed in App.jsx to wire up persistence and featured overrides. See the header comment in AppPersistence.js for the exact copy-paste. Summary:

import {
  loadPersistedMods,
  saveModToStorage,
  applyFeaturedOverrides,
} from './components/AppPersistence'
// Initialize ideas from localStorage on boot
const [mods, setMods] = useState(() =>
  applyFeaturedOverrides([...seedMods, ...loadPersistedMods()])
)
// When a new idea is submitted
const handleAddMod = (newMod) => {
  saveModToStorage(newMod)
  setMods(prev => applyFeaturedOverrides([newMod, ...prev]))
}

Concept Image Compression
Images submitted as concept art are compressed client-side using the Canvas API before being stored as base64 JPEG strings:

Max width: 700px (height scales proportionally)
JPEG quality: 65%
Estimated size per image: ~15–30 KB
Per idea (5 images): ~75–150 KB
Practical limit: ~20–30 submissions before approaching the 5 MB localStorage cap
A storage-full alert is shown if the browser's quota is exceeded.

Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

By contributing to this project, you agree that your contributions will be licensed under the same AGPL-3.0 license as the rest of the project.

License
Manghiam Mod Ideas Hub
Copyright (C) 2025  Manghiam
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

See LICENSE for the full text. Get the full license text at: https://www.gnu.org/licenses/agpl-3.0.txt

A Manghiam Production — All Rights Reserved Under AGPL-3.0

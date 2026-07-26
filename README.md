# 🎮 Manghiam Mod Ideas Hub

> A community space for game modders and enthusiasts to share, discover, and discuss mod ideas — before they become reality.

---

## 📖 Overview

**Manghiam Mod Ideas Hub** is a fully client-side **React + Vite** web application for browsing, submitting, rating, and discussing game modification ideas.

Instead of distributing mods like ModDB or Nexus Mods, this project focuses on the **creative stage**—allowing the community to pitch concepts, receive feedback, and inspire future projects.

Everything runs entirely inside the browser using **localStorage** and **sessionStorage**.

- ✅ No backend
- ✅ No database
- ✅ No server
- ✅ No hosting costs beyond a free static deployment

Built and maintained by **Manghiam**.

---

# What This Is

- 🎮 A community idea board for game mod concepts
- 💡 A place to brainstorm and inspire future mods
- ⭐ A platform to rate, discuss, and collect ideas
- ❤️ Lightweight, free, and runs entirely in your browser

# What This Isn't

- ❌ A mod download platform
- ❌ A replacement for ModDB or Nexus Mods
- ❌ A server-side application
- ❌ A cloud-hosted database

All data remains **only on your own device.**

---

# ✨ Features

## 🌍 Community Features

### 🎮 Browse Mod Ideas

- Filter by game
- Search by title
- Sort by popularity
- Sort by rating

### ⭐ Rate Ideas

- 1–5 star ratings
- Ratings persist across refreshes

### 👍 Like / Dislike

Vote on ideas you love—or think need work.

### 💬 Community Discussion

- Post comments
- Edit comments
- Delete comments
- Reply to comments
- Vote on comments

### ❤️ Collections

Save your favourite ideas for later.

### 🖼️ Concept Image Gallery

Upload multiple concept images or reference screenshots.

---

## ✍️ For Idea Submitters

### 📝 Submit Mod Ideas

Share your idea with:

- Title
- Description
- Game
- Up to **5 concept images**

### 🎮 Add Custom Games

Can't find your game?

Add it yourself during submission.

### ♻️ Persistent Storage

Ideas survive page refreshes using **localStorage**.

---

## 👑 Founder Features (Manghiam Account)

The **Manghiam** account has elevated privileges.

### ✨ Feature Ideas

Feature or unfeature any idea directly from:

- Mod Cards
- Detail View
- Full Idea Page

Featured overrides are stored separately from seed data.

---

# 🔞 Safety

## Content Warning

A full-screen acknowledgement is shown once per session.

Users can permanently disable it with **"Don't show again."**

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Storage | Browser localStorage / sessionStorage |
| Images | Canvas API |
| Deployment | Vercel / Netlify |

No Node.js server.

No database.

No paid services.

---

# 📁 Project Structure

```text
src/
├── components/
│   ├── AppPersistence.js      # localStorage helpers
│   ├── AuthModal.jsx          # Sign in / register modal
│   ├── FeaturedMods.jsx       # Featured ideas carousel
│   ├── Header.jsx             # Navigation and user menu
│   ├── ModCard.jsx            # Idea grid card
│   ├── ModDetail.jsx          # Quick-view modal
│   ├── ModGrid.jsx            # Responsive grid
│   ├── ModPage.jsx            # Full idea page
│   ├── NSFWWarning.jsx        # Content warning overlay
│   ├── ProfileModal.jsx       # User profile editor
│   └── UploadModal.jsx        # Idea submission form
│
├── data/
│   └── mods.js                # Seed data & game helpers
│
└── App.jsx                    # Root component
```

---

# 💾 localStorage

| Key | Purpose |
|------|---------|
| `modhub_users` | Registered users |
| `modhub_current_user` | Logged-in username |
| `modhub_uploaded_mods` | User-submitted ideas |
| `modhub_featured_overrides` | Founder feature overrides |
| `modhub_mod_ratings` | Ratings |
| `modhub_mod_votes` | Likes, dislikes and user votes |
| `modhub_mod_comments` | Comments |
| `modhub_collections` | Saved ideas |
| `modhub_custom_games` | User-added games |
| `modhub_nsfw_never_show` | Permanently hide warning |

---

# 🗂 sessionStorage

| Key | Purpose |
|------|---------|
| `modhub_nsfw_ok` | User accepted the warning this session |

---

## Important

Since everything is stored locally:

- Ideas only exist on your device.
- Ratings only exist on your device.
- Comments only exist on your device.
- Collections only exist on your device.

This is **intentional** for the current version of the project.

---

# 🚀 Getting Started

## Install dependencies

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# 🌐 Deployment

## ▲ Vercel (Recommended)

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Vercel automatically detects Vite.
4. Click **Deploy**.

Every push to `main` redeploys automatically.

---

## 🌍 Netlify Drop

Build:

```bash
npm run build
```

Drag the generated **dist/** folder onto Netlify Drop.

---

## 📄 GitHub Pages

Add this to `vite.config.js`:

```js
base: '/your-repo-name/',
```

Then enable GitHub Actions under:

**Repository → Settings → Pages**

---

# 👑 Founder Account

The **Manghiam** account is automatically seeded into `modhub_users`.

Founder detection:

```js
username.toLowerCase() === "manghiam"
```

Founder abilities:

- Feature ideas
- Remove featured status
- Manage featured ideas from every view

Featured information is stored in:

```
modhub_featured_overrides
```

---

# 🔧 App.jsx Integration

Import:

```js
import {
  loadPersistedMods,
  saveModToStorage,
  applyFeaturedOverrides,
} from "./components/AppPersistence";
```

Initialize:

```js
const [mods, setMods] = useState(() =>
  applyFeaturedOverrides([...seedMods, ...loadPersistedMods()])
);
```

Handle new ideas:

```js
const handleAddMod = (newMod) => {
  saveModToStorage(newMod);
  setMods((prev) => applyFeaturedOverrides([newMod, ...prev]));
};
```

---

# 🖼 Concept Image Compression

Images are compressed client-side using the **Canvas API**.

| Setting | Value |
|----------|-------|
| Maximum Width | 700px |
| JPEG Quality | 65% |
| Estimated Image Size | 15–30 KB |
| Five Images | 75–150 KB |

Practical storage limit:

Approximately **20–30 submissions** before reaching the browser's **5 MB localStorage limit**.

A storage warning is displayed if the quota is exceeded.

---

# 🤝 Contributing

Pull requests are welcome.

For major changes, please open an issue first to discuss what you'd like to change.

By contributing, you agree that your work will be licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

---

# 📜 License

```text
Manghiam Mod Ideas Hub
Copyright (C) 2025 Manghiam

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
```

See the **LICENSE** file for the full license text.

---

# ❤️ A Manghiam Production

Licensed under **AGPL-3.0**.

Made with ❤️ for the game modding community.

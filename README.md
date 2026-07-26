# ModHub — Game Mods Website

A modern React website for browsing, discovering, and downloading game mods. Built with Vite, React, and Tailwind CSS.

## Features

- **Hero landing page** with stats and call-to-action
- **Featured mods** carousel grid
- **Browse by game** — Skyrim, Minecraft, GTA V, Fallout 4, Cyberpunk, Witcher 3
- **Search & filter** by name, author, tags, and category
- **Mod detail modal** with download info, ratings, and tags
- **Dark gaming aesthetic** with responsive layout

## Prerequisites

Install [Node.js](https://nodejs.org/) (v18 or later recommended).

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
modhub/
├── public/           # Static assets
├── src/
│   ├── components/   # React UI components
│   ├── data/         # Mock mod data
│   ├── App.jsx       # Main app with search/filter state
│   ├── main.jsx      # Entry point
│   └── index.css     # Tailwind + custom styles
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## Tech Stack

- **React 19** — UI framework
- **Vite 6** — Build tool & dev server
- **Tailwind CSS 3** — Utility-first styling

## License

MIT

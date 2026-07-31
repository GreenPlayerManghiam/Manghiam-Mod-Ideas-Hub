# Manghiam Mod Ideas Hub

> A community platform where gamers can share, discover, discuss, and refine game mod ideas before they become reality.

---

## Official Website

[https://manghiam-mod-ideas-hub-vercel.vercel.app/](https://manghiam-mod-ideas-hub-vercel.vercel.app/)

---

## Overview

Manghiam Mod Ideas Hub is a full-stack web application built with **React**, **Vite**, and **Supabase**. It provides a place for gamers, modders, artists, and creators to share original game mod ideas, receive feedback from the community, and inspire future projects.

Unlike platforms such as **ModDB** or **Nexus Mods**, this project focuses on the idea stage of game modding rather than hosting completed mods. Every mod starts with an idea, and this platform exists to give those ideas a place to be shared, discussed, refined, and discovered.

Users can publish concepts, browse ideas from others, participate in community forums, leave ratings and reactions, and build a growing collection of creative mod concepts across different games.

The application uses **Supabase** for authentication, database management, and cloud storage, allowing community content to persist securely across devices.

---

## Project Vision

Every great mod begins with a single idea.

Many creative concepts never reach a mod developer simply because there isn't a dedicated place for them to be shared. Manghiam Mod Ideas Hub aims to solve that by providing a platform where anyone can publish an idea, receive feedback, inspire other creators, and collaborate with the community.

---

## What This Is

Manghiam Mod Ideas Hub is:

* A platform dedicated to game mod ideas.
* A place where anyone can publish creative concepts.
* A community for discussing and improving ideas via threaded forums and comments.
* A space where mod developers can discover inspiration.

---

## What This Isn't

Manghiam Mod Ideas Hub is **not**:

* A mod download website.
* A replacement for ModDB or Nexus Mods.
* A file hosting service.
* A marketplace for paid mods.

---

## Features

Manghiam Mod Ideas Hub includes a rich suite of community-focused features designed to make sharing and discovering mod ideas engaging:

### Community & Navigation

* Browse community-created mod ideas and featured concepts
* Search ideas by title, author, description, or tags
* Filter ideas dynamically by game and category (`Graphics`, `Gameplay`, `UI/HUD`, `Characters`, `Weapons`, `Maps`, `Quality of Life`)
* Responsive interface with immersive visual layers (`NortheastFireflies` background map and `CursorTrail` fluid ribbons)

### Ratings & Reactions

* 1–5 star rating system with persistent database tracking
* Live download count increments synced to Supabase

### World-Class Community Forums

* Categorized discussion topics and thread creation
* Thread upvoting system and real-time comment streams
* Full moderation support for comments and discussions

### Idea Submission

* Publish original mod concepts with titles, descriptions, target games, and concept images or reference artwork

### User Accounts & Profiles

* Secure authentication via Supabase Auth
* Personalized profiles with avatar customization, statistics, and activity tracking
* Role-based access control (User, Moderator, Admin)

### Moderator & Founder Privileges

* Dedicated Moderator Panel to manage and feature mod ideas, review community reports, remove inappropriate content, and maintain platform health

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Vercel |

---

## Project Architecture

Manghiam Mod Ideas Hub follows a robust full-stack architecture:

* **React** powers the client-side user interface and view routing.
* **Vite** provides fast development and optimized production builds.
* **Supabase Authentication & PostgreSQL** handle user accounts, relational data (mods, games, profiles, forums, comments, and upvotes), and data synchronization.
* **Supabase Storage** securely hosts uploaded mod images and user avatars in dedicated buckets (`mod-images` and `avatars`).
* **Row Level Security (RLS)** protects database resources, ensuring users can only modify content they own unless authorized as a moderator or administrator.

---

## Project Structure

```text
src/
├── components/
│   ├── AuthModal.jsx
│   ├── DeveloperPortal.jsx
│   ├── FeaturedMods.jsx
│   ├── Footer.jsx
│   ├── Forums.jsx
│   ├── GameCategories.jsx
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── InfoPage.jsx
│   ├── ModeratorPanel.jsx
│   ├── ModCard.jsx
│   ├── ModDetail.jsx
│   ├── ModGrid.jsx
│   ├── ModPage.jsx
│   ├── NSFWWarning.jsx
│   ├── ProfilePage.jsx
│   ├── SearchBar.jsx
│   ├── UploadModal.jsx
│   ├── NortheastFireflies.jsx
│   └── CursorTrail.jsx
├── lib/
│   ├── AppPersistence.js
│   ├── mappers.js
│   ├── supabase.js
│   └── supabaseApi.js
├── data/
│   └── mods.js
├── App.jsx
├── main.jsx
└── index.css

```

---

## Running Locally

To run Manghiam Mod Ideas Hub on your local machine, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/GreenPlayerManghiam/Manghiam-Mod-Ideas-Hub.git

```

### 2. Navigate to the Project Directory

```bash
cd Manghiam-Mod-Ideas-Hub

```

### 3. Install Dependencies

```bash
npm install

```

### 4. Configure Environment Variables

Create a `.env` or `.env.local` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 5. Start the Development Server

```bash
npm run dev

```

Open your browser and navigate to `http://localhost:5173`.

---

## Deployment

The project is optimized for deployment on **Vercel** connected to a **Supabase** backend instance. Ensure that environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are properly configured in your deployment settings.

---

## License

Manghiam Mod Ideas Hub is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the `LICENSE` file for details.

---

## Acknowledgements

Thank you to the vibrant gaming and modding community for inspiring creative concepts, providing feedback, and pushing the boundaries of interactive software development.

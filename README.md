# Manghiam Mod Ideas Hub

> A community platform where gamers can share, discover, discuss, and refine game mod ideas before they become reality.

---

## Official Website

https://manghiam-mod-ideas-hub-vercel.vercel.app/

---

## Overview

Manghiam Mod Ideas Hub is a full-stack web application built with **React**, **Vite**, and **Supabase**. It provides a place for gamers, modders, artists, and creators to share original game mod ideas, receive feedback from the community, and inspire future projects.

Unlike platforms such as **ModDB** or **Nexus Mods**, this project focuses on the idea stage of game modding rather than hosting completed mods. Every mod starts with an idea, and this platform exists to give those ideas a place to be shared, discussed, refined, and discovered.

Users can publish concepts, browse ideas from others, participate in discussions, leave ratings and reactions, and build a growing collection of creative mod concepts across different games.

The application uses **Supabase** for authentication, database management, and cloud storage, allowing community content to persist across devices instead of being stored locally in the browser.

Manghiam Mod Ideas Hub is an independent passion project that is actively developed and continuously improved with new features, community tools, moderation capabilities, and quality-of-life updates.

---

## Project Vision

Every great mod begins with a single idea.

Many creative concepts never reach a mod developer simply because there isn't a dedicated place for them to be shared. Manghiam Mod Ideas Hub aims to solve that by providing a platform where anyone can publish an idea, receive feedback, inspire other creators, and collaborate with the community.

The long-term vision is to build a community-driven platform where players, artists, writers, designers, and mod developers can exchange ideas that may eventually become real projects.

As development continues, the platform will continue expanding with new community features, improved moderation, better discovery tools, richer user profiles, and additional ways for creators to collaborate.

---

## What This Is

Manghiam Mod Ideas Hub is:

* A platform dedicated to game mod ideas.
* A place where anyone can publish creative concepts.
* A community for discussing and improving ideas.
* A space where mod developers can discover inspiration.
* A project that continues to grow with community feedback.

---

## What This Isn't

Manghiam Mod Ideas Hub is **not**:

* A mod download website.
* A replacement for ModDB or Nexus Mods.
* A file hosting service.
* A marketplace for paid mods.

The goal is simple: give great ideas a place to be seen before they become reality.

---

## Features

Manghiam Mod Ideas Hub continues to grow with new functionality. The platform currently includes a wide range of community-focused features designed to make sharing and discovering mod ideas simple and enjoyable.

### Community

* Browse community-created mod ideas
* Featured ideas
* Search ideas by title
* Filter ideas by game
* All Games category
* Responsive interface for desktop and mobile devices

### Ratings & Reactions

* 1–5 star rating system
* Like and dislike system
* Community feedback
* Persistent ratings stored in Supabase

### Discussions

* Create comments
* Reply to comments
* Edit your own comments
* Delete your own comments
* Community interaction on every published idea
* Persistent cloud-backed comment storage
### Idea Submission

Users can publish their own mod ideas by providing:

* A title
* A detailed description
* The target game
* Concept images or reference artwork

Every submission becomes part of the community, where other users can discover it, leave feedback, and help improve the concept.

### User Accounts

Registered users have access to their own account and profile, including:

* Secure authentication
* Personalized profile
* Avatar customization
* Published creations
* Profile statistics
* Download statistics
* Community activity
* Persistent cloud-backed data across devices

### Moderator System

The platform includes a moderation system to help maintain a healthy community.

Moderator permissions include:

* Feature and unfeature mod ideas
* Create and manage games
* Remove inappropriate content
* Delete or archive comments
* Delete or archive published ideas
* Moderate community activity

### Founder Privileges

The project founder has full administrative permissions for managing the platform and testing new functionality during development.

---

## Tech Stack

| Layer          | Technology       |
| :------------- | :--------------- |
| Frontend       | React 18         |
| Build Tool     | Vite             |
| Styling        | Tailwind CSS     |
| Backend        | Supabase         |
| Database       | PostgreSQL       |
| Authentication | Supabase Auth    |
| Storage        | Supabase Storage |
| Deployment     | Vercel           |

---

## Project Architecture

Manghiam Mod Ideas Hub follows a modern full-stack architecture.

* **React** powers the user interface.
* **Vite** provides fast development and optimized production builds.
* **Supabase Authentication** manages user accounts and login.
* **PostgreSQL** stores community data such as users, mod ideas, comments, ratings, and games.
* **Supabase Storage** stores uploaded images and other media.
* **Row Level Security (RLS)** protects user data by ensuring users can only modify content they own unless they have moderator permissions.
* **Vercel** hosts the production deployment.

This architecture allows the platform to scale beyond the limitations of browser-based storage while keeping deployment simple and maintenance straightforward.

---

## Project Structure

```text
src/
├── assets/
├── components/
├── data/
├── lib/
├── services/
├── App.jsx
├── main.jsx
└── index.css
```

> The project structure may continue evolving as new features are added and existing components are refactored.

---

## Current Status

Manghiam Mod Ideas Hub is actively under development.

The project has evolved from an early browser-based prototype into a cloud-backed platform powered by Supabase. Many core community features are already functional, while additional systems are continuously being designed, implemented, and refined.

Development is focused on creating a platform that is reliable, scalable, and enjoyable to use while maintaining a clean and modern user experience.

Every update brings the project closer to its long-term vision of becoming a dedicated community space for sharing and discovering game mod ideas.

---

## Roadmap

Development is ongoing, and several improvements are planned for future updates, including:

* Improved profile management
* Better game management
* Dedicated tag system
* Expanded moderator tools
* Progressive Web App (PWA) support
* Better notifications
* Improved search and filtering
* Enhanced collections
* Better analytics
* Additional accessibility improvements
* Performance optimizations
* More community-driven features

As the platform grows, this roadmap will continue to evolve alongside community feedback and future ideas.
## Running Locally

If you'd like to run Manghiam Mod Ideas Hub on your own machine, follow these steps.

### Clone the Repository

```bash
git clone https://github.com/GreenPlayerManghiam/Manghiam-Mod-Ideas-Hub.git
```

### Navigate to the Project

```bash
cd Manghiam-Mod-Ideas-Hub
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root and add your Supabase credentials.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values can be found in your Supabase project settings.

### Start the Development Server

```bash
npm run dev
```

Once running, open your browser and navigate to:

```text
http://localhost:5173
```

---

## Deployment

The project is deployed using **Vercel**, with **Supabase** providing authentication, database services, and cloud storage.

To deploy your own instance:

1. Fork this repository.
2. Create a Supabase project.
3. Configure the required environment variables.
4. Deploy the project to Vercel or another platform that supports Vite applications.

---

## Security

Authentication is handled through **Supabase Auth**, while application data is stored in **PostgreSQL**.

The project also uses **Row Level Security (RLS)** to help ensure users can only modify resources they are permitted to access. Administrative and moderator capabilities are restricted to authorized accounts.

---

## Project Philosophy

Manghiam Mod Ideas Hub is built around a simple belief:

> Every great mod begins with an idea.

Many players have creative concepts but never get the opportunity to share them. Likewise, many mod developers are looking for inspiration for their next project.

This platform exists to connect those two groups by giving ideas a place to be published, discussed, refined, and discovered.

Rather than competing with existing mod hosting platforms, Manghiam Mod Ideas Hub complements them by focusing on the earliest stage of the creative process.

---

## Frequently Asked Questions

### Does this website host downloadable mods?

No.

Manghiam Mod Ideas Hub focuses exclusively on sharing and discussing ideas for future mods. It is not intended to replace platforms such as ModDB or Nexus Mods.

### Can anyone submit an idea?

Yes.

Any registered user can publish their own original mod ideas for the community to view and discuss.

### Is the project still being developed?

Yes.

The platform is actively maintained, and new features, improvements, and bug fixes are released on a regular basis.

### Can I contribute?

Absolutely.

Bug reports, feature suggestions, pull requests, and constructive feedback are always appreciated.

---

## Changelog

The project continues to receive regular updates, including new features, bug fixes, performance improvements, and quality-of-life enhancements.

For detailed release information, see the repository's **Releases** section on GitHub.
## Contributing

Contributions are welcome.

Whether you've found a bug, have an idea for a new feature, want to improve the user interface, or simply want to help make the platform better, your contributions are appreciated.

If you're planning a significant change, please open an issue first so the idea can be discussed before development begins.

When contributing, please:

* Write clear and maintainable code.
* Follow the existing project structure where possible.
* Test new functionality before submitting.
* Keep pull requests focused on a single feature or improvement.

Community feedback plays an important role in shaping the future of Manghiam Mod Ideas Hub.

---

## License

Manghiam Mod Ideas Hub is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

You are free to:

* Use
* Study
* Modify
* Distribute

under the terms of the AGPL-3.0 license.

See the **LICENSE** file for the complete license text.

---

## Acknowledgements

This project would not exist without the creativity of the game modding community.

Thank you to everyone who shares ideas, reports bugs, suggests improvements, contributes code, or simply spends time exploring the platform. Every piece of feedback helps shape the future of the project.

Special thanks to the communities that continue to inspire game modding and open-source software.

---

## Future Goals

Manghiam Mod Ideas Hub is still only at the beginning of its journey.

Future development will continue expanding the platform with richer community features, improved moderation tools, better discovery systems, stronger profile customization, enhanced accessibility, and additional ways for creators to collaborate.

The long-term goal isn't simply to build another website—it's to build a place where great game mod ideas are preserved, shared, refined, and transformed into real projects by a passionate community.

---

## Support the Project

If you enjoy the project, consider:

* Starring the repository
* Reporting bugs
* Suggesting new features
* Sharing the project with others
* Contributing to the codebase

Every contribution—whether it's code, feedback, or simply spreading the word—helps the project continue to grow.

---

## Final Notes

Manghiam Mod Ideas Hub began as a simple idea and continues to evolve with every update.

Development is ongoing, and there is still plenty more to build. Every new feature, improvement, and bug fix moves the platform closer to its vision of becoming a dedicated home for game mod ideas and the people who create them.

Thank you for checking out the project.

# Connect Ranked - A Competitive Connect 4 Game

## Overview

Connect Ranked is a single-player competitive Connect 4 game against AI opponents, designed to simulate a multiplayer ranked experience. It features a comprehensive trophy-based ranking system with seasonal resets, an in-game shop for cosmetic titles and banners, and a dynamic leaderboard. The game focuses on local data persistence and offers a progression-based experience with evolving AI competitors, including varied play styles and adaptive counter-play. The project aims to provide an engaging and strategic Connect 4 experience with long-term player progression.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application utilizes React with TypeScript, styled using TailwindCSS for a custom dark theme. UI components are built using Radix UI for accessibility. Cosmetic systems include: Titles (Ranked, Tournament, Leaderboard, Shop) displayed under player usernames, Banners (Default, Shop, Ranked) displayed behind usernames, and Profile Pictures (PFPs) displayed as circular overlays on the left side of banners. The game board has been expanded to 9x7 for increased strategic depth. The UI aims for a clean interface with consistent styling.

### Technical Implementations

The frontend is built with React 18 and Vite. State management relies on local component state and `localStorage` for all data persistence. Navigation uses a simple screen-based system. The backend uses Express.js but currently serves static files, with game logic operating entirely client-side. A mock `IStorage` interface with a `MemStorage` implementation exists, designed for future database integration. The project is configured for autoscale deployment on Replit.

### Feature Specifications

-   **AI System**: Difficulty-based AI (1-10 levels) scales with player trophies, employing minimax-like strategies, pattern recognition, and adaptive counter-play with variable delays and strategic diversity.
-   **Ranking System**: Features 23 ranks (Bronze to Connect Legend) based on trophies (0-701+). Seasons reset every two weeks with trophy adjustments and coin rewards.
-   **Tournament System**: Occurs every 10 minutes with a 16-player single-elimination bracket (15 AI, 1 player). Offers coin prizes and exclusive tournament titles. Opponent matching is within ±150 trophy range, and tournaments continue autonomously via AI simulation after player elimination.
-   **Queue System**: Realistic matchmaking with trophy-based queue times (2-60s) and time-of-day variance, generating opponents with similar trophy counts (±30 variance).
-   **Match System**: Best-of-3 format with a 15-second turn timer. Dynamic trophy rewards/penalties, XP, level progression, and balanced coin rewards.
-   **Shop System**: Rotates 3 titles and 3 banners every 12 hours for in-game currency. Includes a "Featured Items" section with time-based exclusivity.
-   **News Feed System**: Displays updates, announcements, and season news with notification badges and rich content support. News can be filtered by type and automatically appears on load for unread items.
-   **Item Notification System**: Rocket League-style popup notifications when cosmetic items are obtained, showing visual previews.
-   **Profile Picture (PFP) System**: Cosmetic profile pictures displayed as circular overlays on player banners. PFPs have rarities and attributes, available through shop purchases and crates. Managed via inventory with filtering and search functionality.
-   **RP Currency System**: New RP (Ranked Points) currency with migration support, displayed on the main menu.
-   **Dynamic AI Leaderboard**: Automatic 5-minute refresh system where AI competitors update trophy counts to ensure a dynamic leaderboard, with a visible countdown timer.
-   **CSL (Competitive Seasonal League) Screen**: Dedicated screen showing RP, upcoming tournaments (placeholder), and career earnings.
-   **Season System Overhaul**: Redesigned to use a fixed global schedule, ending every 2 weeks on Wednesdays at 11:59 PM Eastern time, with DST-aware calculations.
-   **Game Board**: 9x7 dimensions, Connect 4 win condition.

## External Dependencies

-   **React**: Frontend library.
-   **TypeScript**: Type-safe development.
-   **Vite**: Build tool and development server.
-   **TailwindCSS**: Utility-first CSS framework.
-   **Radix UI**: Accessible UI primitives.
-   **date-fns**: Date manipulation utilities.
-   **nanoid**: Unique ID generation.
-   **Express.js**: Backend server framework (serves static files).
-   **Drizzle ORM & Neon Database**: Configured for PostgreSQL, but not actively utilized; data is stored in `localStorage`.

## Replit Environment Setup

### Development Setup (Completed - October 4, 2025)

The project has been successfully imported from GitHub and configured for the Replit environment:

- **Workflow**: "Start Game" workflow configured to run `npm run dev` on port 5000 with webview output
- **Dev Server**: Vite dev server properly configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy support
- **Backend**: Express server serves both API routes and frontend, listening on 0.0.0.0:5000 with `reusePort: true`
- **Deployment**: Autoscale deployment configured with `npm run build` and `npm run start`
- **API Routes**: `/api/featured-items` endpoints for managing featured shop items
- **Assets**: Textures (asphalt.png, grass.png, sand.jpg, sky.png, wood.jpg) and sounds (background.mp3, hit.mp3, success.mp3) available in `client/public/`
- **Database**: Drizzle ORM configured but not required; app uses localStorage for data persistence
- **Dependencies**: All npm packages installed and up to date

### Running the Project

- **Development**: Use the "Start Game" workflow or run `npm run dev` - Server runs on port 5000
- **Production Build**: Run `npm run build` followed by `npm run start`
- **Type Checking**: Run `npm run check`

### Project Status

✅ GitHub import completed and verified
✅ All dependencies installed
✅ Development server running successfully
✅ Frontend loads and displays correctly
✅ Deployment configuration ready

### Recent Updates (October 5, 2025)

**Profile Picture (PFP) System Implementation**
- Created PFP infrastructure: `pfps.json` with 10 initial PFPs, `pfpManager.ts` utility
- Added PFP to player data types: `ownedPfps`, `equippedPfp` fields with localStorage persistence
- Integrated PFP display: Circular overlays on banners in main menu and game screen
- Enhanced inventory system: New PFP tab with search, rarity filtering, and instant equipping
- Shop & crate integration: PFPs available in crates and future shop rotations
- Item notifications: PFP support in Rocket League-style unlock popups
- News announcement: Added PFP feature announcement to news feed (10/5/2025)

**UX Improvements**
- Inventory items now equip on click (removed scroll-to-equip requirement)
- Tooltips show instantly on hover (removed delay)
- Banner items have consistent sizing in inventory
# Connect Ranked - A Competitive Connect 4 Game

## Overview

Connect Ranked is a single-player competitive Connect 4 game against AI opponents, designed to simulate a multiplayer ranked experience. It features a comprehensive trophy-based ranking system with seasonal resets, an in-game shop for cosmetic titles and banners, and a dynamic leaderboard. The game focuses on local data persistence and offers a progression-based experience with evolving AI competitors, including varied play styles and adaptive counter-play. The project aims to provide an engaging and strategic Connect 4 experience with long-term player progression.

## Replit Environment Setup (October 2, 2025)

This project has been successfully imported and configured for the Replit environment:

- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Express.js serving Vite dev server on port 5000
- **Host Configuration**: Configured with `allowedHosts: true` in vite middleware to work with Replit's proxy
- **Database**: PostgreSQL database provisioned and schema pushed successfully (users table configured)
- **Data Persistence**: Currently uses localStorage; database available for future backend features
- **Dependencies**: All npm packages installed successfully
- **Workflow**: "Start Game" workflow configured to run `npm run dev` on port 5000 with webview output
- **Deployment**: Configured for autoscale deployment with build and start scripts

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application utilizes React with TypeScript, styled using TailwindCSS for a custom dark theme. UI components are built using Radix UI for accessibility. Cosmetic systems include:
-   **Titles**: Text displayed under player usernames, categorized as Ranked (season), Tournament, Leaderboard, and Shop. AI opponents also display titles.
-   **Banners**: 150x50 PNG images displayed behind usernames in menus and during matches, available as Default, Shop (purchasable), and Ranked (season rewards). AI opponents use shop banners and ranked banners from previous seasons only. An Inventory screen manages both.
-   The game board has been expanded to 9x7 for increased strategic depth.

### Technical Implementations

The frontend is built with React 18 and Vite. State management relies on local component state and `localStorage` for all data persistence. Navigation uses a simple screen-based system. The backend uses Express.js but currently serves static files, with game logic operating entirely client-side. A mock `IStorage` interface with a `MemStorage` implementation exists, designed for future database integration.

### Feature Specifications

-   **AI System**: Difficulty-based AI (1-10 levels) scales with player trophies, employing minimax-like strategies, pattern recognition, and adaptive counter-play. AI "thinking" includes variable delays and strategic diversity, with rank-based blocking probabilities (67%-98%).
-   **Ranking System**: Features 23 ranks across Bronze to Connect Legend, based on trophies (0-701+). Seasonal resets occur every two weeks with trophy adjustments and coin rewards based on final rank.
-   **Tournament System**: Occurs every 10 minutes with a 16-player single-elimination bracket (15 AI, 1 player). Rounds 1-3 are Best of 3, Finals Best of 5. Offers coin prizes and exclusive tournament titles based on rank and number of wins. Opponent matching is strictly within ±150 trophy range.
    -   **Auto-Registration Fix** (Oct 2, 2025): Fixed bug where players were automatically re-registered for new tournaments. Participants array is now properly cleared when tournaments complete.
    -   **Tournament Navigation** (Oct 2, 2025): Added back button to tournament screen for improved navigation.
    -   **AI Match Simulation** (Oct 2, 2025): Tournaments now continue autonomously via AI simulation even after player elimination. Tournament status remains 'in_progress' until finals winner is determined, allowing players to observe the bracket completion.
-   **Queue System**: Simulated matchmaking with variable queue times (2-15 seconds) and opponent generation with similar trophy counts (±30 variance).
-   **Match System**: Best-of-3 format with a 15-second turn timer. Dynamic trophy rewards/penalties based on opponent rank, win streaks, and game speed. Includes XP, level progression, and coin rewards.
-   **Shop System**: Rotates 3 titles and 3 banners every 12 hours for in-game currency purchase.
    -   **Featured Items** (Oct 2, 2025): Added Featured Items section with time-based exclusivity (hours/days/weeks). Featured items are stored separately with localStorage persistence and automatic expiry. Console helper available: `window.addFeaturedItem(item, expiryHours)`.
-   **Game Board**: 9x7 dimensions, Connect 4 win condition.

## External Dependencies

-   **React**: Frontend library.
-   **TypeScript**: Type-safe development.
-   **Vite**: Build tool and development server.
-   **TailwindCSS**: Utility-first CSS framework.
-   **Radix UI**: Accessible UI primitives.
-   **date-fns**: Date manipulation utilities.
-   **nanoid**: Unique ID generation.
-   **Express.js**: Backend server framework (currently serves static files).
-   **Drizzle ORM & Neon Database**: Configured for PostgreSQL, but not actively utilized; data is stored in `localStorage`.
-   **React Three Fiber & Drei**: Infrastructure for 3D graphics, but not actively used.
-   **TanStack Query**: Configured for data fetching, but not actively used.
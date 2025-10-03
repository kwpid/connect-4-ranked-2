# Connect Ranked - A Competitive Connect 4 Game

## Overview

Connect Ranked is a single-player competitive Connect 4 game against AI opponents, designed to simulate a multiplayer ranked experience. It features a comprehensive trophy-based ranking system with seasonal resets, an in-game shop for cosmetic titles and banners, and a dynamic leaderboard. The game focuses on local data persistence and offers a progression-based experience with evolving AI competitors, including varied play styles and adaptive counter-play. The project aims to provide an engaging and strategic Connect 4 experience with long-term player progression.

## Replit Environment Setup

### Latest Import: October 3, 2025 (Fresh GitHub Clone)

This project has been successfully imported from GitHub and configured for the Replit environment:

- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Express.js serving Vite dev server on port 5000
- **Host Configuration**: ✅ Already configured with `allowedHosts: true` in vite middleware (server/vite.ts) to work with Replit's proxy
- **Vite Configuration**: ✅ Already configured with `host: "0.0.0.0"` and `port: 5000` (vite.config.ts)
- **Server Configuration**: ✅ Binds to `0.0.0.0:5000` with `reusePort: true` for production readiness
- **Data Persistence**: Uses localStorage; PostgreSQL database available but not currently utilized
- **Dependencies**: All npm packages installed and up to date (612 packages)
- **Workflow**: "Start Game" workflow configured to run `npm run dev` on port 5000 with webview output
- **Deployment**: ✅ Configured for autoscale deployment with build (`npm run build`) and start (`npm run start`) scripts
- **Status**: ✅ Application running successfully, all systems operational

### Import Configuration Notes

The project came pre-configured with proper Replit settings:
- Vite dev server already set to allow all hosts (required for Replit's proxy iframe)
- Server already using `0.0.0.0` binding for external access
- Port 5000 correctly configured throughout the stack
- No additional configuration changes were needed

### Recent Updates: October 3, 2025 (Evening)

- **Title Display Consistency**: Simplified title sizing from variable multi-tier system to a single consistent 12px (`text-xs`) size for all titles. This eliminates inconsistent sizing issues and provides a cleaner, more professional appearance across all screens.

- **Season System Overhaul**: Completely redesigned season system to use fixed global schedule instead of local-data-based calculations:
  - **Fixed Schedule**: Seasons now end every 2 weeks on Wednesdays at 11:59 PM Eastern time
  - **Starting Season**: Set to Season 2 (Season 1 ended Oct 1, 2025 at 11:59 PM EDT)
  - **DST Handling**: Implemented DST-aware calculation that properly handles timezone transitions
    - Uses iterative boundary calculation with Eastern timezone rules
    - Each season boundary is calculated individually to account for EDT (UTC-4) vs EST (UTC-5)
    - Seasons that cross DST boundaries correctly gain/lose 1 hour while maintaining 11:59 PM Eastern end time
  - **Season Schedule**:
    - Season 2: Oct 1 - Oct 15, 2025
    - Season 3: Oct 15 - Oct 29, 2025
    - Season 4: Oct 29 - Nov 12, 2025 (crosses DST boundary on Nov 2)
    - Future seasons continue every 14 days on this schedule

### Earlier Fixes: October 3, 2025 (PM)

- **Season System Bug Fix**: Fixed critical bug in season calculation where seasons were only lasting 4 days instead of 14 days. Seasons now properly span 2 weeks and automatically transition to the next season when they end.
- **Season Reset Improvements**: Enhanced season reset logic to properly handle leaderboard AI. Top 30 leaderboard AI now reset to exactly 701 trophies when a season ends, while other AI reset to their rank minimum. Tournament season wins (`currentSeasonWins`) are properly reset to 0, and tournament titles automatically use the current season number.
- **Title Display Enhancement**: Titles now render within the banner component itself (properly layered on top of the banner image) instead of being positioned outside with negative margin, improving visibility and layout consistency across all screens.

### Previous Setup: October 2, 2025

- PostgreSQL database was provisioned and schema pushed successfully (users table configured)
- Database available for future backend features

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application utilizes React with TypeScript, styled using TailwindCSS for a custom dark theme. UI components are built using Radix UI for accessibility. Cosmetic systems include:
-   **Titles**: Text displayed under player usernames in ALL CAPS format, categorized as Ranked (season), Tournament, Leaderboard, and Shop. AI opponents also display titles. Positioned underneath username within banner area.
-   **Banners**: 150x50 PNG images displayed behind usernames in menus and during matches, enlarged by 25% (62px height), available as Default, Shop (purchasable), and Ranked (season rewards). AI opponents use shop banners and ranked banners from previous seasons only. An Inventory screen manages both.
-   The game board has been expanded to 9x7 for increased strategic depth.
-   **Clean UI**: Inventory and Tournament buttons display without emoji decorations for a cleaner interface.

### Technical Implementations

The frontend is built with React 18 and Vite. State management relies on local component state and `localStorage` for all data persistence. Navigation uses a simple screen-based system. The backend uses Express.js but currently serves static files, with game logic operating entirely client-side. A mock `IStorage` interface with a `MemStorage` implementation exists, designed for future database integration.

### Feature Specifications

-   **AI System**: Difficulty-based AI (1-10 levels) scales with player trophies, employing minimax-like strategies, pattern recognition, and adaptive counter-play. AI "thinking" includes variable delays and strategic diversity, with rank-based blocking probabilities (67%-98%).
-   **Ranking System**: Features 23 ranks across Bronze to Connect Legend, based on trophies (0-701+). Seasonal resets occur every two weeks with trophy adjustments and coin rewards based on final rank.
-   **Tournament System**: Occurs every 10 minutes with a 16-player single-elimination bracket (15 AI, 1 player). Rounds 1-3 are Best of 3, Finals Best of 5. Offers coin prizes and exclusive tournament titles based on rank and number of wins. Opponent matching is strictly within ±150 trophy range.
    -   **Auto-Registration Fix** (Oct 2, 2025): Fixed bug where players were automatically re-registered for new tournaments. Participants array is now properly cleared when tournaments complete.
    -   **Tournament Navigation** (Oct 2, 2025): Added back button to tournament screen for improved navigation.
    -   **AI Match Simulation** (Oct 2, 2025): Tournaments now continue autonomously via AI simulation even after player elimination. Tournament status remains 'in_progress' until finals winner is determined, allowing players to observe the bracket completion.
-   **Queue System**: Realistic matchmaking with trophy-based queue times (2-8s for low trophies, 40-60s for high trophies) with time-of-day variance. Opponent generation with similar trophy counts (±30 variance).
-   **Match System**: Best-of-3 format with a 15-second turn timer. Dynamic trophy rewards/penalties based on opponent rank, win streaks, and game speed. Includes XP, level progression, and balanced coin rewards (17-25 for wins, 10-16 for losses).
-   **Shop System**: Rotates 3 titles and 3 banners every 12 hours for in-game currency purchase.
    -   **Featured Items** (Oct 2-3, 2025): Featured Items section with time-based exclusivity. Items are stored in `client/public/data/featured-items.json` and loaded directly by the client without API calls. The system automatically looks up item details and calculates expiry times.
    -   **Editing Featured Items**: Simply specify the item ID and duration in `client/public/data/featured-items.json`. The system automatically looks up all item details. Examples:
        ```json
        [
          {
            "itemId": "13",
            "duration": "48h",
            "addedAt": 1759448581279
          },
          {
            "itemId": "grey_veteran",
            "duration": "24h",
            "addedAt": 1759448590387
          }
        ]
        ```
        - For banners: use banner ID (e.g., "13" or "banner_13")
        - For titles: use title ID (e.g., "grey_veteran", "grey_champion")
        - Duration format: "24h" (hours), "7d" (days), "2w" (weeks)
        - `addedAt`: timestamp when added (use `Date.now()` in JavaScript)
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
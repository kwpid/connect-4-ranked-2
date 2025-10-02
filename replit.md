# Connect Ranked - A Competitive Connect 4 Game

## Overview

Connect Ranked is a competitive Connect 4 game built as a single-player experience against AI opponents. The application features a comprehensive ranked system with trophies, seasonal resets, an in-game shop for cosmetic titles, and a leaderboard system. The game is designed to provide a progression-based experience with local data persistence, simulating a competitive multiplayer environment through AI competitors that evolve over time.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 2, 2025 (Tournament System Added):**
- **Comprehensive Tournament System Implementation:**
  - Tournaments occur every 10 minutes with 3-minute registration window
  - 16-player single-elimination bracket (15 AI, 1 player)
  - Rounds 1-3 are Best of 3, Finals are Best of 5
  - Prize structure: Top 8 (2,500 coins), Top 4 (5,000 coins), Winner (10,000 coins + title)
  - Tournament winner titles based on current rank with special colors:
    - Regular ranks: Grey (1 win), Green (3+ wins)
    - Grand Champion: Red (1 win), Gold (3+ wins)
    - Connect Legend: White (1 win), Pink (3+ wins)
  - Anti-cheat: Leaving tournament = no rewards + penalty
  - Console cheat code: `startTournament()` for testing
  - Can't queue for regular games while registered for tournament
  - AI opponents can display tournament titles from current/previous seasons
  - Updated queue times with more randomness (±5s variance, 10% spike chance)
  - Practice button moved to smaller grid layout with Leaderboard
  - Tournament button appears on main menu during registration/active tournaments

**October 2, 2025 (Import Complete):**
- **GitHub Import Successfully Configured for Replit:**
  - All dependencies installed successfully (611 packages)
  - Development server configured and running on port 5000
  - Frontend (Vite + React) and Backend (Express) integrated correctly
  - Vite dev server already properly configured with `allowedHosts: true` for Replit proxy
  - Server binding to `0.0.0.0:5000` for frontend accessibility
  - Production build tested and working (vite build + esbuild for server)
  - Deployment configuration set to autoscale with build and start scripts
  - Application fully functional - Connect 4 game loads and displays correctly
  - Updated .gitignore with comprehensive Node.js patterns

**October 1, 2025 (Latest Update):**
- **Improved AI threat detection for high-trophy opponents:**
  - AI now detects and blocks horizontal, vertical, and diagonal threats before they become critical
  - High-difficulty AI (Platinum+) can now see when player has 2-3 pieces in a row and prioritizes blocking
  - Fixes exploit where players could build winning lines by placing pieces in columns 3, 4, 5, 6
  - AI evaluates threat severity: 3-in-a-row (critical), 2-in-a-row (dangerous), 1-in-a-row (minor)
  - Advanced blocking kicks in at difficulty level 5+ (Platinum rank and above in ranked, Good/Professional in practice)

**October 1, 2025 (Earlier):**
- **Expanded rank system from 3 to 5 divisions per rank:**
  - All ranks now have 5 divisions (I, II, III, IV, V) except Connect Legend
  - Bronze: I-V (0-50 trophies, 10 per division)
  - Silver: I-V (51-100 trophies, 10 per division)
  - Gold: I-V (101-175 trophies, 15 per division)
  - Platinum: I-V (176-275 trophies, 20 per division)
  - Diamond: I-V (276-400 trophies, 25 per division)
  - Champion: I-V (401-550 trophies, 30 per division)
  - Grand Champion: I-V (551-700 trophies, 30 per division)
  - Connect Legend: 701+ trophies (max rank)
- **Updated season title format to ALL CAPS:**
  - Season titles now display as "S# CONNECT LEGEND", "S# GRAND CHAMPION", "S# CHAMPION"
  - Title requirements updated: Grand Champion at 551+ trophies, Connect Legend at 701+ trophies
- **Enhanced game display with opponent information:**
  - Opponent trophies now shown during matches
  - Opponent titles displayed based on their rank (higher ranks show season/leaderboard titles)
  - Titles color-coded by tier for visual distinction
- **Added rank display and rank-up animation to end screen:**
  - Player's current rank shown at bottom of match end screen
  - Animated rank-up celebration when player advances to a new rank
  - Rank displayed in tier-appropriate colors

**October 1, 2025 (Earlier):**
- Changed leaderboard system from top 100 to top 30 players
- Updated seasonal reward titles to reflect top 30 instead of top 100
- Removed AI opponent references from settings screen
- Implemented rank-based AI blocking probability:
  - Lower ranks (Bronze-Gold): 67% chance to block winning moves
  - Mid ranks (Platinum): 80% chance to block
  - High ranks (Diamond-Champion): 90% chance to block
  - Top ranks (Grand Champion-Legend): 98% chance to block
- Added title display system on leaderboard:
  - Players' equipped titles show under their usernames
  - AI opponents receive random titles based on their trophy count
  - Lower rank AIs get grey titles or no title
  - Higher rank AIs get prestigious season/leaderboard titles
- Enhanced leaderboard page with season information panel:
  - Current season number display
  - Time remaining in current season
  - Player's current rank and trophy count
  - Player's leaderboard position (if in top 30)
- Updated button symbols:
  - Removed emoji from "Find Match" button
  - Changed Settings symbol to "⋮"
  - Kept trophy emoji only on Leaderboard button
- Overhauled trophy reward system with rank-based calculations:
  - Base rewards: 2 trophies for lower-ranked opponent, 3 for equal rank, 4 for slightly higher, 5 for much higher
  - Win streak bonus: +1 trophy for 3+ win streak
  - Fast win bonus: +1 trophy for wins in under 20 moves
  - Loss penalties: -2 for equal/higher rank, -3 for lower rank, -4 for much lower rank
- Trophy changes now displayed at match end screen
- Queue screen improvements:
  - Removed progress bar for more realistic appearance
  - Added animated "Searching for opponent..." message with cycling dots
  - Shows elapsed time instead of estimated time

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- TailwindCSS for styling with a custom dark theme
- Radix UI components for accessible, pre-built UI primitives
- React Three Fiber (@react-three/fiber) for 3D graphics capabilities (though not actively used in current implementation)

**Component Structure:**
The application follows a screen-based architecture with distinct views:
- **Menu System**: Main menu, title selector, settings
- **Game Flow**: Queue screen, game board, match system
- **Progression**: Top 30 leaderboard with season info, rank info, statistics, shop
- **UI Components**: Reusable shadcn/ui components built on Radix UI

**Title System:**
- Cosmetic titles that appear under player usernames
- Three types: grey (shop-purchased), season (rank-based rewards), leaderboard (placement rewards)
- Players can equip one title at a time
- AI opponents on leaderboard display random titles based on their trophy tier

**State Management:**
- Local component state using React hooks (useState, useEffect)
- No global state management library; state is lifted and passed through props
- localStorage is used for all persistence needs

**Routing:**
The application uses a simple screen-based navigation system managed by a `Screen` type rather than a traditional router. The main App component controls which screen is displayed.

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server
- Development mode uses Vite middleware for hot module replacement
- Production mode serves static built files

**Storage Interface:**
The backend implements an `IStorage` interface with a `MemStorage` implementation:
- Currently uses in-memory storage with a Map-based structure
- Designed to be swappable with a database implementation
- User CRUD operations defined (getUser, getUserByUsername, createUser)
- **Note**: The storage layer is defined but not actively used since the game operates entirely client-side with localStorage

**API Structure:**
Routes are registered through a `registerRoutes` function, but the current implementation doesn't define any API endpoints. The game operates entirely on the client side.

### Data Storage Solutions

**Local Storage Strategy:**
All game data is persisted to browser localStorage with the following keys:
- `connect_ranked_player`: Player profile, stats, trophies, titles, coins
- `connect_ranked_ai`: AI competitor data for leaderboard simulation
- `connect_ranked_season`: Current season metadata
- `connect_ranked_shop`: Shop rotation timestamp
- `connect_ranked_last_check`: Last season reset check timestamp

**Database (Drizzle ORM):**
- Configured for PostgreSQL with Drizzle ORM
- Schema defined in `shared/schema.ts` with a basic users table
- Neon Database (@neondatabase/serverless) for serverless Postgres
- **Current Status**: Database infrastructure is set up but not utilized; all data is localStorage-based

**Rationale**: The localStorage approach was chosen for simplicity and to avoid backend dependencies. The database setup exists for future expansion if server-side persistence becomes necessary.

### Game Logic Architecture

**AI System:**
- Difficulty-based AI that scales with player trophy count (1-10 difficulty levels)
- Implements minimax-like strategy for move selection
- AI "thinks" with variable delays to simulate human behavior
- Rank-based blocking probability: lower ranks have 67% chance to block winning moves, increasing to 98% for top ranks
- Strategic positioning and center-column preference for higher difficulties

**Ranking System:**
- 23 distinct ranks from Bronze I to Connect Legend
- Trophy-based progression (0-400+ trophies)
- Seasonal resets every 2 weeks (Monday 12pm EST to Wednesday 12pm EST, 2 weeks later)
- Trophy reset mechanics based on current rank
- Season rewards in coins based on final rank

**Queue System:**
- Simulated matchmaking with time-of-day variance
- Queue times scale with trophy count (higher ranks = longer queues)
- Realistic timing simulation (2-15 seconds typical)

**Match System:**
- Best-of-3 format
- 15-second turn timer with random move on timeout
- Dynamic trophy system based on opponent rank comparison:
  - Wins: 2-7 trophies (base 2-5 plus bonuses for win streaks and fast wins)
  - Losses: -2 to -4 trophies (higher penalty for losing to lower-ranked opponents)
- Opponents generated with similar trophy counts (±30 trophies variance)
- XP and level progression
- Coin rewards for match completion
- Rank-based titles automatically awarded when winning at Grand Champion or Connect Legend ranks

### External Dependencies

**Third-Party Libraries:**
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **TailwindCSS**: Utility-first CSS framework for styling
- **React Three Fiber & Drei**: 3D rendering capabilities (infrastructure present but unused)
- **TanStack Query**: Data fetching and caching (configured but not actively used)
- **Drizzle ORM**: Type-safe ORM for database operations (configured but not connected)
- **Neon Database**: Serverless PostgreSQL (configured but not utilized)
- **date-fns**: Date manipulation utilities for season timing
- **nanoid**: Unique ID generation

**Development Tools:**
- TypeScript for type safety
- ESBuild for production bundling
- tsx for TypeScript execution in development
- Vite plugins for error overlays and GLSL shader support

**Notable Design Decision**: The application includes infrastructure for 3D graphics, advanced data fetching, and database persistence, but currently operates as a simpler localStorage-based game. This suggests either future feature planning or template-based initialization.
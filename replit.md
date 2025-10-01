# Connect Ranked - A Competitive Connect 4 Game

## Overview

Connect Ranked is a competitive Connect 4 game built as a single-player experience against AI opponents. The application features a comprehensive ranked system with trophies, seasonal resets, an in-game shop for cosmetic titles, and a leaderboard system. The game is designed to provide a progression-based experience with local data persistence, simulating a competitive multiplayer environment through AI competitors that evolve over time.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Progression**: Leaderboard, rank info, statistics, shop
- **UI Components**: Reusable shadcn/ui components built on Radix UI

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
- Difficulty-based AI that scales with player trophy count
- Implements minimax-like strategy for move selection
- AI "thinks" with variable delays to simulate human behavior
- Checks for winning moves, blocking moves, and strategic positioning

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
- Win/loss affects trophy count (+2 for win, -1 for loss in most ranks)
- XP and level progression
- Coin rewards for match completion

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
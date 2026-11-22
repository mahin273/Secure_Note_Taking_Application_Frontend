# Secure Note-Taking Application — Frontend Client

A modern, responsive Single Page Application (SPA) built with React 18, TypeScript, and Vite. Engineered to provide an intuitive interface for secure note-taking, role-based access control, and real-time visualization of MongoDB aggregation pipelines.

---

## Live Deployment & Demo Credentials

- **Live Frontend (Vercel):** [https://securenotes-seven.vercel.app](https://securenotes-seven.vercel.app)
- **Live Backend API (Render):** [https://secure-note-taking-application-backend-3muw.onrender.com](https://secure-note-taking-application-backend-3muw.onrender.com)
- **API Health Check:** [https://secure-note-taking-application-backend-3muw.onrender.com/api/health](https://secure-note-taking-application-backend-3muw.onrender.com/api/health)

### Evaluation Accounts

The login page (`/login`) includes quick-fill buttons for immediate evaluation:

| Account | Email | Password | Role | Permissions & Capabilities |
|---|---|---|---|---|
| **System Admin** | `admin@example.com` | `AdminPassword123!` | `admin` | Full platform access: user management, global notes audit, interests report |
| **User 1 (Alice)** | `user1@example.com` | `UserPassword123!` | `user` | Personal note creation/editing, viewing public feed, profile posts |
| **User 2 (Bob)** | `user2@example.com` | `UserPassword123!` | `user` | Isolated personal notes, community posts authoring |

---

## Key Features

### 1. Secure Authentication & Role-Based Access Control (RBAC)
- **JWT Session Persistence:** Secure client-side token storage with automatic `Bearer` token injection on all protected requests.
- **Client Route Guards:** Protected routes automatically redirect unauthenticated users to `/login`. Non-admin users attempting to access `/admin/*` routes are gracefully redirected.
- **Session Expiration Interceptor:** Global HTTP 401 interceptor automatically purges expired tokens and prompts for re-authentication without application crashes.

### 2. Private Personal Notes Management
- **Full CRUD:** Create, read, edit (via dedicated patch view), and delete notes.
- **Cursor Pagination:** Infinite scroll / "Load More" cursor pagination based on MongoDB `_id` timestamps (`GET /api/notes?limit=10&after=<id>`), ensuring stable pagination without offset drift.
- **Privacy Enforcement:** Notes are strictly private to the creator; users cannot access other users' personal notes.

### 3. Community Posts & Public Profiles
- **Public Feed:** Community feed accessible to all visitors. Authenticated users can publish posts bound to their user ID.
- **Scenario 2 Aggregation View:** Clicking any post author opens their profile view (`/users/:id/posts`), powered by a single MongoDB `$lookup` pipeline joining user details and their recent posts in a single round-trip.

### 4. Administrative Suite
- **User Directory & Provisioning:** Searchable user roster with capability to provision both standard users and new administrators.
- **Multi-Collection Cascade Deletion:** Deleting a user safely triggers atomic deletion across associated notes and posts.
- **Platform-Wide Notes Audit:** Inspect all platform notes with an instant **Filter by Owner ID** feature.
- **Scenario 1 Interests Aggregation Report:** Visualizes MongoDB aggregation grouping users by interest clusters with server-side pagination and real-time interest search.

---

## Technical Stack & Architecture

| Layer | Technology | Rationale |
|---|---|---|
| **Core Framework** | React 18 + TypeScript | Strict static typing, concurrent rendering, and clean functional architecture |
| **Bundler & Tooling** | Vite | Instant Hot Module Replacement (HMR) and optimized Rollup production builds |
| **Routing** | React Router v6 | Declarative client-side routing, protected layouts, and dynamic URL params |
| **Styling** | Semantic CSS | Clean, native HTML5 semantics (`<nav>`, `<main>`, `<table>`, `<form>`) with zero external CSS runtime overhead |
| **HTTP Client** | Native Browser Fetch | Standardized request wrapper with automatic JSON serialization and unified error mapping |
| **State Management** | React Context API | Lightweight auth state without heavy third-party state library overhead |

---

## Project Structure

```
frontend/
├── index.html                # Application entry HTML
├── package.json              # Project dependencies and build scripts
├── tsconfig.json             # Strict TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
├── vercel.json               # SPA client-side routing rewrites for Vercel
└── src/
    ├── main.tsx              # DOM mounting and root provider hierarchy
    ├── App.tsx               # Top-level route definitions and navigation header
    ├── styles.css            # Semantic, responsive styling rules
    ├── api/
    │   └── client.ts         # Centralized HTTP client (auth headers, error handling)
    ├── context/
    │   └── AuthContext.tsx   # Authentication context provider and hooks
    ├── components/
    │   └── ProtectedRoute.tsx # Route gating for authenticated and role-restricted views
    └── pages/
        ├── Login.tsx         # User authentication with demo account quick-fill
        ├── Register.tsx      # User registration with interest tagging
        ├── Notes.tsx         # Personal notes list and note creation dashboard
        ├── NoteEdit.tsx      # Note modification view
        ├── Posts.tsx         # Public community posts feed and post creation
        ├── UserProfilePosts.tsx # Scenario 2 $lookup user profile & recent posts
        ├── AdminUsers.tsx    # Admin user management and cascade deletion
        ├── AdminNotes.tsx    # Admin platform-wide notes audit with owner filtering
        └── InterestsReport.tsx # Scenario 1 interests aggregation report
```

---

## Local Setup & Development

### Prerequisites
- Node.js $\ge$ 18.x
- Backend API running on `http://localhost:3005` (or live Render URL)

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `frontend` root:
```bash
cp .env.example .env
```
Default content:
```env
VITE_API_URL=http://localhost:3005/api
```
*(To point to production, set `VITE_API_URL=https://secure-note-taking-application-backend-3muw.onrender.com/api`)*

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on **`http://localhost:5174`**.

### 4. Production Build
```bash
npm run build
npm run preview
```
Compiles TypeScript, runs Vite asset optimization, and serves the production bundle from `dist/`.

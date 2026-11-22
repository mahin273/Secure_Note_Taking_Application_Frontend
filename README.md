# Secure Note-Taking Application — Frontend Client

A minimalist, high-performance React Single Page Application (SPA) hand-crafted for the Secure Note-Taking technical assessment. Built with TypeScript, Vite, React Router, and a single 20-line semantic stylesheet without relying on CLI generators, component libraries, or external state managers.

---

## 1. Architectural Principles & Constraints Compliance

This frontend was developed under strict problem statement directives:
> *"DO NOT USE ANY TEMPLATES. DO NOT waste time improving the frontend. This is a backend task."*

- **Zero Scaffolding Templates:** Built completely from scratch (`index.html`, `vite.config.ts`, `tsconfig.json`, `package.json` authored by hand). No `create-vite` or `create-react-app` opinionated bloat.
- **Strict Dependency Whitelist:** Strictly restricted to 8 whitelisted packages:
  - **Runtime (3):** `react`, `react-dom`, `react-router-dom`
  - **Development (5):** `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`
- **Zero Banned Libraries:**
  - ❌ No CSS frameworks (Tailwind, Bootstrap, Bulma)
  - ❌ No component libraries (MUI, Chakra, Radix, shadcn)
  - ❌ No icon packs (Lucide, FontAwesome, React Icons)
  - ❌ No HTTP clients (Axios) — uses native browser `fetch`
  - ❌ No external state libraries (Redux, Zustand, MobX, TanStack Query) — uses native React Context
- **Single 20-Line Semantic Stylesheet:** Hand-crafted in `src/styles.css` (well below the 60-line upper boundary). Pure native semantic HTML controls (`<form>`, `<table>`, `<nav>`, `<input>`, `<button>`, `<textarea>`).

---

## 2. Dependency Audit Matrix

| Package Name | Category | Version | Justification |
|---|---|---|---|
| `react` | Runtime | `^18.3.1` | Core UI rendering engine |
| `react-dom` | Runtime | `^18.3.1` | DOM renderer for React |
| `react-router-dom` | Runtime | `^6.28.0` | Client-side routing, navigation, and protected route gating |
| `vite` | Dev | `^5.4.11` | Build toolchain, fast HMR dev server, Rollup bundler |
| `@vitejs/plugin-react` | Dev | `^4.3.4` | Vite plugin for React Fast Refresh and JSX transformation |
| `typescript` | Dev | `^5.6.3` | Type-safe static analysis and compilation |
| `@types/react` | Dev | `^18.3.12` | TypeScript definitions for React |
| `@types/react-dom` | Dev | `^18.3.1` | TypeScript definitions for React DOM |

---

## 3. Directory Structure

```
frontend/
├── .env.example              # Environment variables template
├── .gitignore                # Ignores node_modules, dist, .env, and non-README markdown
├── index.html                # Hand-crafted HTML5 entry point
├── package.json              # Strict whitelist-only dependencies
├── tsconfig.json             # Strict TypeScript compiler options
├── vite.config.ts            # Minimal Vite configuration (Port 5174)
└── src/
    ├── main.tsx              # DOM mounting and root provider wrapper
    ├── App.tsx               # Route definitions and dynamic navigation header
    ├── styles.css            # Single 20-line semantic stylesheet
    ├── vite-env.d.ts         # TypeScript declarations for import.meta.env
    ├── api/
    │   └── client.ts         # Native fetch wrapper (Bearer injection, 401 interceptor)
    ├── context/
    │   └── AuthContext.tsx   # Native React Context (token persistence, role state)
    ├── components/
    │   └── ProtectedRoute.tsx # Route guard enforcing authentication and RBAC
    └── pages/
        ├── Login.tsx         # Account authentication
        ├── Register.tsx      # User registration with interests
        ├── Notes.tsx         # Notes dashboard, creation, and cursor pagination
        ├── NoteEdit.tsx      # Dedicated note updater via PATCH
        ├── AdminUsers.tsx    # Admin users table, user provisioning, cascade deletion
        ├── AdminNotes.tsx    # Global notes inspection with owner filter
        ├── InterestsReport.tsx # Scenario 1 interests aggregation report
        ├── Posts.tsx         # Public posts community feed
        └── UserProfilePosts.tsx # Scenario 2 $lookup user profile & recent posts
```

---

## 4. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3005/api` | Target URL of the backend Express REST API |

---

## 5. Quickstart Guide

### Prerequisites
- Node.js $\ge$ 18.x
- Backend REST API running on `http://localhost:3005` (with MongoDB active)

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Starts the Vite dev server on **`http://localhost:5174`** (configured to avoid standard port 5173 collisions).

### Production Build & Preview
```bash
npm run build     # Runs type checking (tsc) and generates production dist/
npm run preview   # Previews production build locally
```

---

## 6. Reviewer Evaluation Guide

The frontend provides an interactive verification interface for all backend requirements:

### A. Authentication & RBAC
1. Navigate to `/login` to authenticate.
   - **Demo Accounts Card:** The login page includes a quick-fill demo card with 1-click login buttons for **Admin**, **User 1 (Alice)**, and **User 2 (Bob)** for fast evaluator testing.
   - **User Role:** Grants access to `/notes` and `/posts`. Restricts access to administrative endpoints (redirects to `/notes`).
   - **Admin Role:** Logs in using administrative credentials (`admin@example.com` / `AdminPassword123!`), displaying administrative navigation pills: *Admin Users*, *Admin Notes*, and *Interests Report*.
2. Navigate to `/register` to create a new user profile with interests.

### B. User Notes & Cursor Pagination
1. Navigate to `/notes`.
2. Create notes using the top creation form. Notice newly drafted notes prepend immediately to the top of the list without triggering a full page refetch.
3. If more than 10 notes exist, click **"Load More Notes"**. The client issues `GET /api/notes?limit=10&after=<cursor>`, appending subsequent batches seamlessly.
4. Click **"Edit"** to modify note content on `/notes/:id` via `PATCH /api/notes/:id`.
5. Click **"Delete"** to remove the note via `DELETE /api/notes/:id`.

### C. Admin Users & Multi-Collection Cascade Deletion
1. Log in as an administrator and navigate to `/admin/users`.
2. Inspect the user roster in a semantic HTML `<table>`.
3. Provision new accounts selecting either `user` or `admin` role.
4. Click **"Delete"** on any user row. Confirm the prompt to observe atomic multi-collection cascade deletion (`Note.deleteMany` $\rightarrow$ `Post.deleteMany` $\rightarrow$ `User.findByIdAndDelete`).

### D. Admin Platform Notes & Owner Filtering
1. Navigate to `/admin/notes`.
2. View platform-wide notes.
3. Paste a specific User ID into the **Filter by Note Owner** box and click **Filter**. The backend uses compound Index #3 (`{ owner: 1, _id: -1 }`) to return only that user's notes.
4. Click **Reset Filter** to return to whole-database cursor pagination backed by the default primary key index `_id_`.

### E. Scenario 1 Aggregation Report
1. Navigate to `/reports/interests`.
2. Visualizes the single `User.aggregate()` pipeline (`$unwind` $\rightarrow$ `$group` $\rightarrow$ `$facet`).
3. Displays interest clusters, total user counts per interest, and associated user emails and IDs.
4. Filter by interest string (e.g. `Tech`) using the search bar to engage multikey Index #2 (`{ interests: 1 }`).
5. Use **Previous** and **Next** buttons to navigate through aggregated report pages.

### F. Scenario 2 Aggregation & Public Posts
1. Navigate to `/posts` as a guest or authenticated user.
2. Read community posts with cursor-based pagination. Logged-in users can publish posts using the inline form.
3. Click on any author's name to open their profile at `/users/:id/posts`.
4. This page displays the user's profile card and their up to 3 most recent posts joined in a single round-trip via MongoDB 5.0+ correlated `$lookup` sub-pipeline, supported by compound Index #4 (`{ author: 1, _id: -1 }`).

---

## 7. Security & Session Lifecycle

- **Automatic Bearer Token Injection:** `src/api/client.ts` automatically attaches `Authorization: Bearer <token>` from `localStorage` to all authenticated HTTP requests.
- **Global 401 Interceptor:** If the backend revokes or expires a JWT, the client intercepts the 401 status, purges `token` and `user` from storage, and redirects the browser to `/login`.
- **Zero Information Leakage:** Handled 404 access-denial responses uniformly, ensuring non-owners cannot enumerate resource IDs.

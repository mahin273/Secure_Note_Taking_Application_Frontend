import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';
import NoteEdit from './pages/NoteEdit';
import AdminUsers from './pages/AdminUsers';
import AdminNotes from './pages/AdminNotes';
import InterestsReport from './pages/InterestsReport';

const Navigation: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <h2>Secure Note Taking Application</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/posts">Public Posts</Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/notes">My Notes</Link>
            {isAdmin && (
              <>
                <Link to="/admin/users">Admin Users</Link>
                <Link to="/admin/notes">Admin Notes</Link>
                <Link to="/reports/interests">Interests Report</Link>
              </>
            )}
            <span>
              {user?.email} ({user?.role})
            </span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

const HomePage: React.FC = () => (
  <div>
    <h3>Welcome</h3>
    <p>A minimal, secure note-taking web application with role-based access control.</p>
    <p>Please login or register to manage your personal notes securely.</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/posts"
              element={
                <div>
                  <h3>Public Posts</h3>
                  <p>Public posts listing will be loaded here.</p>
                </div>
              }
            />

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/:id" element={<NoteEdit />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notes" element={<AdminNotes />} />
              <Route path="/reports/interests" element={<InterestsReport />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

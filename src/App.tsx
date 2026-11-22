import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

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
              <Route
                path="/notes"
                element={
                  <div>
                    <h3>My Notes</h3>
                    <p>Notes dashboard will be loaded here.</p>
                  </div>
                }
              />
              <Route
                path="/notes/:id"
                element={
                  <div>
                    <h3>Edit Note</h3>
                    <p>Note editor will be loaded here.</p>
                  </div>
                }
              />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route
                path="/admin/users"
                element={
                  <div>
                    <h3>Admin: User Management</h3>
                    <p>User management table will be loaded here.</p>
                  </div>
                }
              />
              <Route
                path="/admin/notes"
                element={
                  <div>
                    <h3>Admin: All Notes</h3>
                    <p>All notes view will be loaded here.</p>
                  </div>
                }
              />
              <Route
                path="/reports/interests"
                element={
                  <div>
                    <h3>Admin: Interests Report</h3>
                    <p>Scenario 1 interests report will be loaded here.</p>
                  </div>
                }
              />
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

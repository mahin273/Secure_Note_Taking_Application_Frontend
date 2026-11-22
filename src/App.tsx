import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <header>
        <h2>Secure Note Taking Application</h2>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <p>Welcome to Secure Note Taking Application.</p>
                <p>Minimal, clean, and secure note management with role-based access control.</p>
              </div>
            }
          />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;

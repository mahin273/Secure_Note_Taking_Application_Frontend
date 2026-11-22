import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const user = await login(loginEmail, loginPass);
      if (user.role === 'admin') {
        navigate('/admin/users');
      } else {
        navigate('/notes');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    await executeLogin(demoEmail, demoPass);
  };

  return (
    <div>
      <h3>Login</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>

      <div className="card" style={{ background: '#f9f9f9', marginTop: '24px', border: '1px solid #ccc' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Demo Accounts for Testing</h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.9em', color: '#555' }}>
          Click any account below to auto-fill and log in immediately:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>Admin (Auditor & User Management)</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                <code>admin@example.com</code> &bull; <code>AdminPassword123!</code>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@example.com', 'AdminPassword123!')}
              style={{ padding: '6px 12px' }}
            >
              Log in as Admin
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>User 1 (Alice)</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                <code>user1@example.com</code> &bull; <code>UserPassword123!</code>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('user1@example.com', 'UserPassword123!')}
              style={{ padding: '6px 12px' }}
            >
              Log in as User 1
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>User 2 (Bob)</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                <code>user2@example.com</code> &bull; <code>UserPassword123!</code>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('user2@example.com', 'UserPassword123!')}
              style={{ padding: '6px 12px' }}
            >
              Log in as User 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

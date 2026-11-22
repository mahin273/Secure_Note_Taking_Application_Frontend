import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  nextCursor: string | null;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [interestsInput, setInterestsInput] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<AdminUsersResponse>('/admin/users?limit=10');
      setUsers(data.users);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || loadMoreLoading) return;

    try {
      setLoadMoreLoading(true);
      const data = await api.get<AdminUsersResponse>(`/admin/users?limit=10&after=${nextCursor}`);
      setUsers((prev) => [...prev, ...data.users]);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load additional users');
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    const interests = interestsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const newUser = await api.post<AdminUser>('/admin/users', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        interests: interests.length > 0 ? interests : undefined,
      });

      setUsers((prev) => [newUser, ...prev]);
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setInterestsInput('');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userEmail}"?\n\nThis will permanently delete the user and all their associated notes and posts via cascade deletion.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <h3>Admin: User Management</h3>

      <div className="card">
        <h4>Create New User</h4>
        {createError && <p className="error">{createError}</p>}
        <form onSubmit={handleCreateUser}>
          <label htmlFor="admin-name">Full Name</label>
          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="admin-password">Password (minimum 8 characters)</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <label htmlFor="admin-role">Role</label>
          <select
            id="admin-role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <label htmlFor="admin-interests">Interests (comma separated)</label>
          <input
            id="admin-interests"
            type="text"
            value={interestsInput}
            onChange={(e) => setInterestsInput(e.target.value)}
            placeholder="Tech, Design, Science"
          />

          <button type="submit" disabled={createLoading}>
            {createLoading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>

      <hr />

      <h4>Registered Users</h4>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Interests</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.interests && u.interests.length > 0 ? u.interests.join(', ') : '—'}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u._id, u.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {nextCursor && (
            <div className="pagination">
              <button type="button" onClick={handleLoadMore} disabled={loadMoreLoading}>
                {loadMoreLoading ? 'Loading more...' : 'Load More Users'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

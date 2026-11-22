import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export interface AdminNote {
  _id: string;
  owner: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminNotesResponse {
  notes: AdminNote[];
  nextCursor: string | null;
}

export const AdminNotes: React.FC = () => {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [ownerInput, setOwnerInput] = useState('');
  const [activeOwner, setActiveOwner] = useState('');

  const fetchNotes = async (owner: string, cursor?: string | null) => {
    try {
      if (cursor) {
        setLoadMoreLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.append('limit', '10');
      if (owner.trim()) {
        params.append('owner', owner.trim());
      }
      if (cursor) {
        params.append('after', cursor);
      }

      const data = await api.get<AdminNotesResponse>(`/admin/notes?${params.toString()}`);

      if (cursor) {
        setNotes((prev) => [...prev, ...data.notes]);
      } else {
        setNotes(data.notes);
      }
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes('');
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveOwner(ownerInput.trim());
    fetchNotes(ownerInput.trim());
  };

  const handleReset = () => {
    setOwnerInput('');
    setActiveOwner('');
    fetchNotes('');
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadMoreLoading) {
      fetchNotes(activeOwner, nextCursor);
    }
  };

  return (
    <div>
      <h3>Admin: Platform Notes Inspection</h3>

      <div className="card">
        <h4>Filter by Note Owner</h4>
        <form onSubmit={handleFilter} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={ownerInput}
            onChange={(e) => setOwnerInput(e.target.value)}
            placeholder="Enter Owner User ID (e.g. 6b01...)"
            style={{ flex: '1', minWidth: '220px' }}
          />
          <button type="submit">Filter</button>
          {activeOwner && (
            <button type="button" onClick={handleReset}>
              Reset Filter
            </button>
          )}
        </form>
        {activeOwner && (
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9em' }}>
            Showing notes for Owner ID: <code>{activeOwner}</code>
          </p>
        )}
      </div>

      <hr />

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading platform notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found{activeOwner ? ' for this owner' : ''}.</p>
      ) : (
        <div>
          {notes.map((note) => (
            <div key={note._id} className="card">
              <h4 style={{ margin: '0 0 4px 0' }}>{note.title}</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85em', color: '#555' }}>
                Owner ID: <code>{note.owner}</code> | Note ID: <code>{note._id}</code>
              </p>
              {note.content && (
                <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>{note.content}</p>
              )}
              <small style={{ color: '#666' }}>
                Created: {new Date(note.createdAt).toLocaleString()}
              </small>
            </div>
          ))}

          {nextCursor && (
            <div className="pagination">
              <button type="button" onClick={handleLoadMore} disabled={loadMoreLoading}>
                {loadMoreLoading ? 'Loading more notes...' : 'Load More Notes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotes;

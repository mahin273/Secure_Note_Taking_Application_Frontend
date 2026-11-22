import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export interface Note {
  _id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesResponse {
  notes: Note[];
  nextCursor: string | null;
}

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Note creation form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<NotesResponse>('/notes?limit=10');
      setNotes(data.notes);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || loadMoreLoading) return;

    try {
      setLoadMoreLoading(true);
      const data = await api.get<NotesResponse>(`/notes?limit=10&after=${nextCursor}`);
      setNotes((prev) => [...prev, ...data.notes]);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load additional notes');
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const newNote = await api.post<Note>('/notes', {
        title: title.trim(),
        content: content.trim() || undefined,
      });

      setNotes((prev) => [newNote, ...prev]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create note');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
    }
  };

  return (
    <div>
      <h3>Create New Note</h3>
      {createError && <p className="error">{createError}</p>}
      <form onSubmit={handleCreateNote}>
        <label htmlFor="note-title">Title</label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
        />

        <label htmlFor="note-content">Content</label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={4}
        />

        <button type="submit" disabled={createLoading}>
          {createLoading ? 'Saving...' : 'Create Note'}
        </button>
      </form>

      <hr />

      <h3>My Notes</h3>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found. Create your first note above.</p>
      ) : (
        <div>
          {notes.map((note) => (
            <div key={note._id} className="card">
              <h4 style={{ margin: '0 0 8px 0' }}>{note.title}</h4>
              {note.content && (
                <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>{note.content}</p>
              )}
              <small style={{ color: '#666' }}>
                Created: {new Date(note.createdAt).toLocaleString()}
              </small>
              <div className="actions" style={{ marginTop: '10px' }}>
                <Link to={`/notes/${note._id}`}>
                  <button type="button">Edit</button>
                </Link>
                <button type="button" onClick={() => handleDelete(note._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {nextCursor && (
            <div className="pagination">
              <button type="button" onClick={handleLoadMore} disabled={loadMoreLoading}>
                {loadMoreLoading ? 'Loading more...' : 'Load More Notes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;

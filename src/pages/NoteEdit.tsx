import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Note } from './Notes';

export const NoteEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        setLoading(true);
        setError(null);
        const note = await api.get<Note>(`/notes/${id}`);
        setTitle(note.title);
        setContent(note.content || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      await api.patch<Note>(`/notes/${id}`, {
        title: title.trim(),
        content: content.trim(),
      });
      navigate('/notes');
    } catch (err: any) {
      setError(err.message || 'Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading note...</p>;
  }

  return (
    <div>
      <h3>Edit Note</h3>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="edit-title">Title</label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="edit-content">Content</label>
        <textarea
          id="edit-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />

        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/notes')} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEdit;

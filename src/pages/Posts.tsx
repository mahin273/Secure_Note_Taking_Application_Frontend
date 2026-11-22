import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export interface PostAuthor {
  _id: string;
  name: string;
  email: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

export const Posts: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post creation state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const loadInitialPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<PostsResponse>('/posts?limit=10');
      setPosts(data.posts || []);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || loadMoreLoading) return;

    try {
      setLoadMoreLoading(true);
      const data = await api.get<PostsResponse>(`/posts?limit=10&after=${nextCursor}`);
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load additional posts');
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setPublishing(true);
      setPostError(null);

      const newPost = await api.post<Post>('/posts', {
        title: title.trim(),
        content: content.trim() || undefined,
      });

      const populatedPost: Post = {
        ...newPost,
        author:
          newPost.author && typeof newPost.author === 'object'
            ? newPost.author
            : {
                _id: user?._id || user?.id || '',
                name: user?.name || user?.email || 'Me',
                email: user?.email || '',
              },
      };

      setPosts((prev) => [populatedPost, ...prev]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      setPostError(err.message || 'Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <h3>Community Public Posts</h3>
      <p style={{ color: '#555', fontSize: '0.9em' }}>
        Public community feed. Click on any author name to view their profile and latest posts (Scenario 2 $lookup).
      </p>

      {isAuthenticated ? (
        <div className="card">
          <h4>Publish a Post</h4>
          {postError && <p className="error">{postError}</p>}
          <form onSubmit={handleCreatePost}>
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
            />

            <label htmlFor="post-content">Content</label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
            />

            <button type="submit" disabled={publishing}>
              {publishing ? 'Publishing...' : 'Publish Post'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ background: '#fafafa' }}>
          <p style={{ margin: 0 }}>
            Want to share your thoughts? <Link to="/login">Login</Link> or{' '}
            <Link to="/register">Register</Link> to publish posts.
          </p>
        </div>
      )}

      <hr />

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts published yet. Be the first to share something!</p>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post._id} className="card">
              <h4 style={{ margin: '0 0 6px 0' }}>{post.title}</h4>
              {post.content && (
                <p style={{ margin: '0 0 10px 0', fontSize: '1em', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
              )}
              <div style={{ fontSize: '0.85em', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <span>
                  Posted by:{' '}
                  {post.author?._id ? (
                    <Link to={`/users/${post.author._id}/posts`}>
                      <strong>{post.author.name || post.author.email}</strong>
                    </Link>
                  ) : (
                    <strong>{post.author?.name || 'Anonymous'}</strong>
                  )}
                </span>
                <span style={{ marginLeft: '12px' }}>
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {nextCursor && (
            <div className="pagination">
              <button type="button" onClick={handleLoadMore} disabled={loadMoreLoading}>
                {loadMoreLoading ? 'Loading more posts...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Posts;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export interface UserPostItem {
  _id: string;
  title?: string;
  content: string;
  createdAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  interests?: string[];
  posts?: UserPostItem[];
  recentPosts?: UserPostItem[];
}

export const UserProfilePosts: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<UserProfile>(`/users/${id}/posts`);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile and posts');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return <p>Loading user profile (Scenario 2 $lookup)...</p>;
  }

  if (error || !profile) {
    return (
      <div>
        <p className="error">{error || 'User not found'}</p>
        <Link to="/posts">Return to Public Posts</Link>
      </div>
    );
  }

  const postsList = profile.posts || profile.recentPosts || [];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/posts">&larr; Back to Public Posts</Link>
      </div>

      <div className="card">
        <h3>User Profile: {profile.name}</h3>
        {profile.email && (
          <p style={{ margin: '4px 0' }}>
            <strong>Email:</strong> {profile.email}
          </p>
        )}
        {profile.role && (
          <p style={{ margin: '4px 0' }}>
            <strong>Role:</strong> {profile.role}
          </p>
        )}
        {profile.interests && (
          <p style={{ margin: '4px 0' }}>
            <strong>Interests:</strong>{' '}
            {profile.interests.length > 0 ? profile.interests.join(', ') : 'None specified'}
          </p>
        )}
        <p style={{ margin: '4px 0', fontSize: '0.85em', color: '#666' }}>
          User ID: <code>{profile._id}</code>
        </p>
      </div>

      <h4>Recent Posts (Scenario 2 Aggregation - Latest Posts)</h4>
      <p style={{ fontSize: '0.85em', color: '#666' }}>
        Joined via MongoDB 5.0+ correlated <code>$lookup</code> sub-pipeline with compound Index #4.
      </p>

      {postsList.length === 0 ? (
        <p>No recent posts published by this user.</p>
      ) : (
        <div>
          {postsList.map((post) => (
            <div key={post._id} className="card">
              {post.title && <h4 style={{ margin: '0 0 6px 0' }}>{post.title}</h4>}
              {post.content && (
                <p style={{ margin: '0 0 8px 0', fontSize: '1.05em', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
              )}
              <small style={{ color: '#666' }}>
                Published: {new Date(post.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePosts;

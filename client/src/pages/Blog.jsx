import { useEffect, useState } from 'react';
import { api } from '../api';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/blogs/public');
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) setPosts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="section">
      <div className="section-label">Insights</div>
      <div className="section-title">
        Social Media <em style={{ fontStyle: 'normal', color: 'var(--blue2)' }}>Playbook</em>
      </div>
      <div className="blog-grid">
        {posts.map((b) => (
          <article key={b._id} className="blog-card">
            <div className="blog-thumb">{b.emoji || '📝'}</div>
            <div className="blog-body">
              <div className="blog-tag">{b.category}</div>
              <h4>{b.title}</h4>
              <p>
                {b.content
                  ? `${String(b.content).slice(0, 120)}${String(b.content).length > 120 ? '…' : ''}`
                  : 'Discover proven strategies used by our top clients to drive real business results in the Indian market.'}
              </p>
              <div className="blog-meta">
                📅 {formatDate(b.createdAt)} · 5 min read
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

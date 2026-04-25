import { useEffect, useState } from 'react';
import { api } from '../api';
import SEO from '../components/SEO';

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

  // Structured data for blog page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Growphone Blog - Social Media Playbook",
    "description": "Discover proven strategies, case studies, and insights from India's leading social media agency. Learn Instagram marketing, GMB optimization, and social growth tactics.",
    "url": "https://growphone.in/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Growphone",
      "url": "https://growphone.in"
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.metaTitle || post.title,
      "description": post.content ? `${String(post.content).slice(0, 160)}...` : 'Discover proven strategies used by our top clients to drive real business results in the Indian market.',
      "url": `https://growphone.in/blog/${post._id}`,
      "datePublished": post.createdAt,
      "author": {
        "@type": "Organization",
        "name": "Growphone"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Growphone"
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Social Media Playbook - Blog"
        description="Discover proven strategies, case studies, and insights from India's leading social media agency. Learn Instagram marketing, GMB optimization, and social growth tactics."
        keywords="social media blog India, Instagram marketing tips, GMB optimization guide, social media strategy, digital marketing insights, social growth tactics"
        canonicalUrl="https://growphone.in/blog"
        structuredData={structuredData}
      />
      <div className="section">
        <div className="section-label">Insights</div>
        <div className="section-title">
          Social Media <em style={{ fontStyle: 'normal', color: 'var(--blue2)' }}>Playbook</em>
        </div>
        <div className="blog-grid">
          {posts.map((b) => (
            <article key={b._id} className="blog-card">
              <div className="blog-thumb" aria-label={`Blog category: ${b.category}`}>{b.emoji || '📝'}</div>
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
    </>
  );
}

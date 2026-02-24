'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingCard from '../../../components/ListingCard';
import { getCategoryName } from '../../../components/BusinessCard';

export default function SearchPageClient({ businesses }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let matches = businesses.filter(b =>
      b.name.toLowerCase().includes(q) ||
      (b.shortDescription || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.subcategory || '').toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q)
    );

    if (sortBy === 'rating') {
      matches.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      matches.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return matches;
  }, [query, businesses, sortBy]);

  // Category filter
  const categoryGroups = useMemo(() => {
    const groups = {};
    results.forEach(b => {
      groups[b.category] = (groups[b.category] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  }, [results]);

  const filtered = activeTab === 'all'
    ? results
    : results.filter(b => b.category === activeTab);

  return (
    <div className="directory-page">
      <div className="search-page">
        <div className="search-page-bar">
          <form onSubmit={(e) => { e.preventDefault(); }} className="search-page-form">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search businesses, categories, cities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>

        <div className="results-header">
          <div className="results-query">
            {query ? <>Results for <span>&ldquo;{query}&rdquo;</span></> : 'Search the directory'}
          </div>
          {query && <div className="results-count">{results.length} results</div>}
        </div>

        {/* Category Tabs */}
        {results.length > 0 && (
          <div className="type-tabs">
            <button
              className={`type-tab${activeTab === 'all' ? ' active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All<span className="tab-count">{results.length}</span>
            </button>
            {categoryGroups.map(([cat, count]) => (
              <button
                key={cat}
                className={`type-tab${activeTab === cat ? ' active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {getCategoryName(cat)}<span className="tab-count">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sort */}
        {results.length > 0 && (
          <div className="sort-bar">
            <span className="sort-label">Sort by:</span>
            <button className={`sort-btn${sortBy === 'relevance' ? ' active' : ''}`} onClick={() => setSortBy('relevance')}>Relevance</button>
            <button className={`sort-btn${sortBy === 'rating' ? ' active' : ''}`} onClick={() => setSortBy('rating')}>Highest Rated</button>
            <button className={`sort-btn${sortBy === 'reviews' ? ' active' : ''}`} onClick={() => setSortBy('reviews')}>Most Reviews</button>
          </div>
        )}

        <div className="results-main">
          {filtered.map(b => (
            <ListingCard key={b.slug} business={b} />
          ))}

          {query && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No results found for &ldquo;{query}&rdquo;</p>
              <p style={{ fontSize: '14px' }}>Try a different search term or browse our categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

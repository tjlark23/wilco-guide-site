'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const categories = [
  { label: 'All', slug: '/directory' },
  { label: 'Restaurants', slug: '/directory/category/restaurants' },
  { label: 'Health', slug: '/directory/category/health' },
  { label: 'Beauty', slug: '/directory/category/beauty' },
  { label: 'Services', slug: '/directory/category/services' },
  { label: 'Automotive', slug: '/directory/category/automotive' },
  { label: 'Fitness', slug: '/directory/category/fitness' },
];

const cities = [
  { label: 'All WilCo', slug: '/directory' },
  { label: 'Round Rock', slug: '/directory/city/round-rock' },
  { label: 'Georgetown', slug: '/directory/city/georgetown' },
  { label: 'Cedar Park', slug: '/directory/city/cedar-park' },
  { label: 'Pflugerville', slug: '/directory/city/pflugerville' },
  { label: 'Leander', slug: '/directory/city/leander' },
  { label: 'Hutto', slug: '/directory/city/hutto' },
  { label: 'Liberty Hill', slug: '/directory/city/liberty-hill' },
  { label: 'Taylor', slug: '/directory/city/taylor' },
];

export default function SecondaryNav() {
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const locationRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e) {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function handleCitySelect(city) {
    setLocationOpen(false);
    router.push(city.slug);
  }

  // Determine active city from pathname
  const activeCityMatch = cities.find(c => c.slug !== '/directory' && pathname.startsWith(c.slug));
  const activeCity = activeCityMatch ? activeCityMatch.label : 'All WilCo';

  return (
    <div className="secondary-nav">
      <div className="category-filters">
        {categories.map((cat) => {
          const isActive = cat.slug === '/directory'
            ? pathname === '/directory' || pathname === '/directory/'
            : pathname.startsWith(cat.slug);
          return (
            <Link
              key={cat.label}
              href={cat.slug}
              className={`cat-pill${isActive ? ' active' : ''}`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>
      <div className="search-area">
        <Link href="/partner/" className="get-listed-btn">
          + Get Listed
        </Link>
        <form className="search-bar" onSubmit={handleSearch}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="location-dropdown" ref={locationRef}>
          <button
            className={`location-btn${locationOpen ? ' open' : ''}`}
            onClick={() => setLocationOpen(!locationOpen)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {activeCity}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className={`location-menu${locationOpen ? ' open' : ''}`}>
            {cities.map((city) => (
              <div
                key={city.label}
                className={`location-option${activeCity === city.label ? ' active' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                {city.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

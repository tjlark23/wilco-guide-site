import { Suspense } from 'react';
import { getBusinesses } from '../../../lib/getBusinesses';
import SearchPageClient from './SearchPageClient';

export const metadata = {
  title: 'Search Businesses | Williamson County Directory',
  description: 'Search for local businesses in Williamson County, TX. Find restaurants, services, healthcare, and more.',
  alternates: { canonical: 'https://wilcoguide.com/directory/search' },
};

export default function SearchPage() {
  const businesses = getBusinesses();
  return (
    <Suspense fallback={<div className="directory-page"><div className="search-page"><div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading search...</div></div></div>}>
      <SearchPageClient businesses={businesses} />
    </Suspense>
  );
}

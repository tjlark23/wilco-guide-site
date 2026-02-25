import { getBusinesses, getBusinessesByCategory, getTopRatedBusinesses, getFeaturedBusinesses } from '../../lib/getBusinesses';
import { getCategories } from '../../lib/getCategories';
import { getCities } from '../../lib/getCities';
import BusinessCard from '../../components/BusinessCard';
import PremiumCard from '../../components/PremiumCard';
import CategoryRow from '../../components/CategoryRow';
import CTABanner from '../../components/CTABanner';
import SchemaMarkup from '../../components/SchemaMarkup';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '../../lib/generateSchema';
import { getCategoryName } from '../../components/BusinessCard';
import Link from 'next/link';

export const metadata = {
  title: 'Business Directory for Williamson County, TX | WilCo Guide',
  description: 'Find local businesses, restaurants, services, and more in Williamson County, TX. The complete directory for Round Rock, Georgetown, Cedar Park, Leander, Pflugerville, Hutto, Liberty Hill, and Taylor.',
  openGraph: {
    title: 'WilCo Guide | Business Directory for Williamson County, TX',
    description: 'Find local businesses across Williamson County, TX.',
    url: 'https://wilcoguide.com/directory',
  },
  alternates: {
    canonical: 'https://wilcoguide.com/directory',
  },
};

export default function DirectoryIndexPage() {
  const allBusinesses = getBusinesses();
  const categories = getCategories();
  const cities = getCities();
  const topRated = getTopRatedBusinesses(12);
  const featured = getFeaturedBusinesses();

  // Build category rows — enough for the interleaved layout
  const categoryOrder = [
    'restaurants', 'health',           // batch 1 (before "This Week")
    'beauty', 'services',              // batch 2 (after "This Week")
    'automotive', 'fitness',           // batch 3 (after city grid)
    'financial', 'pets',               // batch 4 (after CTA)
    'education', 'entertainment',      // batch 5
    'home',                            // batch 6
  ];

  const categoryRows = categoryOrder.map(slug => {
    const cat = categories.find(c => c.slug === slug);
    const businesses = getBusinessesByCategory(slug)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
    return { category: cat, businesses, slug };
  }).filter(row => row.category && row.businesses.length > 0);

  // Split into batches for interleaving with content breaks
  const batch1 = categoryRows.slice(0, 2);
  const batch2 = categoryRows.slice(2, 4);
  const batch3 = categoryRows.slice(4, 6);
  const batch4 = categoryRows.slice(6, 8);
  const remaining = categoryRows.slice(8);

  // Premium spotlight — use featured first, then top rated
  const premiumBusinesses = featured.length > 0
    ? featured.slice(0, 3)
    : topRated.slice(0, 3);

  const heroRightBusinesses = topRated
    .filter(b => !premiumBusinesses.find(p => p.slug === b.slug))
    .slice(0, 4);

  // Popular categories with real counts
  const popularCategories = [
    { slug: 'restaurants', name: 'Restaurants' },
    { slug: 'health', name: 'Healthcare' },
    { slug: 'beauty', name: 'Beauty & Spas' },
    { slug: 'services', name: 'Services' },
    { slug: 'automotive', name: 'Automotive' },
    { slug: 'fitness', name: 'Fitness' },
  ].map(cat => ({
    ...cat,
    count: getBusinessesByCategory(cat.slug).length,
  }));

  // Category counts for the full icon grid
  const categoryCounts = categoryOrder.map(slug => ({
    slug,
    name: getCategoryName(slug),
    icon: categories.find(c => c.slug === slug)?.icon || '',
    count: getBusinessesByCategory(slug).length,
  }));

  // City counts
  const cityCounts = cities.map(city => ({
    ...city,
    count: allBusinesses.filter(b => b.citySlug === city.slug).length,
  }));

  // City descriptions
  const cityDescriptions = {
    'round-rock': 'The sports capital of Texas with a vibrant downtown',
    'georgetown': 'Most Beautiful Town Square in Texas with rich heritage',
    'cedar-park': 'Growing hub with entertainment and dining options',
    'pflugerville': 'Family-friendly community near Austin with great food',
    'leander': 'Fastest-growing city with new restaurants and shops',
    'hutto': 'Small-town charm with a growing local business scene',
    'liberty-hill': 'Hill Country living with scenic beauty and new growth',
    'taylor': 'Historic downtown with authentic Tex-Mex and BBQ',
  };

  // Schema
  const collectionSchema = generateCollectionPageSchema(
    'Business Directory for Williamson County, TX',
    'Find local businesses across Williamson County, TX.',
    allBusinesses.slice(0, 20).map((b, i) => ({
      position: i + 1,
      name: b.name,
      url: `https://wilcoguide.com/directory/business/${b.slug}`,
    }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wilcoguide.com' },
    { name: 'Directory', url: 'https://wilcoguide.com/directory' },
  ]);

  return (
    <>
      <SchemaMarkup schema={collectionSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <div className="directory-page">
        {/* ══════════ Directory Hero Text Block ══════════ */}
        <div className="directory-hero">
          <h1 className="directory-hero-title">Williamson County Business Directory</h1>
          <p className="directory-hero-subtitle">
            Discover {allBusinesses.length.toLocaleString()} local businesses across {cities.length} cities — restaurants, healthcare, services, and more.
          </p>
        </div>

        {/* ══════════ 1. Hero Grid — PremiumCard + 4 BusinessCards ══════════ */}
        <div className="spotlight-section">
          <div className="hero-grid">
            {premiumBusinesses.length > 0 && (
              <PremiumCard businesses={premiumBusinesses} />
            )}
            <div className="hero-right">
              {heroRightBusinesses.map((business) => (
                <BusinessCard key={business.slug} business={business} />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ 2. First 2 Category Rows ══════════ */}
        {batch1.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* ══════════ 3. This Week in WilCo ══════════ */}
        <div className="content-break this-week-section">
          <div className="content-break-inner">
            <h2 className="content-break-title">Explore the Directory</h2>
            <p className="content-break-subtitle">Find what you need across Williamson County</p>

            <div className="this-week-grid">
              {/* Card 1: Popular Categories */}
              <div className="tw-card tw-card-categories">
                <div className="tw-card-accent" style={{ backgroundColor: 'var(--orange)' }} />
                <div className="tw-card-body">
                  <div className="tw-card-icon">📂</div>
                  <h3 className="tw-card-title">Popular Categories</h3>
                  <div className="tw-category-list">
                    {popularCategories.map(cat => (
                      <Link key={cat.slug} href={`/directory/category/${cat.slug}`} className="tw-category-item">
                        <span className="tw-category-name">{cat.name}</span>
                        <span className="tw-category-count">{cat.count} businesses</span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/directory/search" className="tw-card-link">Search all categories →</Link>
                </div>
              </div>

              {/* Card 2: Local Favorites */}
              <div className="tw-card tw-card-tip">
                <div className="tw-card-accent" style={{ backgroundColor: 'var(--blue)' }} />
                <div className="tw-card-body">
                  <div className="tw-card-icon">⭐</div>
                  <h3 className="tw-card-title">Top Rated This Month</h3>
                  <p className="tw-card-text">
                    Williamson County businesses consistently earn high marks from locals.
                    From family-owned restaurants in Georgetown to fitness studios in Cedar Park,
                    see which businesses are earning 5-star reviews from your neighbors.
                  </p>
                  <Link href="/directory/category/restaurants" className="tw-card-link">Browse top-rated businesses →</Link>
                </div>
              </div>

              {/* Card 3: Get Listed */}
              <div className="tw-card tw-card-spotlight">
                <div className="tw-card-accent" style={{ backgroundColor: 'var(--green)' }} />
                <div className="tw-card-body">
                  <div className="tw-card-icon">🏪</div>
                  <h3 className="tw-card-title">Own a Local Business?</h3>
                  <p className="tw-card-text">
                    Get found by thousands of Williamson County residents searching for local
                    services every month. Claim your free listing, add photos, respond to reviews,
                    and stand out with a featured placement.
                  </p>
                  <Link href="/partner/" className="tw-card-link">Get listed on WilCo Guide →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ 4. Next 2 Category Rows ══════════ */}
        {batch2.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* ══════════ 5. Browse by Category — Icon Grid ══════════ */}
        <div className="content-break category-grid-break">
          <div className="content-break-inner">
            <h2 className="content-break-title">Browse by Category</h2>
            <p className="content-break-subtitle">All {allBusinesses.length.toLocaleString()} businesses organized by type</p>
            <div className="category-icon-grid">
              {categoryCounts.map(cat => (
                <Link key={cat.slug} href={`/directory/category/${cat.slug}`} className="category-icon-card">
                  <span className="category-icon-emoji">{cat.icon}</span>
                  <span className="category-icon-name">{cat.name}</span>
                  <span className="category-icon-count">{cat.count} businesses</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ 6. Next 2 Category Rows ══════════ */}
        {batch3.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* ══════════ 7. Browse by City ══════════ */}
        <div className="content-break relocation-section">
          <div className="content-break-inner">
            <div className="relocation-header">
              <div>
                <h2 className="content-break-title" style={{ textAlign: 'left' }}>Browse by City</h2>
                <p className="content-break-subtitle" style={{ textAlign: 'left' }}>Explore businesses in your neighborhood</p>
              </div>
            </div>

            <div className="relocation-city-grid">
              {cityCounts.map(city => (
                <Link
                  key={city.slug}
                  href={`/directory/city/${city.slug}`}
                  className="relocation-city-card"
                >
                  <h3 className="relocation-city-name">{city.name}</h3>
                  <p className="relocation-city-desc">{cityDescriptions[city.slug] || ''}</p>
                  <span className="relocation-city-highlight">{city.count} businesses</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ 8. Next 2 Category Rows ══════════ */}
        {batch4.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* ══════════ 9. CTA Banner ══════════ */}
        <CTABanner />

        {/* ══════════ 10. Remaining Category Rows ══════════ */}
        {remaining.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* ══════════ 11. Bottom CTA ══════════ */}
        <CTABanner />
      </div>
    </>
  );
}

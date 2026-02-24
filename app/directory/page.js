import { getBusinesses, getBusinessesByCategory, getTopRatedBusinesses } from '../../lib/getBusinesses';
import { getCategories } from '../../lib/getCategories';
import { getCities } from '../../lib/getCities';
import BusinessCard from '../../components/BusinessCard';
import CategoryRow from '../../components/CategoryRow';
import CTABanner from '../../components/CTABanner';
import SchemaMarkup from '../../components/SchemaMarkup';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '../../lib/generateSchema';
import { getCategoryName } from '../../components/BusinessCard';
import Link from 'next/link';

export const metadata = {
  title: 'Business Directory for Williamson County, TX',
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
  const topRated = getTopRatedBusinesses(8);

  // Build category rows for the main page
  const categoryOrder = [
    'restaurants', 'health', 'beauty', 'services',
    'automotive', 'fitness', 'financial', 'pets',
    'education', 'entertainment', 'home',
  ];

  const categoryRows = categoryOrder.map(slug => {
    const cat = categories.find(c => c.slug === slug);
    const businesses = getBusinessesByCategory(slug)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
    return { category: cat, businesses, slug };
  }).filter(row => row.category && row.businesses.length > 0);

  // Split for interleaving with content breaks
  const batch1 = categoryRows.slice(0, 2);
  const batch2 = categoryRows.slice(2, 4);
  const batch3 = categoryRows.slice(4, 6);
  const remaining = categoryRows.slice(6);

  // Category counts for grid
  const categoryCounts = categoryOrder.map(slug => ({
    slug,
    name: getCategoryName(slug),
    icon: categories.find(c => c.slug === slug)?.icon || '',
    count: getBusinessesByCategory(slug).length,
  }));

  // City counts for grid
  const cityCounts = cities.map(city => ({
    ...city,
    count: allBusinesses.filter(b => b.citySlug === city.slug).length,
  }));

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
        {/* Hero */}
        <div className="directory-hero">
          <h1 className="directory-hero-title">Williamson County Business Directory</h1>
          <p className="directory-hero-subtitle">
            Discover {allBusinesses.length.toLocaleString()} local businesses across {cities.length} cities in Williamson County, TX.
          </p>
        </div>

        {/* Category Grid */}
        <div className="category-grid-section">
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

        {/* Top Rated Spotlight */}
        {topRated.length > 0 && (
          <div className="spotlight-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Top Rated in WilCo</h2>
                <span className="section-count">Highest rated businesses</span>
              </div>
            </div>
            <div className="row-grid">
              {topRated.slice(0, 4).map(biz => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          </div>
        )}

        {/* First 2 Category Rows */}
        {batch1.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* City Grid */}
        <div className="content-break city-grid-section">
          <div className="content-break-inner">
            <h2 className="content-break-title">Browse by City</h2>
            <p className="content-break-subtitle">Explore businesses in your neighborhood</p>
            <div className="city-card-grid">
              {cityCounts.map(city => (
                <Link key={city.slug} href={`/directory/city/${city.slug}`} className="city-card">
                  <h3 className="city-card-name">{city.name}</h3>
                  <span className="city-card-count">{city.count} businesses</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Next 2 Category Rows */}
        {batch2.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* CTA Banner */}
        <CTABanner />

        {/* Next 2 Category Rows */}
        {batch3.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* Remaining Category Rows */}
        {remaining.map(({ category, businesses, slug }) => (
          <CategoryRow
            key={slug}
            title={category.name}
            count={getBusinessesByCategory(slug).length}
            categorySlug={slug}
            businesses={businesses}
          />
        ))}

        {/* Bottom CTA */}
        <CTABanner />
      </div>
    </>
  );
}

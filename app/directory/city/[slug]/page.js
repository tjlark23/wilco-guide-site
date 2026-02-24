import { getCities, getCityBySlug } from '../../../../lib/getCities';
import { getCategories } from '../../../../lib/getCategories';
import { getBusinessesByCity, getBusinessesByCityAndCategory } from '../../../../lib/getBusinesses';
import BusinessCard from '../../../../components/BusinessCard';
import CTABanner from '../../../../components/CTABanner';
import Breadcrumb from '../../../../components/Breadcrumb';
import SchemaMarkup from '../../../../components/SchemaMarkup';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '../../../../lib/generateSchema';
import { getCategoryName } from '../../../../components/BusinessCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams() {
  return getCities().map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const city = getCityBySlug(params.slug);
  if (!city) return {};
  return {
    title: city.seoTitle || `Businesses in ${city.name}, TX`,
    description: city.metaDescription || `Find local businesses in ${city.name}, TX.`,
    alternates: { canonical: `https://wilcoguide.com/directory/city/${city.slug}` },
  };
}

export default function CityPage({ params }) {
  const city = getCityBySlug(params.slug);
  if (!city) notFound();

  const businesses = getBusinessesByCity(city.slug);
  const categories = getCategories();

  // Group businesses by category
  const businessesByCategory = {};
  businesses.forEach(b => {
    if (!businessesByCategory[b.category]) {
      businessesByCategory[b.category] = [];
    }
    businessesByCategory[b.category].push(b);
  });

  // Sort categories by count descending
  const sortedCategoryGroups = Object.entries(businessesByCategory)
    .sort((a, b) => b[1].length - a[1].length);

  const collectionSchema = generateCollectionPageSchema(
    `Businesses in ${city.name}, TX`,
    city.metaDescription || '',
    businesses.slice(0, 50).map((b, i) => ({
      position: i + 1,
      name: b.name,
      url: `https://wilcoguide.com/directory/business/${b.slug}`,
    }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wilcoguide.com' },
    { name: 'Directory', url: 'https://wilcoguide.com/directory' },
    { name: city.name, url: `https://wilcoguide.com/directory/city/${city.slug}` },
  ]);

  return (
    <>
      <SchemaMarkup schema={collectionSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <div className="directory-page">
        <Breadcrumb items={[
          { label: 'Directory', href: '/directory' },
          { label: city.name },
        ]} />

        <div className="category-page-header">
          <h1 className="category-page-title">Businesses in {city.name}, TX</h1>
          {city.description && (
            <p className="category-page-intro">{city.description}</p>
          )}
        </div>

        {sortedCategoryGroups.map(([catSlug, catBusinesses]) => {
          const catDisplayName = getCategoryName(catSlug);
          const sorted = catBusinesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          return (
            <div key={catSlug} className="category-row">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">{catDisplayName}</h2>
                  <span className="section-count">{catBusinesses.length} businesses</span>
                </div>
                {catBusinesses.length > 4 && (
                  <Link href={`/directory/city/${city.slug}/${catSlug}`} className="section-see-all">
                    See all <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 6 15 12 9 18"/></svg>
                  </Link>
                )}
              </div>
              <div className="row-grid">
                {sorted.slice(0, 4).map(business => (
                  <BusinessCard key={business.slug} business={business} />
                ))}
              </div>
            </div>
          );
        })}

        {businesses.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            No businesses listed in {city.name} yet.
          </p>
        )}

        <CTABanner />
      </div>
    </>
  );
}

import { getCategories, getCategoryBySlug } from '../../../../lib/getCategories';
import { getBusinessesByCategory } from '../../../../lib/getBusinesses';
import { getCities } from '../../../../lib/getCities';
import ListingCard from '../../../../components/ListingCard';
import CTABanner from '../../../../components/CTABanner';
import Breadcrumb from '../../../../components/Breadcrumb';
import SchemaMarkup from '../../../../components/SchemaMarkup';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '../../../../lib/generateSchema';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams() {
  return getCategories().map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: category.seoTitle || `${category.name} in Williamson County, TX`,
    description: category.metaDescription || `Find ${category.name.toLowerCase()} businesses in Williamson County, TX.`,
    alternates: { canonical: `https://wilcoguide.com/directory/category/${category.slug}` },
  };
}

export default function CategoryPage({ params }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const businesses = getBusinessesByCategory(category.slug)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const cities = getCities();

  // Group businesses by city for filter chips
  const cityCounts = {};
  businesses.forEach(b => {
    cityCounts[b.citySlug] = (cityCounts[b.citySlug] || 0) + 1;
  });
  const cityChips = cities
    .filter(c => cityCounts[c.slug])
    .map(c => ({ ...c, count: cityCounts[c.slug] }))
    .sort((a, b) => b.count - a.count);

  const collectionSchema = generateCollectionPageSchema(
    `${category.name} in Williamson County`,
    category.metaDescription || '',
    businesses.slice(0, 50).map((b, i) => ({
      position: i + 1,
      name: b.name,
      url: `https://wilcoguide.com/directory/business/${b.slug}`,
    }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wilcoguide.com' },
    { name: 'Directory', url: 'https://wilcoguide.com/directory' },
    { name: category.name, url: `https://wilcoguide.com/directory/category/${category.slug}` },
  ]);

  return (
    <>
      <SchemaMarkup schema={collectionSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <div className="directory-page">
        <Breadcrumb items={[
          { label: 'Directory', href: '/directory' },
          { label: category.name },
        ]} />

        <div className="category-page-header">
          <h1 className="category-page-title">{category.name} in Williamson County</h1>
          {category.description && (
            <p className="category-page-intro">{category.description}</p>
          )}
        </div>

        {/* City filter chips */}
        {cityChips.length > 1 && (
          <div className="filter-chips">
            {cityChips.map(city => (
              <Link
                key={city.slug}
                href={`/directory/city/${city.slug}/${category.slug}`}
                className="filter-chip"
              >
                {city.name} ({city.count})
              </Link>
            ))}
          </div>
        )}

        <div className="listing-grid">
          {businesses.map(business => (
            <ListingCard key={business.slug} business={business} />
          ))}
        </div>

        {businesses.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            No businesses listed in this category yet.
          </p>
        )}

        <CTABanner />
      </div>
    </>
  );
}

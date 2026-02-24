import { getCities, getCityBySlug } from '../../../../../lib/getCities';
import { getCategories, getCategoryBySlug } from '../../../../../lib/getCategories';
import { getBusinesses, getBusinessesByCityAndCategory } from '../../../../../lib/getBusinesses';
import ListingCard from '../../../../../components/ListingCard';
import CTABanner from '../../../../../components/CTABanner';
import Breadcrumb from '../../../../../components/Breadcrumb';
import SchemaMarkup from '../../../../../components/SchemaMarkup';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '../../../../../lib/generateSchema';
import { getCategoryName } from '../../../../../components/BusinessCard';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const cities = getCities();
  const categories = getCategories();
  const allBusinesses = getBusinesses();

  const params = [];
  cities.forEach(city => {
    categories.forEach(cat => {
      const count = allBusinesses.filter(
        b => b.citySlug === city.slug && b.category === cat.slug
      ).length;
      // Only generate combo pages with 3+ businesses
      if (count >= 3) {
        params.push({ slug: city.slug, category: cat.slug });
      }
    });
  });
  return params;
}

export function generateMetadata({ params }) {
  const city = getCityBySlug(params.slug);
  const category = getCategoryBySlug(params.category);
  if (!city || !category) return {};
  return {
    title: `${category.name} in ${city.name}, TX`,
    description: `Find ${category.name.toLowerCase()} businesses in ${city.name}, TX. Browse local options in Williamson County.`,
    alternates: { canonical: `https://wilcoguide.com/directory/city/${city.slug}/${category.slug}` },
  };
}

export default function CityAndCategoryPage({ params }) {
  const city = getCityBySlug(params.slug);
  const category = getCategoryBySlug(params.category);
  if (!city || !category) notFound();

  const businesses = getBusinessesByCityAndCategory(city.slug, category.slug)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (businesses.length < 3) notFound();

  const collectionSchema = generateCollectionPageSchema(
    `${category.name} in ${city.name}, TX`,
    `Find ${category.name.toLowerCase()} businesses in ${city.name}, TX.`,
    businesses.map((b, i) => ({
      position: i + 1,
      name: b.name,
      url: `https://wilcoguide.com/directory/business/${b.slug}`,
    }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wilcoguide.com' },
    { name: 'Directory', url: 'https://wilcoguide.com/directory' },
    { name: city.name, url: `https://wilcoguide.com/directory/city/${city.slug}` },
    { name: category.name, url: `https://wilcoguide.com/directory/city/${city.slug}/${category.slug}` },
  ]);

  return (
    <>
      <SchemaMarkup schema={collectionSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <div className="directory-page">
        <Breadcrumb items={[
          { label: 'Directory', href: '/directory' },
          { label: city.name, href: `/directory/city/${city.slug}` },
          { label: category.name },
        ]} />

        <div className="category-page-header">
          <h1 className="category-page-title">{category.name} in {city.name}, TX</h1>
          <p className="category-page-intro">
            Browse {businesses.length} {category.name.toLowerCase()} businesses in {city.name}, Williamson County.
          </p>
        </div>

        <div className="listing-grid">
          {businesses.map(business => (
            <ListingCard key={business.slug} business={business} />
          ))}
        </div>

        <CTABanner />
      </div>
    </>
  );
}

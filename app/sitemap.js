import { getBusinesses } from '../lib/getBusinesses';
import { getCategories } from '../lib/getCategories';
import { getCities } from '../lib/getCities';

export default function sitemap() {
  const businesses = getBusinesses();
  const categories = getCategories();
  const cities = getCities();

  const baseUrl = 'https://wilcoguide.com';
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${baseUrl}/directory`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/directory/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/directory/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const cityPages = cities.map(city => ({
    url: `${baseUrl}/directory/city/${city.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // City x Category combo pages (3+ businesses)
  const comboPages = [];
  cities.forEach(city => {
    categories.forEach(cat => {
      const count = businesses.filter(
        b => b.citySlug === city.slug && b.category === cat.slug
      ).length;
      if (count >= 3) {
        comboPages.push({
          url: `${baseUrl}/directory/city/${city.slug}/${cat.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  });

  const businessPages = businesses.map(b => ({
    url: `${baseUrl}/directory/business/${b.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...cityPages, ...comboPages, ...businessPages];
}

import fs from 'fs';
import path from 'path';

let businesses = null;

function loadBusinesses() {
  if (!businesses) {
    const filePath = path.join(process.cwd(), 'data', 'clean-businesses.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const raw = JSON.parse(fileContents);

    // Filter out businesses with empty slugs
    const valid = raw.filter(b => b.slug && b.slug.trim() !== '');

    // Normalize Supabase field names to match our component expectations
    businesses = valid.map(b => ({
      // Core identity
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description || b.custom_description || '',
      shortDescription: b.custom_description || (b.description ? b.description.substring(0, 160) : ''),

      // Classification
      category: b.category,
      subcategory: b.subcategory || '',

      // Location
      city: b.address_city,
      citySlug: (b.address_city || '').toLowerCase().replace(/\s+/g, '-'),
      address: [b.address_street, b.address_city, b.address_state, b.address_zip].filter(Boolean).join(', '),
      addressStreet: b.address_street,
      addressCity: b.address_city,
      addressState: b.address_state || 'TX',
      addressZip: b.address_zip,
      latitude: b.latitude,
      longitude: b.longitude,

      // Contact
      phone: b.phone,
      email: b.email,
      website: b.website,

      // Media
      image: b.image,
      photos: b.photos || [],

      // Business info
      hours: b.hours,
      rating: b.rating,
      reviewCount: b.review_count || 0,
      priceRange: b.price_range || '',

      // Extras
      specialties: b.specialties || [],
      tags: b.tags || [],
      featured: b.is_featured || false,
      partnerTier: b.partner_tier || 'free',
      listingTier: b.listing_tier || 'free',
    }));
  }
  return businesses;
}

export function getBusinesses() {
  return loadBusinesses();
}

export function getBusinessesByCategory(categorySlug) {
  return loadBusinesses().filter(b => b.category === categorySlug);
}

export function getBusinessesByCity(citySlug) {
  return loadBusinesses().filter(b => b.citySlug === citySlug);
}

export function getBusinessesByCityAndCategory(citySlug, categorySlug) {
  return loadBusinesses().filter(
    b => b.citySlug === citySlug && b.category === categorySlug
  );
}

export function getBusinessBySlug(slug) {
  return loadBusinesses().find(b => b.slug === slug);
}

export function getFeaturedBusinesses() {
  return loadBusinesses().filter(b => b.featured === true);
}

export function getRelatedBusinesses(business, limit = 4) {
  return loadBusinesses()
    .filter(b => b.category === business.category && b.slug !== business.slug)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

/**
 * Returns top-rated businesses (rating >= 4.0, sorted by rating then review count)
 */
export function getTopRatedBusinesses(limit = 12) {
  return loadBusinesses()
    .filter(b => b.rating >= 4.0 && b.reviewCount > 5)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

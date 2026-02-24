const BASE_URL = 'https://wilcoguide.com';

/**
 * Generates a LocalBusiness JSON-LD schema for a business profile page.
 */
export function generateLocalBusinessSchema(business) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: `${BASE_URL}/directory/business/${business.slug}`,
  };

  if (business.addressStreet) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: business.addressStreet,
      addressLocality: business.city,
      addressRegion: business.addressState || 'TX',
      postalCode: business.addressZip,
      addressCountry: 'US',
    };
  }

  if (business.phone) {
    schema.telephone = business.phone;
  }

  if (business.website) {
    schema.sameAs = business.website;
  }

  if (business.hours && typeof business.hours === 'object') {
    schema.openingHoursSpecification = Object.entries(business.hours).map(([day, info]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      description: typeof info === 'object' ? `${info.open} - ${info.close}` : info,
    }));
  }

  if (business.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviewCount || 0,
    };
  }

  if (business.photos && business.photos.length > 0) {
    schema.image = business.photos[0];
  } else if (business.image) {
    schema.image = business.image;
  }

  if (business.latitude && business.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    };
  }

  return schema;
}

/**
 * Generates a CollectionPage + ItemList JSON-LD schema.
 */
export function generateCollectionPageSchema(title, description, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

/**
 * Generates a BreadcrumbList JSON-LD schema.
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

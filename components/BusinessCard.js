import Link from 'next/link';

const categoryColors = {
  'restaurants': '#ec4899',
  'health': '#3589ff',
  'beauty': '#8b5cf6',
  'services': '#f59e0b',
  'automotive': '#ef4444',
  'fitness': '#10b981',
  'financial': '#3589ff',
  'pets': '#eb7b1c',
  'education': '#8b5cf6',
  'entertainment': '#ec4899',
  'home': '#f59e0b',
};

const categoryNames = {
  'restaurants': 'Restaurants',
  'health': 'Health',
  'beauty': 'Beauty',
  'services': 'Services',
  'automotive': 'Automotive',
  'fitness': 'Fitness',
  'financial': 'Financial',
  'pets': 'Pets',
  'education': 'Education',
  'entertainment': 'Entertainment',
  'home': 'Home',
};

export function getCategoryColor(slug) {
  return categoryColors[slug] || '#3589ff';
}

export function getCategoryName(slug) {
  return categoryNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '\u2605'.repeat(full) + '\u2606'.repeat(empty);
}

export default function BusinessCard({ business }) {
  const {
    name,
    slug,
    category,
    city,
    rating,
    reviewCount,
    photos,
    image,
    subcategory,
  } = business;

  const photoUrl = (photos && photos.length > 0) ? photos[0] : image || null;
  const catColor = getCategoryColor(category);
  const catName = getCategoryName(category);

  return (
    <Link href={`/directory/business/${slug}`} className="biz-card row-card">
      <div className="card-media">
        {photoUrl && <img src={photoUrl} alt={name} loading="lazy" />}
      </div>
      <div className="card-overlay" />
      <div className="card-info">
        <div className="card-name">{name}</div>
        {city && <div className="card-location">{city}, TX</div>}
        <div className="card-bottom-bar">
          {rating != null && rating > 0 && (
            <div className="card-rating">
              <span className="stars">{renderStars(rating)}</span>
              {reviewCount != null && reviewCount > 0 && (
                <span className="rating-count">({reviewCount})</span>
              )}
            </div>
          )}
          <span className="card-cat-pill" style={{ backgroundColor: catColor }}>
            {catName}
          </span>
        </div>
      </div>
    </Link>
  );
}

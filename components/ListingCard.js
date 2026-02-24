import Link from 'next/link';
import { getCategoryColor, getCategoryName } from './BusinessCard';

function renderStars(rating) {
  if (!rating) return '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3 ? 1 : 0;
  const empty = 5 - full - half;
  return '\u2605'.repeat(full) + (half ? '\u2BEA' : '') + '\u2606'.repeat(empty);
}

export default function ListingCard({ business }) {
  const {
    name,
    slug,
    category,
    city,
    rating,
    reviewCount,
    photos,
    image,
    shortDescription,
    subcategory,
  } = business;

  const photoUrl = (photos && photos.length > 0) ? photos[0] : image || null;
  const catName = getCategoryName(category);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const catColor = getCategoryColor(category);

  return (
    <Link href={`/directory/business/${slug}`} className="listing-card">
      <div className="listing-card-photo">
        {photoUrl ? (
          <img src={photoUrl} alt={name} loading="lazy" />
        ) : (
          <div className="listing-card-initials" style={{ backgroundColor: catColor }}>
            {initials}
          </div>
        )}
      </div>
      <div className="listing-card-info">
        <h3 className="listing-card-name">{name}</h3>
        <div className="listing-card-meta">{catName} &middot; {city}, TX</div>
        {rating != null && rating > 0 && (
          <div className="listing-card-rating">
            <span className="listing-card-stars">{renderStars(rating)}</span>
            <span className="listing-card-rating-num">{rating}</span>
            {reviewCount != null && reviewCount > 0 && (
              <span className="listing-card-review-count">({reviewCount} reviews)</span>
            )}
          </div>
        )}
        {shortDescription && (
          <p className="listing-card-desc">{shortDescription}</p>
        )}
        {subcategory && (
          <div className="listing-card-tags">
            <span className="listing-card-tag">{subcategory}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

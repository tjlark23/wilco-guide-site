import fs from 'fs';
import path from 'path';

let reviews = null;

function loadReviews() {
  if (!reviews) {
    const filePath = path.join(process.cwd(), 'data', 'clean-reviews.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    reviews = JSON.parse(fileContents);
  }
  return reviews;
}

export function getReviews() {
  return loadReviews();
}

export function getReviewsByBusinessId(businessId) {
  return loadReviews().filter(r => r.business_id === businessId);
}

/**
 * Returns reviews for a business, sorted by date descending, limited.
 */
export function getRecentReviews(businessId, limit = 10) {
  return loadReviews()
    .filter(r => r.business_id === businessId)
    .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
    .slice(0, limit);
}

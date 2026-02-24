function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '\u2605'.repeat(full) + '\u2606'.repeat(empty);
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function ReviewsList({ reviews, rating, reviewCount }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="widget">
        <div className="widget-header"><h2 className="widget-title">Reviews</h2></div>
        <div className="widget-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No reviews available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <h2 className="widget-title">Reviews</h2>
        {rating > 0 && (
          <div className="reviews-summary">
            <span className="reviews-rating">{rating}</span>
            <span className="reviews-stars">{renderStars(Math.round(rating))}</span>
            <span className="reviews-count">({reviewCount} reviews)</span>
          </div>
        )}
      </div>
      <div className="widget-body reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="review-author">
                {review.author_image ? (
                  <img src={review.author_image} alt={review.author_name} className="review-avatar" loading="lazy" />
                ) : (
                  <div className="review-avatar-placeholder">
                    {(review.author_name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="review-author-name">{review.author_name}</div>
                  <div className="review-date">{timeAgo(review.review_date)}</div>
                </div>
              </div>
              <div className="review-stars">{renderStars(review.rating)}</div>
            </div>
            {review.text && (
              <p className="review-text">{review.text}</p>
            )}
            {review.owner_response && (
              <div className="review-response">
                <div className="review-response-label">Business Response</div>
                <p className="review-response-text">{review.owner_response}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

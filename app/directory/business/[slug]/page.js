import { getBusinesses, getBusinessBySlug, getRelatedBusinesses } from '../../../../lib/getBusinesses';
import { getCategoryBySlug } from '../../../../lib/getCategories';
import { getRecentReviews } from '../../../../lib/getReviews';
import Breadcrumb from '../../../../components/Breadcrumb';
import SchemaMarkup from '../../../../components/SchemaMarkup';
import ReviewsList from '../../../../components/ReviewsList';
import CTABanner from '../../../../components/CTABanner';
import { getCategoryName, getCategoryColor } from '../../../../components/BusinessCard';
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '../../../../lib/generateSchema';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams() {
  return getBusinesses()
    .filter(b => b.slug && b.slug.trim() !== '')
    .map(b => ({ slug: b.slug }));
}

export function generateMetadata({ params }) {
  const business = getBusinessBySlug(params.slug);
  if (!business) return {};
  return {
    title: `${business.name} | ${business.city}, TX`,
    description: business.shortDescription || `${business.name} in ${business.city}, TX. ${getCategoryName(business.category)} in Williamson County.`,
    alternates: { canonical: `https://wilcoguide.com/directory/business/${business.slug}` },
  };
}

function formatHours(hours) {
  if (!hours || typeof hours !== 'object') return null;
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

  return dayOrder
    .filter(day => hours[day])
    .map(day => {
      const info = hours[day];
      const time = typeof info === 'object'
        ? (info.isOpen ? `${info.open} - ${info.close}` : 'Closed')
        : info;
      return { day: dayLabels[day] || day, time };
    });
}

export default function BusinessProfilePage({ params }) {
  const business = getBusinessBySlug(params.slug);
  if (!business) notFound();

  const category = getCategoryBySlug(business.category);
  const catName = category ? category.name : getCategoryName(business.category);
  const related = getRelatedBusinesses(business, 4);
  const reviews = getRecentReviews(business.id, 10);

  const fullStars = Math.floor(business.rating || 0);
  const starsStr = '\u2605'.repeat(fullStars) + '\u2606'.repeat(Math.max(0, 5 - fullStars));

  // Deduplicate photos
  const allPhotos = business.photos || [];
  const seenBases = new Set();
  const uniquePhotos = allPhotos.filter(url => {
    const base = url.split('=')[0];
    if (seenBases.has(base)) return false;
    seenBases.add(base);
    return true;
  });
  const galleryPhotos = uniquePhotos.length > 0 ? uniquePhotos : (business.image ? [business.image] : []);
  const useSingleHero = galleryPhotos.length <= 1;

  const formattedHours = formatHours(business.hours);

  const businessSchema = generateLocalBusinessSchema(business);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wilcoguide.com' },
    { name: 'Directory', url: 'https://wilcoguide.com/directory' },
    { name: catName, url: `https://wilcoguide.com/directory/category/${business.category}` },
    { name: business.name, url: `https://wilcoguide.com/directory/business/${business.slug}` },
  ]);

  return (
    <>
      <SchemaMarkup schema={businessSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <Breadcrumb items={[
        { label: 'Directory', href: '/directory' },
        { label: catName, href: `/directory/category/${business.category}` },
        { label: business.name },
      ]} />

      <div className="profile-page">
        {/* Gallery */}
        {galleryPhotos.length > 0 && (
          <div className="gallery-section">
            <div className={`gallery-grid${useSingleHero ? ' gallery-single' : ''}`}>
              {galleryPhotos.slice(0, 5).map((photo, i) => (
                <div key={i} className={`gallery-item${i === 0 ? ' gallery-hero' : ''}`}>
                  <img src={photo} alt={`${business.name} photo ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
                  {i === 4 && galleryPhotos.length > 5 && (
                    <div className="gallery-count">+{galleryPhotos.length - 5} more</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="biz-header">
          <div className="biz-header-left">
            <h1 className="biz-name">{business.name}</h1>
            <div className="biz-meta">
              <span className="biz-category">{catName}</span>
              {business.priceRange && (
                <span className="biz-price">{business.priceRange}</span>
              )}
              <span className="biz-location">📍 {business.city}, TX</span>
            </div>
            {business.rating > 0 && (
              <div className="biz-rating-row">
                <span className="biz-stars">{starsStr}</span>
                <span className="biz-rating-num">{business.rating}</span>
                <span className="biz-rating-count">({business.reviewCount} reviews)</span>
              </div>
            )}
            {business.subcategory && (
              <div className="biz-tags-row">
                <span className="biz-tag biz-tag-deal">{business.subcategory}</span>
              </div>
            )}
          </div>
          <div className="biz-header-actions">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="action-btn action-btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                Call
              </a>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Website
              </a>
            )}
            <button className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Directions
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="profile-content">
          <div className="profile-main">
            {/* About */}
            {business.description && (
              <div className="widget">
                <div className="widget-header"><h2 className="widget-title">About</h2></div>
                <div className="widget-body">
                  <div className="about-text">
                    <p>{business.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsList
              reviews={reviews}
              rating={business.rating}
              reviewCount={business.reviewCount}
            />
          </div>

          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="widget">
              <div className="widget-header"><h2 className="widget-title">Info</h2></div>
              <div className="widget-body">
                {formattedHours && formattedHours.length > 0 && (
                  <div className="info-row">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                      <div className="info-label">Hours</div>
                      <div className="hours-grid">
                        {formattedHours.map(({ day, time }) => (
                          <div key={day} className="hours-row">
                            <span className="hours-day">{day}</span>
                            <span className="hours-time">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div className="info-row">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                    </div>
                    <div>
                      <div className="info-label">Phone</div>
                      <div className="info-value"><a href={`tel:${business.phone}`}>{business.phone}</a></div>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="info-row">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div>
                      <div className="info-label">Website</div>
                      <div className="info-value"><a href={business.website} target="_blank" rel="noopener noreferrer">{business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></div>
                    </div>
                  </div>
                )}
                {business.address && (
                  <div className="info-row">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <div className="info-label">Address</div>
                      <div className="info-value">{business.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map placeholder */}
            {(business.latitude && business.longitude) && (
              <div className="widget">
                <div className="widget-body" style={{ padding: '14px' }}>
                  <div className="map-placeholder">
                    <div className="map-pin">
                      <div className="map-pin-icon"><div className="map-pin-dot"></div></div>
                      <div className="map-address">{business.address || `${business.city}, TX`}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* You Might Also Like */}
            {related.length > 0 && (
              <div className="widget">
                <div className="widget-header"><h2 className="widget-title">You Might Also Like</h2></div>
                <div className="widget-body">
                  {related.slice(0, 3).map(rb => (
                    <Link key={rb.slug} href={`/directory/business/${rb.slug}`} className="sidebar-biz-card">
                      <div className="sidebar-biz-img">
                        <img src={rb.photos?.[0] || rb.image || ''} alt={rb.name} loading="lazy" />
                      </div>
                      <div className="sidebar-biz-info">
                        <div className="sidebar-biz-name">{rb.name}</div>
                        <div className="sidebar-biz-detail">{getCategoryName(rb.category)} · {rb.city}</div>
                        {rb.rating > 0 && (
                          <div className="sidebar-biz-stars">{'\u2605'.repeat(Math.floor(rb.rating))}{'\u2606'.repeat(5 - Math.floor(rb.rating))} <span>{rb.rating}</span></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Claim Listing CTA */}
        <div className="claim-listing-cta">
          <p>Is this your business? Manage your listing and reach more customers.</p>
          <Link href="/partner/">Get Listed on WilCo Guide →</Link>
        </div>

        {/* Related Businesses Grid */}
        {related.length > 0 && (
          <>
            <div className="section-header-full">
              <h2 className="section-title-full">Related {catName} in {business.city}</h2>
              <Link href={`/directory/category/${business.category}`} className="section-see-all">See all →</Link>
            </div>
            <div className="related-grid">
              {related.map(rb => (
                <Link key={rb.slug} href={`/directory/business/${rb.slug}`} className="related-card">
                  <img src={rb.photos?.[0] || rb.image || ''} alt={rb.name} loading="lazy" />
                  <div className="related-overlay"></div>
                  <div className="related-info">
                    <div className="related-name">{rb.name}</div>
                    <div className="related-detail">{getCategoryName(rb.category)} · {rb.city}</div>
                    {rb.rating > 0 && (
                      <div className="related-stars">{'\u2605'.repeat(Math.floor(rb.rating))}{'\u2606'.repeat(5 - Math.floor(rb.rating))} {rb.rating}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

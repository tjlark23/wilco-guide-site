import Link from 'next/link';

export default function CTABanner() {
  return (
    <div className="cta-banner">
      <div className="cta-banner-content">
        <h3 className="cta-banner-title">Own a business in Williamson County?</h3>
        <p className="cta-banner-text">Get listed in the WilCo Guide and reach thousands of local customers every month.</p>
      </div>
      <Link href="/partner/" className="btn-primary">Get Listed →</Link>
    </div>
  );
}

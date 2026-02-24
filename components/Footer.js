import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img
            src="/images/wilco-guide-logo.png"
            alt="WilCo Guide"
            className="footer-logo-img"
          />
          <p className="footer-brand-desc">
            Your local guide to businesses, services, and community resources across Williamson County, Texas.
          </p>
        </div>

        <div>
          <h4 className="footer-col-title">Directory</h4>
          <ul className="footer-links">
            <li><Link href="/directory/category/restaurants">Restaurants</Link></li>
            <li><Link href="/directory/category/health">Health & Medical</Link></li>
            <li><Link href="/directory/category/beauty">Beauty & Personal Care</Link></li>
            <li><Link href="/directory/category/services">Home Services</Link></li>
            <li><Link href="/directory/category/automotive">Automotive</Link></li>
            <li><Link href="/directory/category/fitness">Fitness & Recreation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-col-title">Explore</h4>
          <ul className="footer-links">
            <li><Link href="/directory/city/round-rock">Round Rock</Link></li>
            <li><Link href="/directory/city/georgetown">Georgetown</Link></li>
            <li><Link href="/directory/city/cedar-park">Cedar Park</Link></li>
            <li><Link href="/directory/city/pflugerville">Pflugerville</Link></li>
            <li><Link href="/directory/city/leander">Leander</Link></li>
            <li><a href="/seniors/">Seniors Directory</a></li>
            <li><a href="/foundation-repair/">Foundation Repair</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-col-title">Company</h4>
          <ul className="footer-links">
            <li><Link href="/partner/">Partner With Us</Link></li>
            <li><a href="https://www.wilcoguide.com" target="_blank" rel="noopener noreferrer">WilCo Guide Home</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>&copy; 2026 WilCo Guide. All rights reserved.</span>
          <span>Serving Williamson County, Texas &mdash; Round Rock, Georgetown, Cedar Park &amp; beyond.</span>
        </div>
      </div>
    </footer>
  );
}

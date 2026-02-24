import Link from 'next/link';

export default function PrimaryNav() {
  return (
    <nav className="primary-nav">
      <a href="https://www.wilcoguide.com" className="nav-logo">
        <img
          src="/images/wilco-guide-logo-outline.png"
          alt="WilCo Guide"
          className="nav-logo-img"
        />
      </a>
      <div className="nav-sections">
        <span className="nav-tab nav-tab-soon">News<span className="soon-badge">Soon</span></span>
        <Link href="/directory" className="nav-tab active">Directory</Link>
        <span className="nav-tab nav-tab-soon">Jobs<span className="soon-badge">Soon</span></span>
        <a href="/seniors/" className="nav-tab">Seniors</a>
        <span className="nav-tab nav-tab-soon">Events<span className="soon-badge">Soon</span></span>
      </div>
      <div className="nav-right">
        <Link href="/partner/" className="nav-subscribe">
          Partner With Us
        </Link>
      </div>
    </nav>
  );
}

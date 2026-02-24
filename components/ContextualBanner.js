import Link from 'next/link';

export default function ContextualBanner() {
  return (
    <div className="contextual-banner">
      <span className="contextual-banner-text">Your guide to Williamson County businesses.</span>
      <Link href="/partner/" className="contextual-banner-link">
        Get your business listed →
      </Link>
    </div>
  );
}

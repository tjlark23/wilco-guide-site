import BusinessCard from './BusinessCard';
import Link from 'next/link';

export default function CategoryRow({ title, count, categorySlug, businesses }) {
  return (
    <div className="category-row">
      <div className="section-header">
        <div className="section-title-group">
          <h2 className="section-title">{title}</h2>
          {count != null && (
            <span className="section-count">{count} listings</span>
          )}
        </div>
        {categorySlug && (
          <Link href={`/directory/category/${categorySlug}`} className="section-see-all">
            See all &rarr;
          </Link>
        )}
      </div>
      <div className="row-grid">
        {businesses.map((biz) => (
          <BusinessCard key={biz.slug} business={biz} />
        ))}
      </div>
    </div>
  );
}

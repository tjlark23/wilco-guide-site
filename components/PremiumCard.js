'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCategoryColor, getCategoryName } from './BusinessCard';

function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '\u2605'.repeat(full) + '\u2606'.repeat(empty);
}

export default function PremiumCard({ businesses, cycleSpeed = 5000 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % businesses.length);
  }, [businesses.length]);

  useEffect(() => {
    if (businesses.length <= 1) return;
    const interval = setInterval(advance, cycleSpeed);
    return () => clearInterval(interval);
  }, [advance, cycleSpeed, businesses.length]);

  if (!businesses || businesses.length === 0) return null;

  return (
    <div className="card-premium">
      {businesses.map((biz, index) => {
        const photoUrl = biz.photos && biz.photos.length > 0 ? biz.photos[0] : biz.image || null;
        const catColor = getCategoryColor(biz.category);
        const catName = getCategoryName(biz.category);
        return (
          <Link
            key={biz.slug}
            href={`/directory/business/${biz.slug}`}
            className={`card-content-set${index === activeIndex ? ' active' : ''}`}
          >
            <div className="card-media">
              {photoUrl && <img src={photoUrl} alt={biz.name} />}
            </div>
            <div className="card-overlay" />
            <div className="card-info">
              <div className="card-name">{biz.name}</div>
              {biz.city && <div className="card-location">{biz.city}, TX</div>}
              <div className="card-bottom-bar">
                {biz.rating != null && (
                  <div className="card-rating">
                    <span className="stars">{renderStars(biz.rating)}</span>
                    {biz.reviewCount != null && (
                      <span className="rating-count">({biz.reviewCount})</span>
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
      })}
      {businesses.length > 1 && (
        <div className="auto-scroll-indicator">
          {businesses.map((_, index) => (
            <span
              key={index}
              className={`scroll-pip${index === activeIndex ? ' active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

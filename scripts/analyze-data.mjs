/**
 * Data Quality Analysis for WilCo Guide Business Directory
 * Usage: node scripts/analyze-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const businesses = JSON.parse(readFileSync(join(__dirname, 'raw-businesses.json'), 'utf8'));
const reviews = JSON.parse(readFileSync(join(__dirname, 'raw-reviews.json'), 'utf8'));

const WILCO_CITIES = [
  'Round Rock', 'Georgetown', 'Cedar Park', 'Leander', 'Pflugerville',
  'Hutto', 'Taylor', 'Liberty Hill', 'Jarrell', 'Florence',
  'Granger', 'Thrall', 'Bartlett', 'Coupland', 'Weir', 'Walburg',
  'Schwertner', 'Andice'
];

const wilcoCitiesLower = WILCO_CITIES.map(c => c.toLowerCase());

let report = [];
const log = (msg = '') => { report.push(msg); console.log(msg); };

log('═══════════════════════════════════════════════════');
log('  WILCO GUIDE — DATA QUALITY REPORT');
log('  Generated: ' + new Date().toISOString().split('T')[0]);
log('═══════════════════════════════════════════════════');
log();

// ── 1. OVERVIEW ──
log('1. OVERVIEW');
log('─────────────────────────────────────────');
log(`Total businesses: ${businesses.length}`);
log(`Total reviews: ${reviews.length}`);
log(`Avg reviews per business: ${(reviews.length / businesses.length).toFixed(1)}`);
log();

// ── 2. CITY DISTRIBUTION ──
log('2. CITY DISTRIBUTION');
log('─────────────────────────────────────────');

const cityCounts = {};
let nullCity = 0;
let emptyCity = 0;

businesses.forEach(b => {
  const city = b.address_city;
  if (city === null || city === undefined) {
    nullCity++;
  } else if (city.trim() === '') {
    emptyCity++;
  } else {
    const normalized = city.trim();
    cityCounts[normalized] = (cityCounts[normalized] || 0) + 1;
  }
});

// Sort by count descending
const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

log(`\nNull/missing city: ${nullCity}`);
log(`Empty city string: ${emptyCity}`);
log(`Distinct city values: ${sortedCities.length}`);
log();

// Separate WilCo vs non-WilCo cities
const wilcoCities = [];
const nonWilcoCities = [];
let wilcoTotal = 0;
let nonWilcoTotal = 0;

sortedCities.forEach(([city, count]) => {
  if (wilcoCitiesLower.includes(city.toLowerCase())) {
    wilcoCities.push([city, count]);
    wilcoTotal += count;
  } else {
    nonWilcoCities.push([city, count]);
    nonWilcoTotal += count;
  }
});

log('WILLIAMSON COUNTY CITIES:');
wilcoCities.forEach(([city, count]) => {
  const pct = ((count / businesses.length) * 100).toFixed(1);
  log(`  ${city.padEnd(20)} ${String(count).padStart(5)}  (${pct}%)`);
});
log(`  ${'SUBTOTAL'.padEnd(20)} ${String(wilcoTotal).padStart(5)}  (${((wilcoTotal / businesses.length) * 100).toFixed(1)}%)`);
log();

log('NON-WILLIAMSON COUNTY CITIES (flagged):');
nonWilcoCities.forEach(([city, count]) => {
  const pct = ((count / businesses.length) * 100).toFixed(1);
  log(`  ⚠ ${city.padEnd(18)} ${String(count).padStart(5)}  (${pct}%)`);
});
log(`  ${'SUBTOTAL'.padEnd(20)} ${String(nonWilcoTotal).padStart(5)}  (${((nonWilcoTotal / businesses.length) * 100).toFixed(1)}%)`);
log();

// ── 3. CATEGORY DISTRIBUTION ──
log('3. CATEGORY DISTRIBUTION');
log('─────────────────────────────────────────');

const catCounts = {};
let nullCat = 0;
businesses.forEach(b => {
  const cat = b.category;
  if (!cat || cat.trim() === '') {
    nullCat++;
  } else {
    catCounts[cat.trim()] = (catCounts[cat.trim()] || 0) + 1;
  }
});

const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
log(`Null/empty category: ${nullCat}`);
log(`Distinct categories: ${sortedCats.length}`);
log();

// Show top 50 categories
log('TOP 50 CATEGORIES:');
sortedCats.slice(0, 50).forEach(([cat, count], i) => {
  log(`  ${String(i + 1).padStart(3)}. ${cat.padEnd(45)} ${String(count).padStart(5)}`);
});

if (sortedCats.length > 50) {
  const remaining = sortedCats.slice(50).reduce((sum, [, c]) => sum + c, 0);
  log(`  ... plus ${sortedCats.length - 50} more categories (${remaining} businesses)`);
}
log();

// ── 4. DATA COMPLETENESS ──
log('4. DATA COMPLETENESS');
log('─────────────────────────────────────────');

const fields = [
  { name: 'name', check: b => b.name && b.name.trim() !== '' },
  { name: 'slug', check: b => b.slug && b.slug.trim() !== '' },
  { name: 'category', check: b => b.category && b.category.trim() !== '' },
  { name: 'address_street', check: b => b.address_street && b.address_street.trim() !== '' },
  { name: 'address_city', check: b => b.address_city && b.address_city.trim() !== '' },
  { name: 'address_state', check: b => b.address_state && b.address_state.trim() !== '' },
  { name: 'address_zip', check: b => b.address_zip && b.address_zip.trim() !== '' },
  { name: 'phone', check: b => b.phone && b.phone.trim() !== '' },
  { name: 'website', check: b => b.website && b.website.trim() !== '' },
  { name: 'email', check: b => b.email && b.email.trim() !== '' },
  { name: 'hours', check: b => b.hours && (typeof b.hours === 'object' ? Object.keys(b.hours).length > 0 : b.hours.trim() !== '') },
  { name: 'rating', check: b => b.rating !== null && b.rating !== undefined && b.rating > 0 },
  { name: 'review_count', check: b => b.review_count !== null && b.review_count > 0 },
  { name: 'price_range', check: b => b.price_range && b.price_range.trim() !== '' },
  { name: 'photos (array)', check: b => Array.isArray(b.photos) && b.photos.length > 0 },
  { name: 'image (single)', check: b => b.image && b.image.trim() !== '' },
  { name: 'description', check: b => b.description && b.description.trim() !== '' },
  { name: 'latitude', check: b => b.latitude !== null && b.latitude !== undefined },
  { name: 'longitude', check: b => b.longitude !== null && b.longitude !== undefined },
  { name: 'specialties', check: b => b.specialties && (Array.isArray(b.specialties) ? b.specialties.length > 0 : b.specialties.trim() !== '') },
  { name: 'tags', check: b => b.tags && (Array.isArray(b.tags) ? b.tags.length > 0 : false) },
];

log(`${'Field'.padEnd(25)} ${'Has Data'.padStart(7)} ${'Missing'.padStart(8)} ${'%'.padStart(7)}`);
log('─'.repeat(50));

fields.forEach(f => {
  const has = businesses.filter(f.check).length;
  const missing = businesses.length - has;
  const pct = ((has / businesses.length) * 100).toFixed(1);
  log(`${f.name.padEnd(25)} ${String(has).padStart(7)} ${String(missing).padStart(8)} ${(pct + '%').padStart(7)}`);
});
log();

// ── 5. RATING DISTRIBUTION ──
log('5. RATING DISTRIBUTION');
log('─────────────────────────────────────────');

const ratingBuckets = { 'No rating': 0, '1.0-1.9': 0, '2.0-2.9': 0, '3.0-3.9': 0, '4.0-4.4': 0, '4.5-4.9': 0, '5.0': 0 };
businesses.forEach(b => {
  const r = b.rating;
  if (!r || r === 0) ratingBuckets['No rating']++;
  else if (r < 2) ratingBuckets['1.0-1.9']++;
  else if (r < 3) ratingBuckets['2.0-2.9']++;
  else if (r < 4) ratingBuckets['3.0-3.9']++;
  else if (r < 4.5) ratingBuckets['4.0-4.4']++;
  else if (r < 5) ratingBuckets['4.5-4.9']++;
  else ratingBuckets['5.0']++;
});

Object.entries(ratingBuckets).forEach(([bucket, count]) => {
  const bar = '█'.repeat(Math.round(count / businesses.length * 50));
  log(`  ${bucket.padEnd(12)} ${String(count).padStart(5)} ${bar}`);
});

const avgRating = businesses.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / businesses.filter(b => b.rating > 0).length;
log(`\n  Average rating (where available): ${avgRating.toFixed(2)}`);
log();

// ── 6. REVIEW DISTRIBUTION ──
log('6. REVIEW DISTRIBUTION');
log('─────────────────────────────────────────');

const reviewBuckets = { '0 reviews': 0, '1-5': 0, '6-20': 0, '21-50': 0, '51-100': 0, '101-500': 0, '500+': 0 };
businesses.forEach(b => {
  const rc = b.review_count || 0;
  if (rc === 0) reviewBuckets['0 reviews']++;
  else if (rc <= 5) reviewBuckets['1-5']++;
  else if (rc <= 20) reviewBuckets['6-20']++;
  else if (rc <= 50) reviewBuckets['21-50']++;
  else if (rc <= 100) reviewBuckets['51-100']++;
  else if (rc <= 500) reviewBuckets['101-500']++;
  else reviewBuckets['500+']++;
});

Object.entries(reviewBuckets).forEach(([bucket, count]) => {
  const bar = '█'.repeat(Math.round(count / businesses.length * 50));
  log(`  ${bucket.padEnd(12)} ${String(count).padStart(5)} ${bar}`);
});
log();

// ── 7. PARTNER TIER / LISTING TIER ──
log('7. LISTING & PARTNER TIERS');
log('─────────────────────────────────────────');

const partnerTiers = {};
businesses.forEach(b => {
  const tier = b.partner_tier || 'null';
  partnerTiers[tier] = (partnerTiers[tier] || 0) + 1;
});
Object.entries(partnerTiers).sort((a, b) => b[1] - a[1]).forEach(([tier, count]) => {
  log(`  ${tier.padEnd(20)} ${count}`);
});

const listingTiers = {};
businesses.forEach(b => {
  const tier = b.listing_tier || 'null';
  listingTiers[tier] = (listingTiers[tier] || 0) + 1;
});
log();
log('Listing tiers:');
Object.entries(listingTiers).sort((a, b) => b[1] - a[1]).forEach(([tier, count]) => {
  log(`  ${tier.padEnd(20)} ${count}`);
});
log();

// ── 8. SUBCATEGORY SAMPLE ──
log('8. SUBCATEGORY SAMPLE (top 30)');
log('─────────────────────────────────────────');

const subCounts = {};
businesses.forEach(b => {
  if (b.subcategory) {
    const sub = typeof b.subcategory === 'string' ? b.subcategory : JSON.stringify(b.subcategory);
    subCounts[sub] = (subCounts[sub] || 0) + 1;
  }
});
const sortedSubs = Object.entries(subCounts).sort((a, b) => b[1] - a[1]);
sortedSubs.slice(0, 30).forEach(([sub, count], i) => {
  log(`  ${String(i + 1).padStart(3)}. ${sub.substring(0, 50).padEnd(50)} ${String(count).padStart(5)}`);
});
log();

// ── 9. SAMPLE RECORD ──
log('9. SAMPLE BUSINESS RECORD (first record)');
log('─────────────────────────────────────────');
const sample = businesses[0];
Object.entries(sample).forEach(([key, val]) => {
  let display = val;
  if (typeof val === 'object' && val !== null) {
    display = JSON.stringify(val).substring(0, 100);
  }
  if (typeof val === 'string' && val.length > 100) {
    display = val.substring(0, 100) + '...';
  }
  log(`  ${key.padEnd(25)} ${display}`);
});
log();

log('10. SAMPLE REVIEW RECORD (first record)');
log('─────────────────────────────────────────');
if (reviews.length > 0) {
  const sampleRev = reviews[0];
  Object.entries(sampleRev).forEach(([key, val]) => {
    let display = val;
    if (typeof val === 'string' && val.length > 100) display = val.substring(0, 100) + '...';
    log(`  ${key.padEnd(25)} ${display}`);
  });
}
log();

log('═══════════════════════════════════════════════════');
log('  END OF REPORT');
log('═══════════════════════════════════════════════════');

// Save report
const reportPath = join(__dirname, 'data-quality-report.txt');
writeFileSync(reportPath, report.join('\n'));
console.log(`\nReport saved to: ${reportPath}`);

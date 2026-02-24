/**
 * Process raw Supabase data with TJ's cleanup rules:
 * 1. EXCLUDE all Austin businesses
 * 2. EXCLUDE all non-WilCo/out-of-state businesses
 * 3. KEEP Jarrell/Florence/Granger but no standalone city pages for <50 businesses
 * 4. Merge duplicate capitalization variants (Pets→pets, Home→home, etc.)
 * 5. Normalize "liberty hill" → "Liberty Hill"
 *
 * Usage: node scripts/process-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const rawBusinesses = JSON.parse(readFileSync(join(__dirname, 'raw-businesses.json'), 'utf8'));
const rawReviews = JSON.parse(readFileSync(join(__dirname, 'raw-reviews.json'), 'utf8'));

// ── WILCO CITIES (canonical names) ──
const WILCO_CITIES = new Map([
  ['round rock', 'Round Rock'],
  ['georgetown', 'Georgetown'],
  ['cedar park', 'Cedar Park'],
  ['leander', 'Leander'],
  ['pflugerville', 'Pflugerville'],
  ['hutto', 'Hutto'],
  ['taylor', 'Taylor'],
  ['liberty hill', 'Liberty Hill'],
  ['jarrell', 'Jarrell'],
  ['florence', 'Florence'],
  ['granger', 'Granger'],
  ['thrall', 'Thrall'],
  ['bartlett', 'Bartlett'],
  ['coupland', 'Coupland'],
  ['weir', 'Weir'],
  ['walburg', 'Walburg'],
  ['schwertner', 'Schwertner'],
  ['andice', 'Andice'],
]);

// ── CATEGORY NORMALIZATION ──
// Merge duplicate capitalization variants to lowercase
function normalizeCategory(cat) {
  if (!cat) return null;
  return cat.trim().toLowerCase();
}

let report = [];
const log = (msg = '') => { report.push(msg); console.log(msg); };

log('═══════════════════════════════════════════════════');
log('  WILCO GUIDE — PROCESSED DATA REPORT');
log('  Generated: ' + new Date().toISOString().split('T')[0]);
log('═══════════════════════════════════════════════════');
log();

// ── STEP 1: Filter to WilCo cities only ──
log('STEP 1: Filter to Williamson County cities');
log('─────────────────────────────────────────');

let excluded = { austin: 0, nonWilco: 0 };
const cleanBusinesses = [];

rawBusinesses.forEach(b => {
  const cityRaw = (b.address_city || '').trim();
  const cityLower = cityRaw.toLowerCase();

  // Exclude Austin
  if (cityLower === 'austin') {
    excluded.austin++;
    return;
  }

  // Check if WilCo city
  if (!WILCO_CITIES.has(cityLower)) {
    excluded.nonWilco++;
    return;
  }

  // Normalize city name
  b.address_city = WILCO_CITIES.get(cityLower);

  // Normalize category
  b.category = normalizeCategory(b.category);

  cleanBusinesses.push(b);
});

log(`Raw total: ${rawBusinesses.length}`);
log(`Excluded Austin: ${excluded.austin}`);
log(`Excluded non-WilCo: ${excluded.nonWilco}`);
log(`Remaining WilCo businesses: ${cleanBusinesses.length}`);
log();

// ── STEP 2: City counts ──
log('STEP 2: City Distribution (clean)');
log('─────────────────────────────────────────');

const cityCounts = {};
cleanBusinesses.forEach(b => {
  cityCounts[b.address_city] = (cityCounts[b.address_city] || 0) + 1;
});

const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
const CITY_PAGE_THRESHOLD = 50;

let totalWithPages = 0;
let totalWithoutPages = 0;

sortedCities.forEach(([city, count]) => {
  const hasPage = count >= CITY_PAGE_THRESHOLD;
  const marker = hasPage ? '✓ page' : '  (no standalone page)';
  log(`  ${city.padEnd(20)} ${String(count).padStart(5)}  ${marker}`);
  if (hasPage) totalWithPages += count;
  else totalWithoutPages += count;
});

log();
log(`Cities with standalone pages (≥${CITY_PAGE_THRESHOLD}): ${sortedCities.filter(([,c]) => c >= CITY_PAGE_THRESHOLD).length}`);
log(`Cities without pages (<${CITY_PAGE_THRESHOLD}): ${sortedCities.filter(([,c]) => c < CITY_PAGE_THRESHOLD).length}`);
log(`Businesses in page-eligible cities: ${totalWithPages}`);
log(`Businesses in small cities (still in directory/search): ${totalWithoutPages}`);
log();

// ── STEP 3: Category counts ──
log('STEP 3: Category Distribution (clean)');
log('─────────────────────────────────────────');

const catCounts = {};
cleanBusinesses.forEach(b => {
  catCounts[b.category] = (catCounts[b.category] || 0) + 1;
});

const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

sortedCats.forEach(([cat, count]) => {
  const pct = ((count / cleanBusinesses.length) * 100).toFixed(1);
  log(`  ${cat.padEnd(20)} ${String(count).padStart(5)}  (${pct}%)`);
});

log(`\nTotal categories: ${sortedCats.length}`);
log();

// ── STEP 4: Subcategory breakdown per category ──
log('STEP 4: Subcategory Breakdown');
log('─────────────────────────────────────────');

sortedCats.forEach(([cat]) => {
  const bizInCat = cleanBusinesses.filter(b => b.category === cat);
  const subCounts = {};
  bizInCat.forEach(b => {
    const sub = b.subcategory || '(none)';
    subCounts[sub] = (subCounts[sub] || 0) + 1;
  });
  const sortedSubs = Object.entries(subCounts).sort((a, b) => b[1] - a[1]);
  log(`\n  ${cat.toUpperCase()} (${bizInCat.length} total):`);
  sortedSubs.forEach(([sub, count]) => {
    log(`    ${sub.padEnd(40)} ${count}`);
  });
});
log();

// ── STEP 5: City × Category matrix ──
log('STEP 5: City × Category Matrix (combos with 3+ businesses)');
log('─────────────────────────────────────────');

const comboCounts = {};
cleanBusinesses.forEach(b => {
  const key = `${b.address_city}|${b.category}`;
  comboCounts[key] = (comboCounts[key] || 0) + 1;
});

const validCombos = Object.entries(comboCounts)
  .filter(([, count]) => count >= 3)
  .sort((a, b) => b[1] - a[1]);

log(`Total city×category combos with 3+ businesses: ${validCombos.length}`);
log();
log('Top 20:');
validCombos.slice(0, 20).forEach(([key, count]) => {
  const [city, cat] = key.split('|');
  log(`  ${city.padEnd(16)} ${cat.padEnd(18)} ${count}`);
});
log();

// ── STEP 6: Review linkage ──
log('STEP 6: Review Linkage');
log('─────────────────────────────────────────');

const cleanBizIds = new Set(cleanBusinesses.map(b => b.id));
const linkedReviews = rawReviews.filter(r => cleanBizIds.has(r.business_id));
const orphanReviews = rawReviews.length - linkedReviews.length;

log(`Total raw reviews: ${rawReviews.length}`);
log(`Reviews linked to clean businesses: ${linkedReviews.length}`);
log(`Orphaned reviews (excluded businesses): ${orphanReviews}`);

// Reviews per business distribution
const revPerBiz = {};
linkedReviews.forEach(r => {
  revPerBiz[r.business_id] = (revPerBiz[r.business_id] || 0) + 1;
});
const bizWithReviews = Object.keys(revPerBiz).length;
log(`Businesses with at least 1 review in DB: ${bizWithReviews} / ${cleanBusinesses.length}`);
log();

// ── STEP 7: Data completeness (clean set) ──
log('STEP 7: Data Completeness (clean set)');
log('─────────────────────────────────────────');

const fields = [
  { name: 'phone', check: b => b.phone && b.phone.trim() !== '' },
  { name: 'website', check: b => b.website && b.website.trim() !== '' },
  { name: 'hours', check: b => b.hours && typeof b.hours === 'object' && Object.keys(b.hours).length > 0 },
  { name: 'photos', check: b => Array.isArray(b.photos) && b.photos.length > 0 },
  { name: 'image', check: b => b.image && b.image.trim() !== '' },
  { name: 'rating > 0', check: b => b.rating > 0 },
  { name: 'description', check: b => b.description && b.description.trim().length > 10 },
  { name: 'lat/lng', check: b => b.latitude && b.longitude },
  { name: 'price_range', check: b => b.price_range && b.price_range.trim() !== '' },
  { name: 'slug', check: b => b.slug && b.slug.trim() !== '' },
];

fields.forEach(f => {
  const has = cleanBusinesses.filter(f.check).length;
  const pct = ((has / cleanBusinesses.length) * 100).toFixed(1);
  log(`  ${f.name.padEnd(20)} ${String(has).padStart(5)} / ${cleanBusinesses.length}  (${pct}%)`);
});
log();

// ── FINAL SUMMARY ──
log('═══════════════════════════════════════════════════');
log('  FINAL SUMMARY');
log('═══════════════════════════════════════════════════');
log();
log(`Clean businesses: ${cleanBusinesses.length}`);
log(`Linked reviews: ${linkedReviews.length}`);
log(`Cities with pages: ${sortedCities.filter(([,c]) => c >= CITY_PAGE_THRESHOLD).length}`);
log(`Categories: ${sortedCats.length}`);
log(`City×Category combo pages (3+): ${validCombos.length}`);
log();
log('Estimated page count:');
log(`  1 directory index`);
log(`  ${sortedCats.length} category pages`);
log(`  ${sortedCities.filter(([,c]) => c >= CITY_PAGE_THRESHOLD).length} city pages`);
log(`  ${cleanBusinesses.length} business profile pages`);
log(`  ${validCombos.length} city×category combo pages`);
log(`  1 search page`);
const totalPages = 1 + sortedCats.length + sortedCities.filter(([,c]) => c >= CITY_PAGE_THRESHOLD).length + cleanBusinesses.length + validCombos.length + 1;
log(`  ─────────────`);
log(`  ${totalPages} TOTAL PAGES`);
log();

// Save report
const reportPath = join(__dirname, 'clean-data-report.txt');
writeFileSync(reportPath, report.join('\n'));
console.log(`Report saved to: ${reportPath}`);

// Save clean data files
writeFileSync(join(__dirname, 'clean-businesses.json'), JSON.stringify(cleanBusinesses, null, 2));
writeFileSync(join(__dirname, 'clean-reviews.json'), JSON.stringify(linkedReviews, null, 2));
console.log(`Saved ${cleanBusinesses.length} clean businesses`);
console.log(`Saved ${linkedReviews.length} clean reviews`);

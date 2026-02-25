import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('data/clean-businesses.json', 'utf8'));

let noPhotos = 0;
let onePhoto = 0;
let twoPhotos = 0;
let threePhotos = 0;
let fourPlus = 0;
let noImage = 0;
let hasGooglePlaceId = 0;
let needsEnrichment = [];

data.forEach(b => {
  const photoCount = (b.photos && Array.isArray(b.photos)) ? b.photos.length : 0;
  const hasMainImage = !!b.image;

  if (photoCount === 0) noPhotos++;
  else if (photoCount === 1) onePhoto++;
  else if (photoCount === 2) twoPhotos++;
  else if (photoCount === 3) threePhotos++;
  else fourPlus++;

  if (!hasMainImage && photoCount === 0) noImage++;
  if (b.google_place_id) hasGooglePlaceId++;

  // Needs enrichment: 3 or fewer photos
  if (photoCount <= 3) {
    needsEnrichment.push({
      id: b.id,
      name: b.name,
      slug: b.slug,
      google_place_id: b.google_place_id || null,
      currentPhotos: photoCount,
      hasMainImage: hasMainImage,
    });
  }
});

console.log('=== PHOTO ANALYSIS ===');
console.log(`Total businesses: ${data.length}`);
console.log(`  0 photos: ${noPhotos}`);
console.log(`  1 photo:  ${onePhoto}`);
console.log(`  2 photos: ${twoPhotos}`);
console.log(`  3 photos: ${threePhotos}`);
console.log(`  4+ photos: ${fourPlus}`);
console.log(`  No image at all (no .image and no .photos): ${noImage}`);
console.log('');
console.log(`Have google_place_id: ${hasGooglePlaceId}`);
console.log(`Need enrichment (<=3 photos): ${needsEnrichment.length}`);
console.log(`  Of those, have google_place_id: ${needsEnrichment.filter(b => b.google_place_id).length}`);
console.log(`  Of those, missing google_place_id: ${needsEnrichment.filter(b => !b.google_place_id).length}`);
console.log('');

// Show sample businesses for test run
const withPlaceId = needsEnrichment.filter(b => b.google_place_id);
console.log('=== SAMPLE FOR TEST (first 3 with google_place_id and 0-1 photos) ===');
const testCandidates = withPlaceId.filter(b => b.currentPhotos <= 1).slice(0, 3);
testCandidates.forEach(b => {
  console.log(`  ${b.name} | place_id: ${b.google_place_id} | photos: ${b.currentPhotos} | image: ${b.hasMainImage}`);
});

// Also check what photo URLs look like
const sampleWithPhotos = data.filter(b => b.photos && b.photos.length > 0).slice(0, 3);
console.log('');
console.log('=== SAMPLE EXISTING PHOTO URLS ===');
sampleWithPhotos.forEach(b => {
  console.log(`  ${b.name}:`);
  b.photos.slice(0, 2).forEach(url => console.log(`    ${url.substring(0, 100)}...`));
});

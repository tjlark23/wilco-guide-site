import { readFileSync, writeFileSync } from 'fs';

const RESULTS_FILE = 'scripts/enrich-results.json';
const DATA_FILE = 'data/clean-businesses.json';

// Load
const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

console.log(`Enrichment results: ${Object.keys(results).length} businesses`);
console.log(`Business data: ${data.length} businesses`);

let updated = 0;
let beforePhotos = { zero: 0, one: 0, two: 0, three: 0, fourPlus: 0 };
let afterPhotos = { zero: 0, one: 0, two: 0, three: 0, fourPlus: 0 };

function countBucket(obj, count) {
  if (count === 0) obj.zero++;
  else if (count === 1) obj.one++;
  else if (count === 2) obj.two++;
  else if (count === 3) obj.three++;
  else obj.fourPlus++;
}

data.forEach(b => {
  const beforeCount = (b.photos || []).length;
  countBucket(beforePhotos, beforeCount);

  if (results[b.id]) {
    const enrichment = results[b.id];
    b.photos = enrichment.photos;
    // Update main image to first photo
    if (enrichment.imageUrl) {
      b.image = enrichment.imageUrl;
    }
    updated++;
  }

  const afterCount = (b.photos || []).length;
  countBucket(afterPhotos, afterCount);
});

console.log(`\nUpdated ${updated} businesses`);
console.log('\n=== BEFORE ===');
console.log(`  0 photos: ${beforePhotos.zero}`);
console.log(`  1 photo:  ${beforePhotos.one}`);
console.log(`  2 photos: ${beforePhotos.two}`);
console.log(`  3 photos: ${beforePhotos.three}`);
console.log(`  4+ photos: ${beforePhotos.fourPlus}`);

console.log('\n=== AFTER ===');
console.log(`  0 photos: ${afterPhotos.zero}`);
console.log(`  1 photo:  ${afterPhotos.one}`);
console.log(`  2 photos: ${afterPhotos.two}`);
console.log(`  3 photos: ${afterPhotos.three}`);
console.log(`  4+ photos: ${afterPhotos.fourPlus}`);

// Save
writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
console.log(`\nSaved updated data to ${DATA_FILE}`);

// Also copy to scripts/ for backup
writeFileSync('scripts/clean-businesses.json', JSON.stringify(data, null, 2));
console.log('Backup saved to scripts/clean-businesses.json');

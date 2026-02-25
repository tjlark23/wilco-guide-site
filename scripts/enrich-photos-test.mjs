import { readFileSync } from 'fs';

const APIFY_TOKEN = 'apify_api_kN2Ch4Br6pVNMz13oHyCPP438UwYO81MQhtH';
const ACTOR_ID = 'compass/crawler-google-places';

// Load businesses and pick 3 test candidates with 0-1 photos
const data = JSON.parse(readFileSync('data/clean-businesses.json', 'utf8'));
const candidates = data.filter(b => {
  const photoCount = (b.photos && Array.isArray(b.photos)) ? b.photos.length : 0;
  return photoCount <= 1 && b.name && b.address_city;
});

// Pick 3 well-known businesses for easy verification
const testBusinesses = candidates.slice(0, 3);

console.log('=== TEST BUSINESSES ===');
testBusinesses.forEach((b, i) => {
  const photoCount = (b.photos || []).length;
  console.log(`${i + 1}. ${b.name} | ${b.address_city}, TX | photos: ${photoCount}`);
});
console.log('');

// Build search queries
const searchQueries = testBusinesses.map(b => `${b.name} ${b.address_city} TX`);

console.log('=== SEARCH QUERIES ===');
searchQueries.forEach(q => console.log(`  "${q}"`));
console.log('');

// Call Apify API - run actor synchronously
async function runApify(queries) {
  const input = {
    searchStringsArray: queries,
    maxCrawledPlacesPerSearch: 1,
    language: 'en',
    maxImages: 5,
    scrapeImageAuthors: false,
    scrapeReviewerName: false,
    scrapeReviews: false,
    onlyDataFromSearchPage: false,
  };

  console.log('Calling Apify actor...');

  // Start the actor run
  const encodedActor = encodeURIComponent(ACTOR_ID);
  const startUrl = `https://api.apify.com/v2/acts/${encodedActor}/runs?token=${APIFY_TOKEN}`;
  const startRes = await fetch(startUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!startRes.ok) {
    const errText = await startRes.text();
    throw new Error(`Failed to start actor: ${startRes.status} ${errText}`);
  }

  const runData = await startRes.json();
  const runId = runData.data.id;
  console.log(`Run started: ${runId}`);
  console.log(`Status: ${runData.data.status}`);

  // Wait for completion
  console.log('Waiting for run to complete...');
  const waitUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}&waitForFinish=300`;

  let status = runData.data.status;
  while (status === 'RUNNING' || status === 'READY') {
    const waitRes = await fetch(waitUrl);
    const waitData = await waitRes.json();
    status = waitData.data.status;
    console.log(`  Status: ${status}`);

    if (status === 'SUCCEEDED') break;
    if (status === 'FAILED' || status === 'ABORTED') {
      throw new Error(`Run ${status}`);
    }

    // Wait 5 seconds before checking again
    await new Promise(r => setTimeout(r, 5000));
  }

  // Get results from dataset
  const datasetId = runData.data.defaultDatasetId;
  const resultsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
  const resultsRes = await fetch(resultsUrl);
  const results = await resultsRes.json();

  return results;
}

async function main() {
  try {
    const results = await runApify(searchQueries);

    console.log(`\n=== APIFY RESULTS (${results.length} places found) ===\n`);

    results.forEach((place, i) => {
      console.log(`--- Result ${i + 1} ---`);
      console.log(`  Name: ${place.title || place.name}`);
      console.log(`  Address: ${place.address}`);
      console.log(`  Rating: ${place.totalScore} (${place.reviewsCount} reviews)`);
      console.log(`  Place ID: ${place.placeId}`);

      // Check imageUrls (plural - array of photo URLs)
      const imageUrls = place.imageUrls || [];
      console.log(`  imageUrls count: ${imageUrls.length}`);

      // Filter to lh3.googleusercontent.com
      const googlePhotos = imageUrls.filter(url => url.includes('lh3.googleusercontent.com'));
      console.log(`  Google Photos (lh3): ${googlePhotos.length}`);
      googlePhotos.forEach((url, j) => console.log(`    [${j}] ${url.substring(0, 100)}...`));

      // Also check imageUrl (singular - main image)
      if (place.imageUrl) {
        console.log(`  imageUrl (main): ${place.imageUrl.substring(0, 100)}...`);
      }

      console.log('');
    });

    // Now match results back to our businesses
    console.log('=== MATCHING RESULTS TO BUSINESSES ===\n');

    testBusinesses.forEach((biz, i) => {
      const bizNameLower = biz.name.toLowerCase().trim();

      // Find best match by name similarity
      let bestMatch = null;
      let bestScore = 0;

      results.forEach(place => {
        const placeName = (place.title || place.name || '').toLowerCase().trim();
        // Simple matching: check if names overlap significantly
        const bizWords = bizNameLower.split(/\s+/);
        const placeWords = placeName.split(/\s+/);
        const matchingWords = bizWords.filter(w => placeWords.some(pw => pw.includes(w) || w.includes(pw)));
        const score = matchingWords.length / Math.max(bizWords.length, 1);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = place;
        }
      });

      console.log(`${i + 1}. ${biz.name}`);
      console.log(`   Current photos: ${(biz.photos || []).length}`);

      if (bestMatch && bestScore >= 0.5) {
        const newPhotos = (bestMatch.imageUrls || []).filter(url => url.includes('lh3.googleusercontent.com'));
        console.log(`   Matched to: ${bestMatch.title || bestMatch.name} (score: ${bestScore.toFixed(2)})`);
        console.log(`   Place ID: ${bestMatch.placeId}`);
        console.log(`   New photos available: ${newPhotos.length}`);

        // Merge and deduplicate
        const existing = biz.photos || [];
        const merged = [...existing];
        const existingBases = new Set(existing.map(url => url.split('=')[0]));

        newPhotos.forEach(url => {
          const base = url.split('=')[0];
          if (!existingBases.has(base)) {
            merged.push(url);
            existingBases.add(base);
          }
        });

        const final = merged.slice(0, 5);
        console.log(`   After merge+dedup: ${final.length} photos (was ${existing.length})`);
        final.forEach((url, j) => console.log(`     [${j}] ${url.substring(0, 80)}...`));
      } else {
        console.log(`   NO MATCH FOUND (best score: ${bestScore.toFixed(2)})`);
      }
      console.log('');
    });

  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

main();

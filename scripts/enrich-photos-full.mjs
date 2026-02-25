import { readFileSync, writeFileSync, existsSync } from 'fs';

const APIFY_TOKEN = 'apify_api_kN2Ch4Br6pVNMz13oHyCPP438UwYO81MQhtH';
const ACTOR_ID = 'compass/crawler-google-places';
const BATCH_SIZE = 15;
const PROGRESS_FILE = 'scripts/enrich-progress.json';
const RESULTS_FILE = 'scripts/enrich-results.json';

// ── Load data ──────────────────────────────────────────────────────────
const data = JSON.parse(readFileSync('data/clean-businesses.json', 'utf8'));
console.log(`Total businesses: ${data.length}`);

// Filter to businesses needing enrichment (<=3 photos)
const needsEnrichment = data.filter(b => {
  const photoCount = (b.photos && Array.isArray(b.photos)) ? b.photos.length : 0;
  return photoCount <= 3 && b.name && b.address_city;
});
console.log(`Need enrichment: ${needsEnrichment.length}`);

// ── Load progress (for resuming) ───────────────────────────────────────
let progress = { completedBatches: 0, results: {} };
if (existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
  console.log(`Resuming from batch ${progress.completedBatches} (${Object.keys(progress.results).length} businesses enriched so far)`);
}

// ── Split into batches ─────────────────────────────────────────────────
const batches = [];
for (let i = 0; i < needsEnrichment.length; i += BATCH_SIZE) {
  batches.push(needsEnrichment.slice(i, i + BATCH_SIZE));
}
console.log(`Total batches: ${batches.length}`);
console.log('');

// ── Apify call ─────────────────────────────────────────────────────────
async function runApifyBatch(queries) {
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

  // Wait for completion (up to 5 minutes per batch)
  let status = runData.data.status;
  const maxWait = 300000; // 5 min
  const startTime = Date.now();

  while (status === 'RUNNING' || status === 'READY') {
    if (Date.now() - startTime > maxWait) {
      throw new Error(`Timeout waiting for run ${runId}`);
    }
    await new Promise(r => setTimeout(r, 5000));
    const waitUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`;
    const waitRes = await fetch(waitUrl);
    const waitData = await waitRes.json();
    status = waitData.data.status;
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Run ${runId} ended with status: ${status}`);
  }

  // Get results
  const datasetId = runData.data.defaultDatasetId;
  const resultsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
  const resultsRes = await fetch(resultsUrl);
  return await resultsRes.json();
}

// ── Name matching ──────────────────────────────────────────────────────
function matchScore(bizName, placeName) {
  const a = bizName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const b = placeName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (a === b) return 1.0;

  const aWords = a.split(/\s+/).filter(w => w.length > 1);
  const bWords = b.split(/\s+/).filter(w => w.length > 1);
  if (aWords.length === 0) return 0;

  const matching = aWords.filter(w => bWords.some(bw => bw.includes(w) || w.includes(bw)));
  return matching.length / aWords.length;
}

function findBestMatch(biz, places) {
  let best = null;
  let bestScore = 0;

  for (const place of places) {
    const name = place.title || place.name || '';
    const score = matchScore(biz.name, name);

    // Also check city matches
    const placeCity = (place.city || place.address || '').toLowerCase();
    const bizCity = (biz.address_city || '').toLowerCase();
    const cityMatch = placeCity.includes(bizCity);

    // Boost score if city matches
    const finalScore = cityMatch ? score : score * 0.8;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      best = place;
    }
  }

  return { match: best, score: bestScore };
}

// ── Main loop ──────────────────────────────────────────────────────────
async function main() {
  let enriched = 0;
  let noMatch = 0;
  let noPhotos = 0;
  let errors = 0;

  for (let batchIdx = progress.completedBatches; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchNum = batchIdx + 1;

    console.log(`\n── Batch ${batchNum}/${batches.length} (${batch.length} businesses) ──`);

    // Build search queries
    const queries = batch.map(b => `${b.name} ${b.address_city} TX`);

    try {
      const places = await runApifyBatch(queries);
      console.log(`  Apify returned ${places.length} results`);

      // Match each business to its result
      for (const biz of batch) {
        const { match, score } = findBestMatch(biz, places);

        if (match && score >= 0.5) {
          // Get Google photos from imageUrls
          let newPhotos = (match.imageUrls || []).filter(url =>
            url.includes('lh3.googleusercontent.com')
          );

          // Fallback to imageUrl (singular)
          if (newPhotos.length === 0 && match.imageUrl && match.imageUrl.includes('lh3.googleusercontent.com')) {
            newPhotos = [match.imageUrl];
          }

          if (newPhotos.length > 0) {
            // Merge with existing, deduplicate
            const existing = biz.photos || [];
            const merged = [...existing];
            const existingBases = new Set(existing.map(url => url.split('=')[0]));

            for (const url of newPhotos) {
              const base = url.split('=')[0];
              if (!existingBases.has(base)) {
                merged.push(url);
                existingBases.add(base);
              }
            }

            const final = merged.slice(0, 5);

            progress.results[biz.id] = {
              photos: final,
              placeId: match.placeId || null,
              matchScore: score,
              imageUrl: final[0],
            };
            enriched++;
          } else {
            noPhotos++;
          }
        } else {
          noMatch++;
        }
      }

      // Save progress after each batch
      progress.completedBatches = batchIdx + 1;
      writeFileSync(PROGRESS_FILE, JSON.stringify(progress));

      console.log(`  Running totals — enriched: ${enriched} | no match: ${noMatch} | no photos: ${noPhotos} | errors: ${errors}`);

      // Small delay between batches to be polite to Apify
      if (batchIdx < batches.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }

    } catch (err) {
      console.error(`  ERROR on batch ${batchNum}: ${err.message}`);
      errors++;
      // Save progress so we can resume
      progress.completedBatches = batchIdx + 1;
      writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
      // Continue to next batch
      continue;
    }
  }

  // ── Save final results ───────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('ENRICHMENT COMPLETE');
  console.log(`  Enriched: ${enriched}`);
  console.log(`  No match: ${noMatch}`);
  console.log(`  No photos from Apify: ${noPhotos}`);
  console.log(`  Batch errors: ${errors}`);
  console.log(`  Total results saved: ${Object.keys(progress.results).length}`);

  // Save results file
  writeFileSync(RESULTS_FILE, JSON.stringify(progress.results, null, 2));
  console.log(`\nResults saved to ${RESULTS_FILE}`);
  console.log('Run merge-photos.mjs next to apply to clean-businesses.json');
}

main().catch(err => {
  console.error('FATAL:', err);
  // Save whatever progress we have
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  process.exit(1);
});

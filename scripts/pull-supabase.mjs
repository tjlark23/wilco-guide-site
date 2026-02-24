/**
 * Pull all business and review data from Supabase
 * Usage: node scripts/pull-supabase.mjs
 */

const SUPABASE_URL = 'https://wdodhzqgmumrwgfihagc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkb2RoenFnbXVtcndnZmloYWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MzA4OTMsImV4cCI6MjA4NDAwNjg5M30.HBMlIvVSZzUtaCXsItllxrZiLVO_HbUgE4vnPvn861o';

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use Supabase REST API directly (no npm install needed)
async function supabaseQuery(table, from, to) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&offset=${from}&limit=${to - from + 1}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase query failed (${res.status}): ${body}`);
  }

  const totalCount = res.headers.get('content-range');
  const data = await res.json();
  return { data, totalCount };
}

async function pullAll(table) {
  const pageSize = 1000;
  let allData = [];
  let from = 0;
  let total = null;

  console.log(`Pulling ${table}...`);

  while (true) {
    const { data, totalCount } = await supabaseQuery(table, from, from + pageSize - 1);

    if (total === null && totalCount) {
      // Parse "0-999/4544" format
      const match = totalCount.match(/\/(\d+)/);
      if (match) total = parseInt(match[1]);
    }

    if (!data || data.length === 0) break;

    allData = allData.concat(data);
    console.log(`  Fetched ${allData.length}${total ? ` / ${total}` : ''} ${table}`);

    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`  DONE: ${allData.length} total ${table}\n`);
  return allData;
}

async function main() {
  console.log('=== Supabase Data Pull ===\n');

  // First, check what tables exist
  console.log('Testing connection...');
  try {
    const testRes = await fetch(`${SUPABASE_URL}/rest/v1/businesses?select=count&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    if (!testRes.ok) {
      const body = await testRes.text();
      console.error(`Connection failed (${testRes.status}): ${body}`);
      process.exit(1);
    }
    console.log('Connection OK\n');
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }

  // Pull businesses
  const businesses = await pullAll('businesses');
  const bizPath = join(__dirname, 'raw-businesses.json');
  writeFileSync(bizPath, JSON.stringify(businesses, null, 2));
  console.log(`Saved ${businesses.length} businesses to ${bizPath}\n`);

  // Pull reviews
  let reviews = [];
  try {
    reviews = await pullAll('reviews');
    const revPath = join(__dirname, 'raw-reviews.json');
    writeFileSync(revPath, JSON.stringify(reviews, null, 2));
    console.log(`Saved ${reviews.length} reviews to ${revPath}\n`);
  } catch (err) {
    console.log(`Reviews table error: ${err.message}`);
    console.log('(Reviews table may not exist or may be named differently)\n');
  }

  // Quick summary
  console.log('=== Quick Summary ===');
  console.log(`Businesses: ${businesses.length}`);
  console.log(`Reviews: ${reviews.length}`);

  if (businesses.length > 0) {
    console.log(`\nSample business fields: ${Object.keys(businesses[0]).join(', ')}`);
  }
  if (reviews.length > 0) {
    console.log(`Sample review fields: ${Object.keys(reviews[0]).join(', ')}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

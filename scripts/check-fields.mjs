import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('data/clean-businesses.json', 'utf8'));

// Get all field names from first 5 businesses
console.log('=== ALL FIELDS IN FIRST BUSINESS ===');
const first = data[0];
Object.keys(first).forEach(key => {
  const val = first[key];
  const display = typeof val === 'string' ? val.substring(0, 80) : JSON.stringify(val)?.substring(0, 80);
  console.log(`  ${key}: ${display}`);
});

// Check for any place_id-like fields
console.log('\n=== SEARCHING FOR PLACE_ID-LIKE FIELDS ===');
const allKeys = new Set();
data.forEach(b => Object.keys(b).forEach(k => allKeys.add(k)));
const placeKeys = [...allKeys].filter(k => k.toLowerCase().includes('place') || k.toLowerCase().includes('google') || k.toLowerCase().includes('gmap'));
console.log('Fields containing place/google/gmap:', placeKeys.length ? placeKeys : 'NONE');

// Check all keys
console.log('\n=== ALL UNIQUE FIELD NAMES ===');
[...allKeys].sort().forEach(k => console.log(`  ${k}`));

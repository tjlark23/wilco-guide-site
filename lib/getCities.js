import fs from 'fs';
import path from 'path';

let cities = null;

function loadCities() {
  if (!cities) {
    const filePath = path.join(process.cwd(), 'data', 'cities.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    cities = JSON.parse(fileContents);
  }
  return cities;
}

export function getCities() {
  return loadCities();
}

export function getCityBySlug(slug) {
  return loadCities().find(c => c.slug === slug);
}

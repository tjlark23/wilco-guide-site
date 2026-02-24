import fs from 'fs';
import path from 'path';

let categories = null;

function loadCategories() {
  if (!categories) {
    const filePath = path.join(process.cwd(), 'data', 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    categories = JSON.parse(fileContents);
  }
  return categories;
}

export function getCategories() {
  return loadCategories();
}

export function getCategoryBySlug(slug) {
  return loadCategories().find(c => c.slug === slug);
}

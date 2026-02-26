const fs = require('fs');
const path = require('path');

function walk(dir) {
  const results = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else if (stat.isFile() && /\.(jsx|js)$/.test(name)) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(path.resolve(__dirname, '../src'));
files.forEach(file => {
  let txt = fs.readFileSync(file, 'utf8');
  let updated = txt
    .replace(/base44Client/g, 'apiClient')
    .replace(/import\s+\{\s*base44\s*\}/g, 'import { api }')
    .replace(/base44\./g, 'api.');
  if (updated !== txt) {
    fs.writeFileSync(file, updated);
    console.log('Updated', file);
  }
});

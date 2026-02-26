const fs = require('fs');
const path = require('path');
const glob = require('glob');

glob('src/**/*.{jsx,js}', (err, files) => {
  if (err) throw err;
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
});

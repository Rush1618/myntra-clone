const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'myntra');
const oldUrl1 = 'https://myntra-clone-xj36.onrender.com';
const oldUrl2 = 'http://localhost:5000';
const newUrl = 'http://192.168.0.114:5000';

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      if (content.includes(oldUrl1)) {
        content = content.split(oldUrl1).join(newUrl);
        changed = true;
      }
      if (content.includes(oldUrl2)) {
        content = content.split(oldUrl2).join(newUrl);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated API URLs in: ${fullPath}`);
      }
    }
  }
}

findAndReplace(directoryPath);
console.log('✅ Done replacing API URLs.');

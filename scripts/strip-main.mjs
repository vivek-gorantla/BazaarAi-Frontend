import fs from 'fs';
import path from 'path';

const merchantDir = path.join(process.cwd(), 'app', 'merchant');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find and remove the <main> opening tag and any classNames inside it
  content = content.replace(/<main[^>]*>/g, '');
  
  // Remove the </main> closing tag
  content = content.replace(/<\/main>/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned inner main tag from ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file === 'page.tsx') {
      cleanFile(fullPath);
    }
  }
}

walkDir(merchantDir);

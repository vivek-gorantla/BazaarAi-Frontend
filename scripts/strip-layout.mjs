import fs from 'fs';
import path from 'path';

const merchantDir = path.join(process.cwd(), 'app', 'merchant');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove <aside>...</aside>
  // Since it's all on one line, we can just use regex with dotAll if needed, but it's probably just standard
  content = content.replace(/<aside.*?<\/aside>/s, '');
  
  // Remove <header>...</header>
  content = content.replace(/<header.*?<\/header>/s, '');
  
  // Remove <div className="pl-72">
  content = content.replace(/<div className="pl-72">/g, '');
  
  // Replace the closing </div></main></div> with just </main>
  content = content.replace(/<\/main><\/div>/g, '</main>');

  // Also remove <> and </> if they are now wrapping a single <main> element, but Next.js/React is fine with fragments anyway.
  // We'll leave them.
  
  // Wait, let's look at how the <main> tag is styled. 
  // <main className="relative pt-20 bg-background min-h-screen p-gutter overflow-x-hidden">
  // We should remove the pt-20 and min-h-screen since the new layout handles spacing.
  content = content.replace(/className="relative pt-20 bg-background min-h-screen/g, 'className="relative bg-transparent');
  content = content.replace(/className="relative pt-20 bg-background min-h-screen p-gutter/g, 'className="relative bg-transparent');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned ${filePath}`);
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

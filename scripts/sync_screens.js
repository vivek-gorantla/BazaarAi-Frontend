const fs = require('fs');
const path = require('path');
const https = require('https');
const { parse } = require('node-html-parser');

const screensDataPath = path.join(__dirname, 'screens.json');
const appDir = path.join(__dirname, '..', 'app');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
}

function htmlToJsx(html) {
  let jsx = html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/tabindex=/g, 'tabIndex=')
    .replace(/viewbox=/gi, 'viewBox=')
    .replace(/preserveaspectratio=/gi, 'preserveAspectRatio=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/style="[^"]*"/g, '')
    .replace(/on[a-z]+="[^"]*"/gi, '')
    .replace(/radialgradient/gi, 'radialGradient')
    .replace(/lineargradient/gi, 'linearGradient')
    .replace(/checked(="[^"]*")?/gi, 'defaultChecked')
    .replace(/disabled(="[^"]*")?/gi, 'disabled={true}')
    .replace(/<!--[\s\S]*?-->/g, ''); // remove comments

  // Fix self-closing void tags
  jsx = jsx.replace(/<(img|input|br|hr)([^>]*?)(?<!\/)>/gis, '<$1$2 />');
  
  // Quick fix for empty classNames
  jsx = jsx.replace(/className=""/g, '');
  
  // Fix background image placeholder error
  jsx = jsx.replace(/bg-\[url\('placeholder'\)\]/g, 'bg-gray-200');

  return jsx;
}

async function processScreens() {
  const data = JSON.parse(fs.readFileSync(screensDataPath, 'utf8'));
  const screens = data.screens || [];

  const validScreens = [];

  for (const screen of screens) {
    if (!screen.htmlCode || !screen.htmlCode.downloadUrl) {
      console.log(`Skipping screen ${screen.title} (no html)`);
      continue;
    }

    console.log(`Processing screen: ${screen.title}`);
    const htmlContent = await download(screen.htmlCode.downloadUrl);
    
    // Parse HTML and get body
    const root = parse(htmlContent);
    const body = root.querySelector('body');
    
    if (!body) {
      console.log(`No body found for ${screen.title}`);
      continue;
    }
    
    // Remove script tags
    body.querySelectorAll('script').forEach(n => n.remove());

    let innerHtml = body.innerHTML;
    let jsxContent = htmlToJsx(innerHtml);
    
    const slug = slugify(screen.title);
    const componentName = screen.title.replace(/[^a-zA-Z0-9]/g, '');

    const pageCode = `
import React from 'react';

export default function ${componentName}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

    // Create directory
    const pageDir = path.join(appDir, slug);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // Write page.tsx
    fs.writeFileSync(path.join(pageDir, 'page.tsx'), pageCode.trim());
    
    validScreens.push({
      title: screen.title,
      slug: slug,
      screenshot: screen.screenshot?.downloadUrl
    });
  }

  // Generate a master index page at app/page.tsx
  let indexLinks = validScreens.map(s => `
        <a href="/${s.slug}" className="block group">
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary">
            ${s.screenshot ? `<img src="${s.screenshot}" alt="${s.title}" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />` : '<div className="w-full h-48 bg-gray-100 flex items-center justify-center">No Image</div>'}
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary">${s.title}</h3>
            </div>
          </div>
        </a>
  `).join('\n');

  const indexCode = `
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bazaar Merchant OS</h1>
          <p className="text-xl text-gray-600">Generated Screens Directory</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${indexLinks}
        </div>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(appDir, 'page.tsx'), indexCode.trim());
  console.log('Successfully generated all pages!');
}

processScreens().catch(console.error);

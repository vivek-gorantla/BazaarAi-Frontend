import fs from 'fs';
import path from 'path';

const screens = [
  { id: 'help', title: 'Help & Support', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmZDc3M2MyMTAwNDczNmRmMDRkMGZjYTMwEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'cart', title: 'Your Cart', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmYzI3NWQ5M2EwMzM4NGIyM2NlMjQ3YjNlEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'discover', title: 'Discover', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmYzI2NzU4ZTIwOTI1YzczNzg3MGQ2NGUwEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'search', title: 'Search', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmZTNkM2I3ZTgwNjM5NGU3ZjdlMmVhYWM5EgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'wishlist', title: 'Wishlist', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmZDgxZmYwY2UwOTI1ZDU5YmFlMDc2Mjc2EgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'order_confirmed', title: 'Order Confirmed', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmY2ExZGM2NjIwMjhmMDk1Njg0MDI1ZGI5EgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'offers', title: 'Offers', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmZWJkNGRlZTcwOTI1ZDYyNmZhMWJhYTEzEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'account', title: 'Account', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmZDczMzRhMzkwODlhZjcyYTcwMGVkYzkxEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'tracking', title: 'Live Order Tracking', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmZTFmZTdkYjIwOTI1ZDYyNmZhMWJhYTEzEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'home', title: 'Home', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmYzJlM2UyMzYwMjJkNGVjNDY2MDk0ODVjEgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'orders', title: 'Your Orders', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmY2FiODA3NTIwMWI0ZTc2NzdlMTI3NGM5EgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'store_detail', title: 'Sri Lakshmi Stores', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmYzMxNzE3MDIwMWE2MGU0YTcyMDQxMTg0EgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' },
  { id: 'checkout', title: 'Checkout', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1OWJmY2IzOWEzMzQwMzM4NWM4Nzg2MWJjZjM3EgsSBxD97aapqxUYAZIBIgoKcHJvamVjdF9pZBIUQhIxNzk0ODc1MTc0OTMwNTEwMzc&filename=&opi=89354086' }
];

const outDir = path.join(process.cwd(), 'scripts', 'stitch_html');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadAll() {
  for (const s of screens) {
    console.log('Downloading ' + s.title + '...');
    try {
      const res = await fetch(s.url);
      const text = await res.text();
      fs.writeFileSync(path.join(outDir, `${s.id}.html`), text);
      console.log('Saved ' + s.id + '.html (' + text.length + ' chars)');
    } catch (e) {
      console.error('Failed to download ' + s.id + ':', e);
    }
  }
  console.log('Done downloading all screens!');
}

downloadAll();

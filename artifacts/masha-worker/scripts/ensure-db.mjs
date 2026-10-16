import { readFile, writeFile } from 'node:fs/promises';
const token = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
if (!token || !accountId) throw new Error('Cloudflare deployment credentials are missing.');
const api = 'https://api.cloudflare.com/client/v4';
async function cf(path, init = {}) {
  const response = await fetch(api + path, {
    ...init,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error('Cloudflare API request failed: ' + (body.errors?.[0]?.message || response.status));
  }
  return body;
}
const account = encodeURIComponent(accountId);
const listed = await cf('/accounts/' + account + '/d1/database?page=1&per_page=100');
let database = (listed.result || []).find(item => item.name === 'masha-store-db');
if (!database) {
  const created = await cf('/accounts/' + account + '/d1/database', { method: 'POST', body: JSON.stringify({ name: 'masha-store-db' }) });
  database = created.result;
}
if (!database?.uuid) throw new Error('Cloudflare did not return the new D1 database identifier.');
const configPath = new URL('../wrangler.jsonc', import.meta.url);
const config = JSON.parse(await readFile(configPath, 'utf8'));
config.d1_databases[0].database_id = database.uuid;
await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log('Masha D1 database is ready.');

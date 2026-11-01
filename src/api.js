const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const IMG_BASE = (import.meta.env.VITE_IMAGE_SERVER_URL || API_BASE).replace(/\/$/, '');

const authHeaders = () => {
  const token = localStorage.getItem('agri_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function parse(res) {
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function listItems({ search, platform, page = 1, limit = 100 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (search) p.set('search', search);
  if (platform && platform !== 'all') p.set('platform', platform);
  const res = await fetch(`${API_BASE}/api/affiliate/items?${p}`, { headers: authHeaders() });
  const data = await parse(res);
  return {
    items: data.items || [],
    pagination: data.pagination || { page, pages: 1, total: data.items?.length || 0, limit },
  };
}

export async function getStats(days = 30) {
  const res = await fetch(`${API_BASE}/api/affiliate/stats?days=${days}`, { headers: authHeaders() });
  const data = await parse(res);
  return data.totals || null;
}

export async function getItem(id) {
  const res = await fetch(`${API_BASE}/api/affiliate/items/${id}`, { headers: authHeaders() });
  return parse(res);
}

export async function createItem(payload) {
  const res = await fetch(`${API_BASE}/api/affiliate/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

export async function updateItem(id, payload) {
  const res = await fetch(`${API_BASE}/api/affiliate/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/api/affiliate/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parse(res);
}

export async function uploadImages(files) {
  if (!files?.length) return [];
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const res = await fetch(`${IMG_BASE}/api/upload/images`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  const data = await parse(res);
  return data.urls || [];
}

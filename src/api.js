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

// ─── LIST ────────────────────────────────────────────────────────────
// Returns full response: { items, pagination: {page,pages,total,limit} }
export async function listItems({ search, platform, page = 1, limit = 20 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (search) p.set('search', search);
  if (platform && platform !== 'all') p.set('platform', platform);
  const res = await fetch(`${API_BASE}/api/affiliate/items?${p}`, { headers: authHeaders() });
  const data = await parse(res);
  return {
    items: data.items || [],
    pagination: data.pagination || { page, pages: 1, total: 0, limit },
  };
}

export async function getItem(id) {
  const res = await fetch(`${API_BASE}/api/affiliate/items/${id}`, { headers: authHeaders() });
  return parse(res);
}

// ─── CRUD (requires routes/affiliate.js to implement these) ──────────
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

// ─── CLICK TRACK (confirmed in mobile api.js) ────────────────────────
export async function trackClick(id) {
  try {
    await fetch(`${API_BASE}/api/affiliate/items/${id}/click`, {
      method: 'POST',
      headers: authHeaders(),
    });
  } catch {
    /* non-blocking */
  }
}

// ─── IMAGE UPLOAD (uses IMAGE_SERVER_URL, field name `files`) ────────
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

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const authHeaders = () => {
  const token = localStorage.getItem('agri_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function listItems({ search, category, isActive } = {}) {
  const p = new URLSearchParams();
  if (search) p.set('search', search);
  if (category) p.set('category', category);
  if (isActive != null && isActive !== '') p.set('isActive', isActive);
  const res = await fetch(`${BASE}/api/affiliate/items?${p}`, { headers: authHeaders() });
  const data = await handle(res);
  return data.items || data.data || data.results || (Array.isArray(data) ? data : []);
}

export async function createItem(payload) {
  const res = await fetch(`${BASE}/api/affiliate/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateItem(id, payload) {
  const res = await fetch(`${BASE}/api/affiliate/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE}/api/affiliate/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(res);
}

export async function uploadImages(files) {
  if (!files?.length) return [];
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const res = await fetch(`${BASE}/api/upload/images`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  const data = await handle(res);
  return data.urls || [];
}

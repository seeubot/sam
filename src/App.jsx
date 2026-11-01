import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import StoreGrid from './components/StoreGrid.jsx';
import ItemModal from './components/ItemModal.jsx';
import Toast from './components/Toast.jsx';
import {
  listItems, getStats, createItem, updateItem, deleteItem, uploadImages,
} from './api.js';

const PAGE_SIZE = 100;

export default function App() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [page, setPage] = useState(1);
  const [token, setToken] = useState(localStorage.getItem('agri_token') || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const debounceRef = useRef(null);
  const mountedRef = useRef(false);

  const showToast = (message, isErr = false) =>
    setToast({ message, isErr, id: Date.now() });

  const refresh = async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const [{ items: fetched, pagination: pg }, statsTotals] = await Promise.all([
        listItems({ search, platform, page: targetPage, limit: PAGE_SIZE }),
        getStats(30).catch(() => null),
      ]);
      setItems((prev) => (targetPage === 1 ? fetched : [...prev, ...fetched]));
      setPagination(pg);
      setPage(pg.page || targetPage);
      if (statsTotals) setStats(statsTotals);
    } catch (e) {
      setError(e.message);
      if (targetPage === 1) setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      refresh(1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => refresh(1), 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, platform, token]);

  const saveToken = (t) => {
    localStorage.setItem('agri_token', t);
    setToken(t);
    showToast('Token saved');
  };

  const handleSave = async (payload, files) => {
    try {
      let imageUrls = [];
      if (files?.length) {
        imageUrls = await uploadImages(files);
        if (imageUrls[0] && !payload.imageUrl) payload.imageUrl = imageUrls[0];
      }
      if (editing?._id) {
        await updateItem(editing._id, payload);
        showToast('Updated ✓');
      } else {
        await createItem(payload);
        showToast('Added ✓');
      }
      setModalOpen(false);
      setEditing(null);
      refresh(1);
    } catch (e) {
      showToast(e.message, true);
      throw e;
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteItem(item._id);
      showToast('Deleted');
      refresh(1);
    } catch (e) {
      showToast(e.message, true);
    }
  };

  const handleOpen = (item) => {
    if (!item.productUrl) return showToast('No product URL on this item', true);
    window.open(item.productUrl, '_blank', 'noopener');
  };

  return (
    <>
      <Header
        token={token}
        authed={Boolean(token)}
        onSaveToken={saveToken}
        onAdd={() => {
          if (!token) return showToast('Paste an admin JWT first', true);
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <main className="container">
        {stats && (
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-label">Clicks (30d)</div>
              <div className="stat-value">{stats.clicks || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Est. revenue</div>
              <div className="stat-value">₹{stats.estimatedRevenue || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total items</div>
              <div className="stat-value">{items.length}</div>
            </div>
          </div>
        )}

        <div className="toolbar">
          <input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">All platforms</option>
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
            <option value="meesho">Meesho</option>
            <option value="other">Other</option>
          </select>
          <button className="ghost" onClick={() => refresh(1)} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && <div className="empty" style={{ color: 'var(--danger)' }}>{error}</div>}

        {!error && (
          <StoreGrid
            items={items}
            loading={loading}
            onEdit={(it) => {
              if (!token) return showToast('Paste an admin JWT first', true);
              setEditing(it);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
            onOpen={handleOpen}
          />
        )}

        {!error && page < pagination.pages && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="ghost" onClick={() => refresh(page + 1)} disabled={loading}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </main>

      {modalOpen && (
        <ItemModal
          item={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      <Toast toast={toast} />
    </>
  );
}

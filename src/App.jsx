import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import StoreGrid from './components/StoreGrid.jsx';
import ItemModal from './components/ItemModal.jsx';
import Toast from './components/Toast.jsx';
import {
  listItems, createItem, updateItem, deleteItem, trackClick, uploadImages,
} from './api.js';

const PAGE_SIZE = 20;

export default function App() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
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
      const { items: fetched, pagination: pg } = await listItems({
        search, platform, page: targetPage, limit: PAGE_SIZE,
      });
      setItems((prev) => (targetPage === 1 ? fetched : [...prev, ...fetched]));
      setPagination(pg);
      setPage(pg.page || targetPage);
    } catch (e) {
      setError(e.message);
      if (targetPage === 1) setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced reload on filter change (skip first mount to avoid double fetch)
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

  const loadMore = () => {
    if (loading || page >= pagination.pages) return;
    refresh(page + 1);
  };

  const saveToken = (t) => {
    localStorage.setItem('agri_token', t);
    setToken(t);
    showToast('Token saved');
  };

  const handleSave = async (form, files) => {
    try {
      let images = [];
      if (files?.length) images = await uploadImages(files);

      const payload = {
        title: form.title.trim(),
        teluguTitle: form.teluguTitle?.trim() || undefined,
        description: form.description?.trim() || undefined,
        platform: form.platform,                // amazon | flipkart | meesho | other
        commissionRate: Number(form.commissionRate) || 0,
        category: form.category || undefined,
        affiliateUrl: form.affiliateUrl?.trim() || undefined,
      };
      if (images.length) {
        payload.imageUrl = images[0];
        payload.images = images;                // harmless if model ignores it
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
    if (!item.affiliateUrl) return showToast('No affiliate URL on this item', true);
    trackClick(item._id);                        // fire-and-forget
    window.open(item.affiliateUrl, '_blank', 'noopener');
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
        <div className="toolbar">
          <input
            placeholder="Search deals…"
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

        <div className="count-row">
          {loading
            ? 'Loading…'
            : `${pagination.total} ${pagination.total === 1 ? 'deal' : 'deals'}`}
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
            <button className="ghost" onClick={loadMore} disabled={loading}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </main>

      {modalOpen && (
        <ItemModal
          item={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      <Toast toast={toast} />
    </>
  );
}

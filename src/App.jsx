import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import StoreGrid from './components/StoreGrid.jsx';
import ItemModal from './components/ItemModal.jsx';
import Toast from './components/Toast.jsx';
import { listItems, createItem, updateItem, deleteItem, uploadImages } from './api.js';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState('');
  const [token, setToken] = useState(localStorage.getItem('agri_token') || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, isErr = false) => {
    setToast({ message, isErr, id: Date.now() });
  };

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listItems({ search, category, isActive });
      setItems(data);
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced refresh on filters
  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, isActive, token]);

  const saveToken = (t) => {
    localStorage.setItem('agri_token', t);
    setToken(t);
    showToast('Token saved');
  };

  const handleSave = async (form, files) => {
    try {
      let images = [];
      if (files?.length) {
        images = await uploadImages(files);
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        currency: form.currency || 'INR',
        category: form.category,
        isActive: form.isActive === 'true' || form.isActive === true,
        affiliateUrl: form.affiliateUrl.trim(),
      };
      if (images.length) {
        payload.imageUrl = images[0];
        payload.images = images;
      }
      if (editing?._id || editing?.id) {
        await updateItem(editing._id || editing.id, payload);
        showToast('Updated ✓');
      } else {
        await createItem(payload);
        showToast('Added ✓');
      }
      setModalOpen(false);
      setEditing(null);
      refresh();
    } catch (e) {
      showToast(e.message, true);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title || 'item'}"?`)) return;
    try {
      await deleteItem(item._id || item.id);
      showToast('Deleted');
      refresh();
    } catch (e) {
      showToast(e.message, true);
    }
  };

  const headerAuth = useMemo(
    () => Boolean(token),
    [token]
  );

  return (
    <>
      <Header
        token={token}
        authed={headerAuth}
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
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            <option value="seeds">Seeds</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="pesticide">Pesticide</option>
            <option value="equipment">Equipment</option>
            <option value="tools">Tools</option>
            <option value="other">Other</option>
          </select>
          <select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="">Any status</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
          <button className="ghost" onClick={refresh} disabled={loading}>
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
            onOpen={(it) => {
              if (it.affiliateUrl) window.open(it.affiliateUrl, '_blank', 'noopener');
              else showToast('No affiliate URL', true);
            }}
          />
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

import { useEffect, useState } from 'react';

const PLATFORMS = [
  { key: 'amazon',   label: 'Amazon',   color: '#FF9900' },
  { key: 'flipkart', label: 'Flipkart', color: '#2874F0' },
  { key: 'meesho',   label: 'Meesho',   color: '#F43397' },
  { key: 'other',    label: 'Other',    color: '#94A3B8' },
];

const EMPTY = {
  title: '', teluguTitle: '', description: '',
  platform: 'amazon', category: '',
  imageUrl: '', productUrl: '', downloadUrl: '',
  commissionRate: 0, displayOrder: 0, isActive: true,
};

export default function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        teluguTitle: item.teluguTitle || '',
        description: item.description || '',
        platform: item.platform || 'amazon',
        category: item.category || '',
        imageUrl: item.imageUrl || '',
        productUrl: item.productUrl || '',
        downloadUrl: item.downloadUrl || '',
        commissionRate: item.commissionRate ?? 0,
        displayOrder: item.displayOrder ?? 0,
        isActive: item.isActive !== false,
      });
    } else {
      setForm(EMPTY);
    }
    setFiles([]);
    setImageError(false);
  }, [item]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const previews = files.map((f) => URL.createObjectURL(f));
  const showPreview =
    form.imageUrl &&
    /^https?:\/\//i.test(form.imageUrl) &&
    !imageError &&
    !previews.length;

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.productUrl.trim()) return 'Product URL is required';
    if (!/^https?:\/\//i.test(form.productUrl.trim()))
      return 'Product URL must start with http:// or https://';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const payload = {
      ...form,
      title: form.title.trim(),
      teluguTitle: form.teluguTitle.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      imageUrl: form.imageUrl.trim(),
      productUrl: form.productUrl.trim(),
      downloadUrl: form.downloadUrl.trim(),
      commissionRate: Number(form.commissionRate) || 0,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: !!form.isActive,
    };

    setSaving(true);
    try {
      await onSave(payload, files);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-back open" onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="modal">
        <h2>{item ? 'Edit item' : 'Add affiliate item'}</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title *</label>
            <input value={form.title} onChange={set('title')} required placeholder="e.g. Samsung Galaxy M35" />
          </div>

          <div className="field">
            <label>Telugu title</label>
            <input value={form.teluguTitle} onChange={set('teluguTitle')} placeholder="optional" />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={set('description')} />
          </div>

          <div className="field">
            <label>Platform *</label>
            <div className="platform-row">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.key}
                  className={`platform-chip ${form.platform === p.key ? 'on' : ''}`}
                  style={form.platform === p.key ? { backgroundColor: p.color, borderColor: p.color } : undefined}
                  onClick={() => setForm((f) => ({ ...f, platform: p.key }))}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Category</label>
            <input value={form.category} onChange={set('category')} placeholder="Electronics, Fashion…" />
          </div>

          <div className="field">
            <label>Product URL *</label>
            <input
              type="url"
              value={form.productUrl}
              onChange={set('productUrl')}
              placeholder="https://amzn.to/…"
              required
            />
          </div>

          <div className="field">
            <label>Download URL (optional)</label>
            <input
              type="url"
              value={form.downloadUrl}
              onChange={set('downloadUrl')}
              placeholder="APK or app store link"
            />
          </div>

          <div className="field">
            <label>Image</label>
            <div className="image-row">
              <input
                value={form.imageUrl}
                onChange={(e) => { setForm((f) => ({ ...f, imageUrl: e.target.value })); setImageError(false); }}
                placeholder="https://… or upload below"
              />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
              />
            </div>
            {(previews.length > 0 || showPreview) && (
              <div className="preview">
                {previews.length
                  ? previews.map((p, i) => <img key={i} src={p} alt="" />)
                  : <img src={form.imageUrl} alt="" onError={() => setImageError(true)} />}
              </div>
            )}
          </div>

          <div className="row">
            <div className="field">
              <label>Commission rate (%)</label>
              <input
                type="number" min="0" step="0.1"
                value={form.commissionRate}
                onChange={set('commissionRate')}
              />
            </div>
            <div className="field">
              <label>Display order (higher = first)</label>
              <input
                type="number" min="0" step="1"
                value={form.displayOrder}
                onChange={set('displayOrder')}
              />
            </div>
          </div>

          <div className="toggle-row">
            <label>Active (visible to users)</label>
            <button
              type="button"
              className={`toggle ${form.isActive ? 'on' : ''}`}
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              aria-pressed={form.isActive}
            >
              <span className="knob" />
            </button>
          </div>

          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving…' : item ? 'Save changes' : 'Create item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

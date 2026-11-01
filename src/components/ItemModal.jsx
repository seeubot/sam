import { useRef, useState } from 'react';

const blank = {
  title: '',
  description: '',
  price: '',
  currency: 'INR',
  category: 'other',
  isActive: 'true',
  affiliateUrl: '',
};

export default function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    item
      ? {
          title: item.title || '',
          description: item.description || '',
          price: item.price ?? '',
          currency: item.currency || 'INR',
          category: item.category || 'other',
          isActive: String(item.isActive !== false),
          affiliateUrl: item.affiliateUrl || '',
        }
      : { ...blank }
  );
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const previews = files.map((f) => URL.createObjectURL(f));

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form, files);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-back open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{item ? 'Edit Store Item' : 'Add Store Item'}</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title *</label>
            <input value={form.title} onChange={change('title')} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={change('description')} rows={3} />
          </div>
          <div className="row">
            <div className="field">
              <label>Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={change('price')}
                required
              />
            </div>
            <div className="field">
              <label>Currency</label>
              <input value={form.currency} onChange={change('currency')} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={change('category')}>
                <option value="seeds">Seeds</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="pesticide">Pesticide</option>
                <option value="equipment">Equipment</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Active</label>
              <select value={form.isActive} onChange={change('isActive')}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Affiliate URL *</label>
            <input
              type="url"
              value={form.affiliateUrl}
              onChange={change('affiliateUrl')}
              placeholder="https://amzn.to/…"
              required
            />
          </div>
          <div className="field">
            <label>Images (max 5)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
            />
            <div className="preview">
              {previews.map((p, i) => (
                <img key={i} src={p} alt="" />
              ))}
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

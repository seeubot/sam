import { useState } from 'react';

const blank = {
  title: '', teluguTitle: '', description: '',
  platform: 'amazon', commissionRate: '', category: '',
  affiliateUrl: '',
};

export default function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    item
      ? {
          title: item.title || '',
          teluguTitle: item.teluguTitle || '',
          description: item.description || '',
          platform: item.platform || 'amazon',
          commissionRate: item.commissionRate ?? '',
          category: item.category || '',
          affiliateUrl: item.affiliateUrl || '',
        }
      : { ...blank }
  );
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const previews = files.map((f) => URL.createObjectURL(f));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form, files); } finally { setSaving(false); }
  };

  return (
    <div className="modal-back open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{item ? 'Edit Deal' : 'Add Deal'}</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title *</label>
            <input value={form.title} onChange={change('title')} required />
          </div>
          <div className="field">
            <label>Telugu title</label>
            <input value={form.teluguTitle} onChange={change('teluguTitle')} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={change('description')} />
          </div>
          <div className="row">
            <div className="field">
              <label>Platform *</label>
              <select value={form.platform} onChange={change('platform')}>
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
                <option value="meesho">Meesho</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Commission %</label>
              <input
                type="number" min="0" step="0.1"
                value={form.commissionRate}
                onChange={change('commissionRate')}
              />
            </div>
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category} onChange={change('category')} />
          </div>
          <div className="field">
            <label>Affiliate URL</label>
            <input
              type="url"
              value={form.affiliateUrl}
              onChange={change('affiliateUrl')}
              placeholder="https://amzn.to/…"
            />
          </div>
          <div className="field">
            <label>Image (max 5)</label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
            />
            <div className="preview">
              {previews.map((p, i) => <img key={i} src={p} alt="" />)}
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

export default function Header({ token, authed, onSaveToken, onAdd }) {
  const [draft, setDraft] = useState(token || '');

  useEffect(() => setDraft(token || ''), [token]);

  return (
    <header className="topbar">
      <h1>🛒 AgriAgent · Store Items</h1>
      <span className={`pill ${authed ? 'ok' : ''}`}>
        {authed ? 'Authenticated ✓' : 'Not authenticated'}
      </span>
      <div className="spacer" />
      <input
        className="token-input"
        placeholder="Paste admin JWT"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button className="ghost" onClick={() => onSaveToken(draft.trim())}>
        Save
      </button>
      <button className="primary" onClick={onAdd}>
        ＋ Add Store Item
      </button>
    </header>
  );
}

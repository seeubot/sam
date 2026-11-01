export default function StoreCard({ item, onEdit, onDelete, onOpen }) {
  const img =
    item.imageUrl ||
    item.image ||
    (Array.isArray(item.images) ? item.images[0]?.url || item.images[0] : '') ||
    '';

  return (
    <div className="card">
      <div className="img">
        {img ? (
          <img
            src={img}
            alt={item.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`noimg ${img ? 'hidden' : ''}`}>No image</div>
      </div>
      <div className="body">
        <div className="name">{item.title || item.name || 'Untitled'}</div>
        <div className="meta">{(item.description || '').slice(0, 90)}</div>
        <div>
          {item.category && <span className="tag">{item.category}</span>}
          {item.isActive === false ? (
            <span className="tag inactive">Inactive</span>
          ) : (
            <span className="tag">Active</span>
          )}
        </div>
        <div className="price">₹{Number(item.price || 0).toLocaleString('en-IN')}</div>
      </div>
      <div className="actions">
        <button className="ghost" onClick={onEdit}>Edit</button>
        <button className="ghost" onClick={onOpen}>Open ↗</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

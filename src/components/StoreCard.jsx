const PLATFORM_META = {
  amazon:   { label: 'Amazon',   color: '#FF9900' },
  flipkart: { label: 'Flipkart', color: '#2874F0' },
  meesho:   { label: 'Meesho',   color: '#F43397' },
  other:    { label: 'Other',    color: '#94A3B8' },
};

export default function StoreCard({ item, onEdit, onDelete, onOpen }) {
  const meta = PLATFORM_META[item.platform] || PLATFORM_META.other;
  const img = item.imageUrl || '';
  const isActive = item.isActive !== false;

  return (
    <div className={`card ${!isActive ? 'inactive' : ''}`}>
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

        {item.commissionRate > 0 && (
          <span className="badge commission">▲ {item.commissionRate}%</span>
        )}
        <span className="badge platform" style={{ background: meta.color }}>
          {meta.label.toUpperCase()}
        </span>
        {!isActive && <span className="badge inactive">INACTIVE</span>}
      </div>

      <div className="body">
        <div className="name">{item.title}</div>
        {item.teluguTitle && <div className="telugu">{item.teluguTitle}</div>}
        {item.description && <div className="meta">{item.description}</div>}
        {item.category && <div><span className="tag">{item.category}</span></div>}
      </div>

      <div className="actions">
        <button className="ghost" onClick={onEdit}>Edit</button>
        {item.productUrl && (
          <button className="ghost" onClick={() => onOpen(item)}>Open ↗</button>
        )}
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

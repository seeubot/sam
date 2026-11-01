import StoreCard from './StoreCard.jsx';

export default function StoreGrid({ items, loading, onEdit, onDelete, onOpen }) {
  if (loading && !items.length) {
    return <div className="empty">Loading…</div>;
  }
  if (!items.length) {
    return <div className="empty">No store items found.</div>;
  }
  return (
    <div className="grid">
      {items.map((it) => (
        <StoreCard
          key={it._id || it.id || it.title}
          item={it}
          onEdit={() => onEdit(it)}
          onDelete={() => onDelete(it)}
          onOpen={() => onOpen(it)}
        />
      ))}
    </div>
  );
}

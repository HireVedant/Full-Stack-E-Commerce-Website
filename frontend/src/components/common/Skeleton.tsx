export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" style={{ width: "40%" }} />
        <div className="skeleton skeleton-line tall" />
        <div className="skeleton skeleton-line" style={{ width: "70%" }} />
        <div className="skeleton skeleton-line short" style={{ width: "50%", marginTop: 8 }} />
        <div className="skeleton skeleton-line" style={{ height: 36, marginTop: 8 }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function Spinner() {
  return <div className="spinner" role="status" aria-label="Loading" />;
}

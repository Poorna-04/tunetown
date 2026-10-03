export default function LoadingGrid() {
  return (
    <div className="product-grid" aria-label="Loading products" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="skeleton-card" key={index} aria-hidden="true">
          <div className="skeleton skeleton--image" />
          <div className="skeleton" />
          <div className="skeleton skeleton--short" />
        </div>
      ))}
    </div>
  );
}

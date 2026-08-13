import { useState, useEffect, useCallback, useRef } from "react";
import type { Product, SortOption } from "../types";
import { productApi } from "../api/productApi";
import ProductCard from "../components/product/ProductCard";
import ProductControls from "../components/product/ProductControls";
import { ProductGridSkeleton } from "../components/common/Skeleton";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortOption | "">("");
  const [categories, setCategories] = useState<string[]>([]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, sort]);

  // Load categories once
  useEffect(() => {
    productApi.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.list({
        search: debouncedSearch || undefined,
        category: category || undefined,
        sort: sort || undefined,
        page,
        limit: PAGE_SIZE,
      });
      if (res.success && res.data) {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } else {
        setError(res.message ?? "Failed to load products");
      }
    } catch {
      setError("Network error — could not reach the server");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <main className="container" id="products-page">
      <div className="page-header">
        <h1>Our Products</h1>
        <p>Discover curated products at the best prices</p>
      </div>

      <ProductControls
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        sort={sort}
        onSort={setSort}
        categories={categories}
      />

      {!loading && !error && (
        <p className="results-count">
          {total === 0
            ? "No products found"
            : `Showing ${products.length} of ${total} product${total === 1 ? "" : "s"}`}
        </p>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <span>⚠</span>
          <div>
            <strong>Error loading products:</strong> {error}
            <br />
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={fetchProducts}>
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton count={PAGE_SIZE} />
      ) : products.length === 0 && !error ? (
        <div className="empty-state" id="no-results-state">
          <div className="empty-state-icon">🔍</div>
          <h2>No products found</h2>
          <p>
            {debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different search.`
              : "No products match the selected filters."}
          </p>
          <button className="btn btn-secondary" onClick={() => { setSearch(""); setCategory(""); setSort(""); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="product-grid" id="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="pagination" aria-label="Pagination">
          <button
            id="page-prev"
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                id={`page-${p}`}
                className={`page-btn${p === page ? " active" : ""}`}
                onClick={() => setPage(p)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}
          <button
            id="page-next"
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}

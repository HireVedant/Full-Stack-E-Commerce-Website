import type { SortOption } from "../../types";

interface ProductControlsProps {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  sort: SortOption | "";
  onSort: (v: SortOption | "") => void;
  categories: string[];
}

const SORT_OPTIONS: { value: SortOption | ""; label: string }[] = [
  { value: "", label: "Default Order" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
];

export default function ProductControls({
  search, onSearch, category, onCategory, sort, onSort, categories,
}: ProductControlsProps) {
  return (
    <div className="controls-bar" role="search">
      <div className="search-wrap">
        <span className="search-icon" aria-hidden>🔍</span>
        <input
          id="product-search"
          type="search"
          className="search-input"
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search products"
        />
      </div>

      <select
        id="category-filter"
        className="filter-select"
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        id="sort-select"
        className="sort-select"
        value={sort}
        onChange={(e) => onSort(e.target.value as SortOption | "")}
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import type { PaginationInfo, Product } from "../types";
import { useCart } from "../hooks/useCart";
import api from "../api/axios";

interface ProductsState {
  products: Product[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
}

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home",
  "Sports",
];

const ProductsPage = () => {
  const [state, setState] = useState<ProductsState>({
    products: [],
    pagination: null,
    isLoading: true,
    error: null,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const { addItem, isInCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All") params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("sort", sort);
      params.append("page", String(page));
      params.append("limit", "8");

      const { data } = await api.get(`/products?${params.toString()}`);

      setState({
        products: data.data.products,
        pagination: data.data.pagination,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load products.",
      }));
    }
  }, [search, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, category, minPrice, maxPrice, sort]);

  const { products, pagination, isLoading, error } = state;

  return (
    <div style={styles.page}>
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ ...styles.searchInput, width: "110px" }}
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ ...styles.searchInput, width: "110px" }}
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={styles.select}
        >
          <option value="-createdAt">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-ratings.average">Top Rated</option>
        </select>
      </div>

      {isLoading ? (
        <div style={styles.center}>Loading products...</div>
      ) : error ? (
        <div style={styles.center}>{error}</div>
      ) : products.length === 0 ? (
        <div style={styles.center}>No products found.</div>
      ) : (
        <>
          <div style={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => addItem(product)}
                inCart={isInCart(product._id)}
              />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                style={styles.pageBtn}
              >
                ← Prev
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      ...styles.pageBtn,
                      backgroundColor: p === page ? "#e94560" : "white",
                      color: p === page ? "white" : "#333",
                    }}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === pagination.pages}
                style={styles.pageBtn}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  inCart: boolean;
}

const ProductCard = ({ product, onAddToCart, inCart }: ProductCardProps) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  return (
    <div style={styles.card}>
      <div style={styles.imgBox}>
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} style={styles.img} />
        ) : (
          <div style={styles.imgPlaceholder}>📦</div>
        )}
      </div>

      <div style={styles.cardBody}>
        <p style={styles.cardCategory}>{product.category}</p>
        <h3 style={styles.cardName}>{product.name}</h3>

        <div style={styles.cardRating}>
          {"★".repeat(Math.round(product.ratings.average))}
          {"☆".repeat(5 - Math.round(product.ratings.average))}
          <span style={styles.ratingCount}> ({product.ratings.count})</span>
        </div>

        <p style={styles.cardPrice}>{formatPrice(product.price)}</p>

        <p
          style={{
            ...styles.stock,
            color:
              product.stock === 0
                ? "#e94560"
                : product.stock < 5
                  ? "#f0a500"
                  : "#2ecc71",
          }}
        >
          {product.stock === 0
            ? "Out of stock"
            : product.stock < 5
              ? `Only ${product.stock} left`
              : "In stock"}
        </p>

        <button
          onClick={onAddToCart}
          disabled={product.stock === 0 || inCart}
          style={{
            ...styles.addBtn,
            backgroundColor: inCart
              ? "#2ecc71"
              : product.stock === 0
                ? "#ccc"
                : "#e94560",
            cursor: product.stock === 0 || inCart ? "not-allowed" : "pointer",
          }}
        >
          {inCart
            ? "✓ Added"
            : product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "2rem",
    alignItems: "center",
  },
  searchInput: {
    padding: "0.6rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.95rem",
    flex: 1,
    minWidth: "200px",
  },
  select: {
    padding: "0.6rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.95rem",
    background: "white",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "white",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
  },
  imgBox: {
    height: "200px",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { fontSize: "4rem" },
  cardBody: { padding: "1rem" },
  cardCategory: {
    fontSize: "0.75rem",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 0.3rem",
  },
  cardName: {
    margin: "0 0 0.4rem",
    fontSize: "1rem",
    color: "#1a1a2e",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  cardRating: { color: "#f0a500", fontSize: "0.85rem", marginBottom: "0.4rem" },
  ratingCount: { color: "#888" },
  cardPrice: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0.3rem 0",
  },
  stock: { fontSize: "0.8rem", marginBottom: "0.75rem" },
  addBtn: {
    width: "100%",
    padding: "0.65rem",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "2.5rem",
  },
  pageBtn: {
    padding: "0.5rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    background: "white",
  },
  center: {
    textAlign: "center",
    padding: "4rem",
    color: "#888",
    fontSize: "1.1rem",
  },
};

export default ProductsPage;

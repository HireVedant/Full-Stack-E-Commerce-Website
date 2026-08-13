import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Product } from "../types";
import { productApi } from "../api/productApi";
import { wishlistApi } from "../api/wishlistApi";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import AvailabilityBadge from "../components/common/AvailabilityBadge";
import { Spinner } from "../components/common/Skeleton";
import { showToast } from "../components/common/Toast";
import ReviewSection from "../components/ReviewSection";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, lastError, clearError, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [imgErr, setImgErr] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const numId = Number(id);
    if (!id || isNaN(numId) || numId < 1) {
      setError("invalid");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    productApi.get(numId).then((res) => {
      if (res.success && res.data) {
        setProduct(res.data);
      } else if (res.message?.includes("not found") || res.message?.includes("404")) {
        setError("not_found");
      } else {
        setError(res.message ?? "Failed to load product");
      }
    }).catch(() => {
      setError("Network error — could not reach the server");
    }).finally(() => {
      setLoading(false);
      // Fetch wishlist status
      if (isAuthenticated) {
        wishlistApi.get().then(wRes => {
          if (wRes.success && wRes.data) {
            setInWishlist(wRes.data.some((item: any) => item.productId === numId));
          }
        });
      }
    });
  }, [id, isAuthenticated]);

  // Show cart errors as toast
  useEffect(() => {
    if (lastError) {
      showToast({ message: lastError, type: "error" });
      clearError();
    }
  }, [lastError, clearError]);

  function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    addItem(product, qty);
    // addItem is synchronous; error handled via lastError above
    setTimeout(() => setAdding(false), 400);
    showToast({ message: `"${product.name}" added to cart`, type: "success" });
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistApi.remove(product.id);
        setInWishlist(false);
        showToast({ message: "Removed from wishlist", type: "success" });
      } else {
        await wishlistApi.add(product.id);
        setInWishlist(true);
        showToast({ message: "Added to wishlist", type: "success" });
      }
    } catch {
      showToast({ message: "Failed to update wishlist", type: "error" });
    } finally {
      setWishlistLoading(false);
    }
  };

  // Current quantity of this product in cart
  const inCartQty = items.find((i) => i.productId === product?.id)?.quantity ?? 0;
  const maxAddable = product ? product.stock - inCartQty : 0;

  if (loading) {
    return (
      <main className="container detail-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Spinner />
      </main>
    );
  }

  if (error === "invalid" || error === "not_found") {
    return (
      <main className="container detail-page">
        <div className="empty-state" id="product-not-found">
          <div className="empty-state-icon">{error === "invalid" ? "🚫" : "📦"}</div>
          <h1>{error === "invalid" ? "Invalid Product" : "Product Not Found"}</h1>
          <p>
            {error === "invalid"
              ? "The product ID in the URL is not valid."
              : `We couldn't find a product with ID "${id}". It may have been removed.`}
          </p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container detail-page">
        <div className="error-banner" role="alert">
          <span>⚠</span>
          <div>
            <strong>Error:</strong> {error}
            <br />
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.availability === "out_of_stock";

  return (
    <main className="container detail-page" id="product-detail-page">
      <button className="detail-back btn btn-ghost" onClick={() => navigate(-1)} id="back-btn">
        ← Back
      </button>

      <div className="detail-grid">
        {/* Image */}
        <div className="detail-img-wrap">
          {!imgErr ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="detail-img"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "5rem" }}>🛍️</div>
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <div className="detail-meta">
            <span className="detail-category">{product.category}</span>
            <span className="detail-id">ID #{product.id}</span>
          </div>

          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-price">₹{product.price.toLocaleString("en-IN")}</div>

          <p className="detail-description">{product.description}</p>

          <hr className="detail-divider" />

          <div className="detail-stock-row">
            <AvailabilityBadge availability={product.availability} stock={product.stock} />
            {inCartQty > 0 && (
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                ({inCartQty} in cart)
              </span>
            )}
          </div>

          {/* Actions */}
          {!isOutOfStock && (
            <div className="detail-actions">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>Quantity:</span>
                <div className="qty-control" id="qty-control">
                  <button
                    id="qty-decrease"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value" aria-live="polite">{qty}</span>
                  <button
                    id="qty-increase"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.min(maxAddable, q + 1))}
                    disabled={qty >= maxAddable}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {maxAddable <= 0 && inCartQty > 0 && (
                <p style={{ fontSize: "0.85rem", color: "var(--yellow)" }}>
                  You have all available stock in your cart
                </p>
              )}

              <button
                id="detail-add-to-cart"
                className="btn btn-primary detail-add-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock || maxAddable <= 0 || adding}
              >
                {adding ? "Adding…" : `Add ${qty > 1 ? `${qty} × ` : ""}to Cart — ₹${(product.price * qty).toLocaleString("en-IN")}`}
              </button>

              <button
                className="btn btn-secondary detail-add-btn"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                style={{ marginTop: 12, width: "100%" }}
              >
                {inWishlist ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
        <h2>Reviews & Ratings</h2>
        <ReviewSection productId={product.id} />
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistApi } from "../api/wishlistApi";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import { showToast } from "../components/common/Toast";
import { Spinner } from "../components/common/Skeleton";
import type { Product } from "../types";

interface WishlistItem {
  id: number;
  productId: number;
  product?: Product;
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    wishlistApi.get().then(res => {
      if (res.success && res.data) {
        setItems(res.data);
      }
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleRemove = async (productId: number) => {
    try {
      const res = await wishlistApi.remove(productId);
      if (res.success) {
        setItems(items.filter(i => i.productId !== productId));
        showToast({ message: "Removed from wishlist", type: "success" });
      }
    } catch {
      showToast({ message: "Failed to remove item", type: "error" });
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    showToast({ message: `Added ${product.name} to cart`, type: "success" });
  };

  if (!isAuthenticated) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <div className="empty-state">
          <h2>Not Logged In</h2>
          <p>Please login to view your wishlist.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="container" style={{ padding: "80px 0" }}><Spinner /></main>;
  }

  if (items.length === 0) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Save items you like to your wishlist.</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "40px 0" }}>
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p>{items.length} item{items.length === 1 ? "" : "s"} saved</p>
      </div>

      <div className="product-grid">
        {items.map(({ productId, product }) => {
          if (!product) return null;
          return (
            <div className="product-card" key={productId}>
              <Link to={`/products/${productId}`} className="product-card-img-wrap">
                <img src={product.imageUrl} alt={product.name} className="product-card-img" />
              </Link>
              <div className="product-card-body">
                <span className="product-card-category">{product.category}</span>
                <Link to={`/products/${productId}`} className="product-card-name">
                  {product.name}
                </Link>
                <div className="product-card-price">
                  ₹{product.price.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="product-card-footer" style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "10px 14px" }}
                  onClick={() => handleRemove(productId)}
                  aria-label="Remove from wishlist"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

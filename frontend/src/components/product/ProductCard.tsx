import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types";
import { useCart } from "../../store/CartContext";
import AvailabilityBadge from "../common/AvailabilityBadge";
import { showToast } from "../common/Toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [imgErr, setImgErr] = useState(false);

  const isOutOfStock = product.availability === "out_of_stock";

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation(); // don't navigate to detail
    if (isOutOfStock) return;
    addItem(product);
    showToast({ message: `"${product.name}" added to cart`, type: "success" });
  }

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${product.id}`)}
      aria-label={`View ${product.name}`}
      id={`product-card-${product.id}`}
    >
      <div className="product-card-img-wrap">
        {!imgErr ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="product-card-img-placeholder">🛍️</div>
        )}
        <div className="product-card-badge">
          <AvailabilityBadge availability={product.availability} />
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h2 className="product-card-name">{product.name}</h2>
        <div className="product-card-price">
          ₹{product.price.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="product-card-footer">
        <button
          id={`add-to-cart-${product.id}`}
          className="product-card-add-btn"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          aria-label={isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

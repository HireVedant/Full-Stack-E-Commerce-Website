import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import { showToast } from "../components/common/Toast";
import { useAuth } from "../store/AuthContext";
import { orderApi } from "../api/orderApi";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    lastError,
    clearError,
  } = useCart();
  const [imgErr, setImgErr] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (lastError) {
      showToast({ message: lastError, type: "error" });
      clearError();
    }
  }, [lastError, clearError]);

  const { token, isAuthenticated } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!isAuthenticated) { showToast({ message: "Login to apply coupons", type: "error" }); return; }
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const { couponApi } = await import("../api/couponApi");
      const res = await couponApi.validate(couponCode);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        showToast({ message: `Coupon applied: ${res.data.discountPercentage}% off!`, type: "success" });
      } else {
        setCouponError(res.message || "Invalid coupon");
      }
    } catch {
      setCouponError("Network error validating coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !token) {
      showToast({ message: "Please login to place an order", type: "error" });
      navigate("/login");
      return;
    }

    setCheckingOut(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      const res = await orderApi.create({ items: orderItems, couponCode: appliedCoupon?.code });
      if (res.success && res.data) {
        const order = res.data;
        
        if (order.razorpayOrderId) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_example", 
            amount: order.totalAmount * 100,
            currency: "INR",
            name: "E-Commerce Test",
            description: "Test Transaction",
            order_id: order.razorpayOrderId,
            handler: async function (response: any) {
              try {
                const vData = await orderApi.verifyPayment(response);
                if (vData.success) {
                  showToast({ message: "Payment verified! Order placed.", type: "success" });
                  clearCart();
                  navigate("/orders");
                } else {
                  showToast({ message: "Payment verification failed", type: "error" });
                }
              } catch {
                showToast({ message: "Payment verification failed", type: "error" });
              }
            },
            theme: { color: "#6C63FF" }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function () {
            showToast({ message: "Payment failed", type: "error" });
          });
          rzp.open();
        } else {
          showToast({ message: "Order placed successfully!", type: "success" });
          clearCart();
          navigate("/orders");
        }
      } else {
        showToast({ message: res.message || "Checkout failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Network error during checkout", type: "error" });
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="container cart-page">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container cart-page">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{totalItems} item{totalItems === 1 ? "" : "s"} in your cart</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.productId}>
              {!imgErr[item.productId] ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart-item-img"
                  onError={() => setImgErr((prev) => ({ ...prev, [item.productId]: true }))}
                />
              ) : (
                <div className="cart-item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🛍️</div>
              )}

              <div className="cart-item-info">
                <span className="cart-item-category">{item.category}</span>
                <Link to={`/products/${item.productId}`} className="cart-item-name">
                  {item.name}
                </Link>
                <span className="cart-item-price-unit">
                  ₹{item.price.toLocaleString("en-IN")} each
                </span>
                {item.stock <= 5 && (
                  <span style={{ fontSize: "0.75rem", color: "var(--yellow)" }}>
                    Only {item.stock} left in stock
                  </span>
                )}
              </div>

              <div className="cart-item-controls">
                <div className="cart-item-subtotal">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="qty-control" style={{ transform: "scale(0.85)", transformOrigin: "right center" }}>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 8px" }}
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({totalItems} items)</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Coupon code" 
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                style={{ flex: 1, textTransform: "uppercase" }}
              />
              <button 
                className="btn btn-secondary" 
                onClick={handleApplyCoupon}
                disabled={applyingCoupon || !couponCode}
              >
                {applyingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {couponError && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: 4 }}>{couponError}</p>}
            {appliedCoupon && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(108,99,255,0.1)", padding: "8px 12px", borderRadius: 4, marginTop: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 600 }}>
                  {appliedCoupon.code} applied ({appliedCoupon.discountPercentage}% off)
                </span>
                <button className="btn btn-ghost" style={{ padding: 4, fontSize: "0.8rem" }} onClick={() => setAppliedCoupon(null)}>✕</button>
              </div>
            )}
          </div>

          {appliedCoupon && (
            <div className="summary-row" style={{ color: "var(--accent)" }}>
              <span>Discount</span>
              <span>-₹{(totalAmount * (appliedCoupon.discountPercentage / 100)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
          )}

          <div className="summary-row" style={{ marginTop: 16, borderTop: "2px solid var(--border-soft)", paddingTop: 16 }}>
            <span className="summary-total-label">Total</span>
            <span className="summary-total">₹{Math.max(0, totalAmount - (appliedCoupon ? totalAmount * (appliedCoupon.discountPercentage / 100) : 0)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          </div>
          
          <button 
            className="btn btn-primary btn-full" 
            style={{ marginTop: 24 }}
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </main>
  );
}

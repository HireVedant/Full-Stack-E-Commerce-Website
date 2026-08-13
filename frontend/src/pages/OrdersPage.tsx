import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../types";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../store/AuthContext";
import { showToast } from "../components/common/Toast";
import { Spinner } from "../components/common/Skeleton";

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    orderApi.getMyOrders()
      .then(res => {
        if (res.success && res.data) {
          setOrders(res.data);
        } else {
          showToast({ message: res.message || "Failed to load orders", type: "error" });
        }
      })
      .catch(() => {
        showToast({ message: "Network error", type: "error" });
      })
      .finally(() => setLoading(false));
  }, [token, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="container auth-page">
        <div className="empty-state">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your orders.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </main>
    );
  }

  if (loading) return <main className="container"><Spinner /></main>;

  if (orders.length === 0) {
    return (
      <main className="container cart-page">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2>No orders yet</h2>
          <p>When you place orders, they will appear here.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>View your past purchases</p>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card" style={{ padding: 24, border: "1px solid var(--border-soft)", borderRadius: 12, marginBottom: 24 }}>
            <div className="order-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid var(--border-soft)", paddingBottom: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>Order #{order.id}</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, color: "var(--primary-color)", fontSize: "1.1rem" }}>
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                    {order.couponCode ? `Coupon ${order.couponCode} applied` : "Discount applied"} (-₹{order.discountAmount.toLocaleString("en-IN")})
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span className={`badge badge-${order.paymentStatus === "Paid" ? "in-stock" : "out-of-stock"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <img 
                    src={item.product?.imageUrl || ""} 
                    alt={item.product?.name || "Product"} 
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.product?.name || "Unknown Product"}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

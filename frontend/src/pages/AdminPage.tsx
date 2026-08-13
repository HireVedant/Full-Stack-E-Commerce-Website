import { useState, useEffect } from "react";
import type { Product, CreateProductInput, UpdateProductInput, Order } from "../types";
import { productApi } from "../api/productApi";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../store/AuthContext";
import { showToast } from "../components/common/Toast";
import { Spinner } from "../components/common/Skeleton";
import AvailabilityBadge from "../components/common/AvailabilityBadge";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function AdminPage() {
  const { token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics">("analytics");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<CreateProductInput>({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    stock: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = () => {
    if (!token || !isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    Promise.all([
      productApi.list({ limit: 1000 }),
      orderApi.getAllOrders()
    ])
    .then(([prodRes, ordRes]) => {
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products);
      } else {
        setError(prodRes.message || "Failed to load products");
      }
      
      if (ordRes.success && ordRes.data) {
        setOrders(ordRes.data);
      }
    })
    .catch(() => setError("Network error"))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [token, isAdmin]);

  const openAddModal = () => {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      stock: 0,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.category.trim()) errs.category = "Category is required";
    if (!form.imageUrl.trim()) errs.imageUrl = "Image URL is required";
    if (form.price < 0) errs.price = "Price must be >= 0";
    if (form.stock < 0) errs.stock = "Stock must be >= 0";
    
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editId) {
        const res = await productApi.update(editId, form as UpdateProductInput);
        if (res.success) {
          showToast({ message: "Product updated successfully", type: "success" });
          setModalOpen(false);
          fetchData();
        } else {
          showToast({ message: res.message || "Failed to update product", type: "error" });
        }
      } else {
        const res = await productApi.create(form);
        if (res.success) {
          showToast({ message: "Product created successfully", type: "success" });
          setModalOpen(false);
          fetchData();
        } else {
          showToast({ message: res.message || "Failed to create product", type: "error" });
        }
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await productApi.delete(id);
      if (res.success) {
        showToast({ message: "Product deleted", type: "success" });
        fetchData();
      } else {
        showToast({ message: res.message || "Failed to delete", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      const res = await orderApi.updateOrderStatus(id, status);
      if (res.success) {
        showToast({ message: "Order status updated", type: "success" });
        fetchData();
      } else {
        showToast({ message: res.message || "Failed to update status", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    }
  };

  if (loading) return <main className="container admin-page"><Spinner /></main>;
  if (error) return <main className="container admin-page"><div className="error-banner">{error}</div></main>;

  return (
    <main className="container admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage your catalog, inventory, and orders</p>
        </div>
        {activeTab === "products" && (
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Product
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "1px solid var(--border-soft)", paddingBottom: 16 }}>
        <button 
          className={`btn ${activeTab === "analytics" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button 
          className={`btn ${activeTab === "products" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button 
          className={`btn ${activeTab === "orders" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {activeTab === "analytics" ? (
        <AnalyticsDashboard />
      ) : activeTab === "products" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <img src={p.imageUrl} alt="" className="admin-img" />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toLocaleString("en-IN")}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>{p.stock}</span>
                      <AvailabilityBadge availability={p.availability} />
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px 0" }}>
                    No products found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>User ID</th>
                <th>Total</th>
                <th>Status</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.userId}</td>
                  <td style={{ fontWeight: 600 }}>₹{o.totalAmount.toLocaleString("en-IN")}</td>
                  <td>
                    <select 
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border-soft)", background: "var(--bg-elevated)", color: "var(--text-color)" }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {o.items.map(i => `${i.quantity}x ${i.product?.name || "Unknown"}`).join(", ")}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px 0" }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? "Edit Product" : "Add Product"}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      className="form-input"
                      type="text"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      required
                    />
                    {formErrors.category && <span className="form-error">{formErrors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                    {formErrors.price && <span className="form-error">{formErrors.price}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                      required
                    />
                    {formErrors.stock && <span className="form-error">{formErrors.stock}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      className="form-input"
                      type="text"
                      value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      required
                    />
                    {formErrors.imageUrl && <span className="form-error">{formErrors.imageUrl}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  {formErrors.description && <span className="form-error">{formErrors.description}</span>}
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

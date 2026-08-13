import { useEffect, useState } from "react";
import { analyticsApi } from "../api/analyticsApi";
import { Spinner } from "../components/common/Skeleton";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getStats().then(res => {
      if (res.success && res.data) {
        setStats(res.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <p>Failed to load analytics</p>;

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: "var(--radius)" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 8 }}>Total Revenue</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: "var(--radius)" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 8 }}>Total Orders</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>{stats.totalOrders}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: "var(--radius)" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 8 }}>Total Customers</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>{stats.totalUsers}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: "var(--radius)" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 8 }}>Total Products</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>{stats.totalProducts}</p>
        </div>
      </div>

      <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: "var(--radius)" }}>
        <h3 style={{ marginBottom: 16 }}>Most Popular Products</h3>
        {stats.popularProducts.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No sales data yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {stats.popularProducts.map((p: any) => (
                <tr key={p.id}>
                  <td><img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} /></td>
                  <td>{p.name}</td>
                  <td><span className="badge badge-in-stock">{p.totalSold}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

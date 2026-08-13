import { useEffect, useState } from "react";
import { reviewApi } from "../api/reviewApi";
import { useAuth } from "../store/AuthContext";
import { showToast } from "../components/common/Toast";
import { Spinner } from "../components/common/Skeleton";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string };
}

export default function ReviewSection({ productId }: { productId: number }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = () => {
    reviewApi.getByProduct(productId).then(res => {
      if (res.success && res.data) {
        setReviews(res.data.reviews);
        setStats(res.data.stats);
      }
    }).finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) { showToast({ message: "Review comment is required", type: "error" }); return; }
    
    setSubmitting(true);
    try {
      const res = await reviewApi.create(productId, rating, comment);
      if (res.success) {
        showToast({ message: "Review posted successfully!", type: "success" });
        setComment("");
        loadReviews(); // Reload to get updated stats and reviews
      } else {
        showToast({ message: res.message || "Failed to post review", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats.average} <span style={{ color: "var(--yellow)" }}>★</span></div>
        <div style={{ color: "var(--text-muted)" }}>Based on {stats.count} review{stats.count === 1 ? "" : "s"}</div>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: "var(--radius)", marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Write a Review</h3>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Rating</label>
            <select className="form-input" value={rating} onChange={e => setRating(Number(e.target.value))} required style={{ width: 120 }}>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Comment</label>
            <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)} required placeholder="Share your experience with this product..." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Posting..." : "Post Review"}
          </button>
        </form>
      ) : (
        <div style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: "var(--radius)", marginBottom: 32 }}>
          <p style={{ color: "var(--text-muted)" }}>Please login to write a review.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reviews.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                    {r.user?.name.charAt(0).toUpperCase()}
                  </div>
                  {r.user?.name}
                </strong>
                <span style={{ color: "var(--yellow)", fontWeight: 700 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              </div>
              <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: 8 }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <p style={{ color: "var(--text)" }}>{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

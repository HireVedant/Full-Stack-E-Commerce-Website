import { useState, useCallback, useEffect } from "react";

interface ToastOptions {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface Toast extends ToastOptions {
  id: number;
}

let _setToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;
let _id = 0;

export function showToast(opts: ToastOptions) {
  if (!_setToasts) return;
  const id = ++_id;
  _setToasts((prev) => [...prev, { ...opts, id }]);
  setTimeout(() => {
    _setToasts?.((prev) => prev.filter((t) => t.id !== id));
  }, opts.duration ?? 3500);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  _setToasts = setToasts;

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return () => { _setToasts = null; };
  }, []);

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 300, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type ?? "info"}`}
          onClick={() => dismiss(t.id)}
          style={{ cursor: "pointer" }}
        >
          <span className="toast-icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

import type { Product } from "../../types";

interface AvailabilityBadgeProps {
  availability: Product["availability"];
  stock?: number;
}

export default function AvailabilityBadge({ availability, stock }: AvailabilityBadgeProps) {
  if (availability === "in_stock") {
    return (
      <span className="badge badge-in-stock">
        <span className="badge-dot" />
        In Stock{stock !== undefined ? ` (${stock})` : ""}
      </span>
    );
  }
  if (availability === "low_stock") {
    return (
      <span className="badge badge-low-stock">
        <span className="badge-dot" />
        Low Stock{stock !== undefined ? ` (${stock} left)` : ""}
      </span>
    );
  }
  return (
    <span className="badge badge-out-stock">
      <span className="badge-dot" />
      Out of Stock
    </span>
  );
}

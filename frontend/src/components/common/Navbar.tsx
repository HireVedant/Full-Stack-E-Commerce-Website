import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../store/CartContext";
import { useAuth } from "../../store/AuthContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" id="nav-logo">ShopVibe</Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link${pathname === "/" ? " active" : ""}`} id="nav-home">
            Products
          </Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className={`nav-link${pathname.startsWith("/admin") ? " active" : ""}`} id="nav-admin">
                  Admin
                </Link>
              )}
              <Link to="/orders" className={`nav-link${pathname === "/orders" ? " active" : ""}`}>
                Orders
              </Link>
              <Link to="/wishlist" className={`nav-link${pathname === "/wishlist" ? " active" : ""}`}>
                Wishlist
              </Link>
              <Link to="/profile" className={`nav-link${pathname === "/profile" ? " active" : ""}`} style={{ opacity: 0.8, fontWeight: 700 }}>
                Hi, {user?.name.split(" ")[0]}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className={`nav-link${pathname === "/login" ? " active" : ""}`}>
              Login
            </Link>
          )}

          <Link to="/cart" className="cart-btn" id="nav-cart">
            <span>🛒</span>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="cart-badge" aria-label={`${totalItems} items in cart`}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

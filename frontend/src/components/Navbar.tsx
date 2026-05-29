import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  if (["/login", "/register"].includes(location.pathname)) return null;

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        ShopFlow
      </Link>

      <div style={styles.links}>
        {isAuthenticated ? (
          <>
            <span style={styles.greeting}>Hi, {user?.name}</span>
            <Link to="/cart" style={styles.cartLink}>
              Cart{" "}
              {totalItems > 0 && <span style={styles.badge}>{totalItems}</span>}
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" style={styles.link}>
                Admin
              </Link>
            )}
            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  links: { display: "flex", alignItems: "center", gap: "1.2rem" },
  link: { color: "white", textDecoration: "none" },
  cartLink: { color: "white", textDecoration: "none", position: "relative" },
  badge: {
    position: "absolute",
    top: "-8px",
    right: "-10px",
    background: "#e94560",
    color: "white",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { color: "#aaa", fontSize: "0.9rem" },
  logoutBtn: {
    background: "none",
    border: "1px solid #e94560",
    color: "#e94560",
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Navbar;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../hooks/useCart";

const CartPage = () => {
  const {
    items,
    totalItems,
    totalPrice,
    formattedTotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const shippingAddress = {
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India",
  };

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError("");
    try {
      await api.post("/orders", {
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.images[0] || "",
        })),
        totalPrice,
        shippingAddress,
      });

      clearCart();
      navigate("/orders");
    } catch (err: unknown) {
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.empty}>
          <div style={{ fontSize: "4rem" }}>🛒</div>
          <h2>Your cart is empty</h2>
          <p style={{ color: "#888" }}>Add some products to get started</p>
          <Link to="/" style={styles.shopLink}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Your Cart ({totalItems} items)</h1>

      <div style={styles.layout}>
        <div style={styles.items}>
          {items.map(({ product, quantity }) => (
            <div key={product._id} style={styles.item}>
              <div style={styles.itemImg}>
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={styles.img}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>📦</span>
                )}
              </div>

              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{product.name}</h3>
                <p style={styles.itemPrice}>
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>

              <div style={styles.qtyControls}>
                <button
                  onClick={() => updateQuantity(product._id, quantity - 1)}
                  style={styles.qtyBtn}
                >
                  −
                </button>
                <span style={styles.qty}>{quantity}</span>
                <button
                  onClick={() => updateQuantity(product._id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  style={styles.qtyBtn}
                >
                  +
                </button>
              </div>

              <div style={styles.itemTotal}>
                ₹{(product.price * quantity).toLocaleString("en-IN")}
              </div>

              <button
                onClick={() => removeItem(product._id)}
                style={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>

          <div style={styles.summaryRow}>
            <span>Subtotal ({totalItems} items)</span>
            <span>{formattedTotal}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Shipping</span>
            <span style={{ color: "#2ecc71" }}>Free</span>
          </div>
          <div style={styles.divider} />
          <div
            style={{
              ...styles.summaryRow,
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            <span>Total</span>
            <span>{formattedTotal}</span>
          </div>

          {orderError && (
            <p
              style={{
                color: "#e94560",
                fontSize: "0.9rem",
                margin: "0.5rem 0",
              }}
            >
              {orderError}
            </p>
          )}

          <button
            onClick={placeOrder}
            disabled={isPlacingOrder}
            style={{ ...styles.orderBtn, opacity: isPlacingOrder ? 0.7 : 1 }}
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </button>

          <Link to="/" style={styles.continueLink}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.6rem", color: "#1a1a2e", marginBottom: "1.5rem" },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "2rem",
    alignItems: "start",
  },
  items: { display: "flex", flexDirection: "column", gap: "1rem" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    background: "white",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  itemImg: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  itemInfo: { flex: 1 },
  itemName: { margin: "0 0 0.3rem", fontSize: "0.95rem", color: "#1a1a2e" },
  itemPrice: { margin: 0, color: "#888", fontSize: "0.9rem" },
  qtyControls: { display: "flex", alignItems: "center", gap: "0.5rem" },
  qtyBtn: {
    width: "28px",
    height: "28px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    background: "white",
    cursor: "pointer",
    fontSize: "1rem",
  },
  qty: { minWidth: "24px", textAlign: "center", fontWeight: 600 },
  itemTotal: { fontWeight: 700, minWidth: "80px", textAlign: "right" },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.25rem",
  },
  summary: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "80px",
  },
  summaryTitle: { margin: "0 0 1.2rem", fontSize: "1.2rem", color: "#1a1a2e" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    fontSize: "0.95rem",
  },
  divider: { height: "1px", background: "#eee", margin: "1rem 0" },
  orderBtn: {
    width: "100%",
    padding: "0.9rem",
    backgroundColor: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "1rem",
  },
  continueLink: {
    display: "block",
    textAlign: "center",
    marginTop: "1rem",
    color: "#888",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  empty: { textAlign: "center", padding: "5rem 2rem" },
  shopLink: {
    display: "inline-block",
    marginTop: "1rem",
    padding: "0.75rem 2rem",
    backgroundColor: "#e94560",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default CartPage;

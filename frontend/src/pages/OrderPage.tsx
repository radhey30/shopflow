import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import type { Order } from "../types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f0a500",
  processing: "#3498db",
  shipped: "#9b59b6",
  delivered: "#2ecc71",
  cancelled: "#e94560",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.data);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <div style={styles.center}>Loading orders...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  if (orders.length === 0) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: "3rem" }}>📦</div>
        <h2>No orders yet</h2>
        <Link to="/" style={styles.shopLink}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Orders</h1>

      <div style={styles.list}>
        {orders.map((order) => (
          <div key={order._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.orderId}>
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div style={styles.headerRight}>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: STATUS_COLORS[order.status] + "22",
                    color: STATUS_COLORS[order.status],
                  }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p style={styles.total}>
                  ₹{order.totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div style={styles.items}>
              {order.items.map((item, idx) => (
                <div key={idx} style={styles.item}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={styles.itemMeta}>
                    x{item.quantity} · ₹{item.price.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.cardFooter}>
              <span
                style={{
                  ...styles.payBadge,
                  color: order.isPaid ? "#2ecc71" : "#e94560",
                }}
              >
                {order.isPaid ? "✓ Paid" : "✗ Unpaid"}
              </span>
              <span style={styles.itemCount}>
                {order.items.length} item{order.items.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: "800px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.6rem", color: "#1a1a2e", marginBottom: "1.5rem" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  orderId: {
    margin: 0,
    fontWeight: 700,
    color: "#1a1a2e",
    fontSize: "0.95rem",
  },
  orderDate: { margin: "0.2rem 0 0", color: "#888", fontSize: "0.85rem" },
  headerRight: { textAlign: "right" },
  badge: {
    padding: "0.3rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  total: { margin: "0.4rem 0 0", fontWeight: 700, fontSize: "1.1rem" },
  items: {
    borderTop: "1px solid #f0f0f0",
    paddingTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  itemName: { color: "#333" },
  itemMeta: { color: "#888" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #f0f0f0",
  },
  payBadge: { fontSize: "0.85rem", fontWeight: 600 },
  itemCount: { fontSize: "0.85rem", color: "#888" },
  center: { textAlign: "center", padding: "5rem 2rem" },
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

export default OrdersPage;

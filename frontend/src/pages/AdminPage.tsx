import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import type { Product } from "../types";

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  maxOrder: number;
  minOrder: number;
}

interface MonthlyData {
  month: number;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

type AdminTab = "analytics" | "products" | "orders";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AdminPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      <div style={styles.tabs}>
        {(["analytics", "products", "orders"] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              borderBottom:
                activeTab === tab
                  ? "2px solid #e94560"
                  : "2px solid transparent",
              color: activeTab === tab ? "#e94560" : "#888",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "orders" && <AdminOrdersTab />}
    </div>
  );
};

const AnalyticsTab = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, monthlyRes, topRes] = await Promise.all([
          api.get("/products/analytics/summary"),
          api.get("/products/analytics/monthly"),
          api.get("/products/analytics/top-products"),
        ]);
        setSummary(summaryRes.data.data);
        setMonthly(monthlyRes.data.data);
        setTopProducts(topRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (isLoading) return <div style={styles.center}>Loading analytics...</div>;

  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <div style={styles.analyticsGrid}>
      {summary && (
        <div style={styles.summaryCards}>
          {[
            {
              label: "Total Revenue",
              value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`,
              color: "#e94560",
            },
            {
              label: "Total Orders",
              value: summary.totalOrders,
              color: "#3498db",
            },
            {
              label: "Avg Order Value",
              value: `₹${summary.avgOrderValue.toLocaleString("en-IN")}`,
              color: "#2ecc71",
            },
            {
              label: "Highest Order",
              value: `₹${summary.maxOrder.toLocaleString("en-IN")}`,
              color: "#f0a500",
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={styles.summaryCard}>
              <p style={{ ...styles.summaryValue, color }}>{value}</p>
              <p style={styles.summaryLabel}>{label}</p>
            </div>
          ))}
        </div>
      )}

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Monthly Revenue</h3>
        <div style={styles.barChart}>
          {monthly.map((m) => (
            <div key={m.month} style={styles.barGroup}>
              <p style={styles.barValue}>
                {m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(0)}k` : ""}
              </p>
              <div
                style={{
                  ...styles.bar,
                  height: `${(m.revenue / maxRevenue) * 150}px`,
                  backgroundColor: m.revenue > 0 ? "#e94560" : "#f0f0f0",
                }}
              />
              <p style={styles.barLabel}>{MONTH_NAMES[m.month - 1]}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Top Selling Products</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Product", "Units Sold", "Revenue"].map((h) => (
                <th key={h} style={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr
                key={p.productId}
                style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "white" }}
              >
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.totalSold}</td>
                <td style={styles.td}>
                  ₹{p.totalRevenue.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products?limit=50");
      setProducts(data.data.products);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      images: "",
    });
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      images: product.images.join(", "),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert("Failed to save product.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  if (isLoading) return <div style={styles.center}>Loading products...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Products ({products.length})</h2>
        <button onClick={openCreate} style={styles.primaryBtn}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={{ marginTop: 0 }}>
            {editing ? "Edit Product" : "Add Product"}
          </h3>
          <div style={styles.formGrid}>
            {[
              { label: "Name", key: "name", type: "text" },
              { label: "Category", key: "category", type: "text" },
              { label: "Price (₹)", key: "price", type: "number" },
              { label: "Stock", key: "stock", type: "number" },
              {
                label: "Images (comma separated URLs)",
                key: "images",
                type: "text",
              },
            ].map(({ label, key, type }) => (
              <div key={key} style={styles.formField}>
                <label style={styles.formLabel}>{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  style={styles.formInput}
                />
              </div>
            ))}
            <div style={{ ...styles.formField, gridColumn: "1 / -1" }}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                style={{ ...styles.formInput, resize: "vertical" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button onClick={handleSubmit} style={styles.primaryBtn}>
              {editing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={styles.secondaryBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            {["Name", "Category", "Price", "Stock", "Rating", "Actions"].map(
              (h) => (
                <th key={h} style={styles.th}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p._id}
              style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "white" }}
            >
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.category}</td>
              <td style={styles.td}>₹{p.price.toLocaleString("en-IN")}</td>
              <td
                style={{
                  ...styles.td,
                  color:
                    p.stock === 0
                      ? "#e94560"
                      : p.stock < 5
                        ? "#f0a500"
                        : "#2ecc71",
                  fontWeight: 600,
                }}
              >
                {p.stock}
              </td>
              <td style={styles.td}>
                ⭐ {p.ratings.average} ({p.ratings.count})
              </td>
              <td style={styles.td}>
                <button onClick={() => openEdit(p)} style={styles.editBtn}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/orders${params}`);
      setOrders(data.data.orders);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch {
      alert("Failed to update status.");
    }
  };

  const STATUS_OPTIONS = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const STATUS_COLORS: Record<string, string> = {
    pending: "#f0a500",
    processing: "#3498db",
    shipped: "#9b59b6",
    delivered: "#2ecc71",
    cancelled: "#e94560",
  };

  if (isLoading) return <div style={styles.center}>Loading orders...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>All Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.formInput}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {[
              "Order ID",
              "Customer",
              "Total",
              "Status",
              "Date",
              "Update Status",
            ].map((h) => (
              <th key={h} style={styles.th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr
              key={order._id}
              style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "white" }}
            >
              <td style={styles.td}>#{order._id.slice(-8).toUpperCase()}</td>
              <td style={styles.td}>{order.user?.name || "—"}</td>
              <td style={styles.td}>
                ₹{order.totalPrice.toLocaleString("en-IN")}
              </td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.statusPill,
                    backgroundColor: STATUS_COLORS[order.status] + "22",
                    color: STATUS_COLORS[order.status],
                  }}
                >
                  {order.status}
                </span>
              </td>
              <td style={styles.td}>
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td style={styles.td}>
                {order.status !== "cancelled" &&
                  order.status !== "delivered" && (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value)
                          updateStatus(order._id, e.target.value);
                      }}
                      style={{ ...styles.formInput, padding: "0.3rem" }}
                    >
                      <option value="" disabled>
                        Change...
                      </option>
                      {STATUS_OPTIONS.filter((s) => s !== order.status).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "2rem" },
  title: { fontSize: "1.6rem", color: "#1a1a2e", marginBottom: "0.5rem" },
  tabs: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid #eee",
    marginBottom: "2rem",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    background: "none",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  analyticsGrid: { display: "flex", flexDirection: "column", gap: "2rem" },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
  },
  summaryCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    textAlign: "center",
  },
  summaryValue: { fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.3rem" },
  summaryLabel: { color: "#888", fontSize: "0.85rem", margin: 0 },
  chartCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  chartTitle: { margin: "0 0 1.5rem", color: "#1a1a2e" },
  barChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "0.5rem",
    height: "180px",
    paddingBottom: "2rem",
    borderBottom: "1px solid #eee",
  },
  barGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.3rem",
  },
  bar: {
    width: "100%",
    borderRadius: "4px 4px 0 0",
    minHeight: "4px",
    transition: "height 0.3s ease",
  },
  barValue: { fontSize: "0.65rem", color: "#888", margin: 0, height: "16px" },
  barLabel: { fontSize: "0.7rem", color: "#888", margin: 0 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    borderBottom: "2px solid #eee",
    color: "#888",
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "uppercase",
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    color: "#333",
  },
  formCard: {
    background: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "10px",
    marginBottom: "1.5rem",
    border: "1px solid #eee",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  formField: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  formLabel: { fontSize: "0.8rem", fontWeight: 600, color: "#555" },
  formInput: {
    padding: "0.6rem 0.8rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.9rem",
    width: "100%",
    boxSizing: "border-box",
  },
  primaryBtn: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
  },
  editBtn: {
    padding: "0.3rem 0.7rem",
    marginRight: "0.5rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  deleteBtn: {
    padding: "0.3rem 0.7rem",
    backgroundColor: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  statusPill: {
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  center: { textAlign: "center", padding: "3rem", color: "#888" },
};

export default AdminPage;

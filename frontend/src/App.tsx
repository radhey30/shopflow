import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  return user?.role === "admin" ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/register" element={<p>Register page</p>} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <p>Product Page</p>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <p>Cart page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
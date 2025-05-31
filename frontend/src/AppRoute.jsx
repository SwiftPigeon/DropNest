// import { Route, Routes } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import DeliveryPage from "./pages/DeliveryPage";

// export default function AppRoute({ user, setUser }) {
//   return (
//     <Routes>
//       <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
//       <Route
//         path="/createDelivery"
//         element={<DeliveryPage user={user} setUser={setUser} />}
//       />
//     </Routes>
//   );
// }
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "./context/AuthContext";

// Import page components
import HomePage from "./pages/HomePage";
import DeliveryPage from "./pages/DeliveryPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import ProfilePage from "./pages/ProfilePage";
// import AddressesPage from "./pages/AddressesPage";
// import OrdersPage from "./pages/OrdersPage";
// import OrderDetailPage from "./pages/OrderDetailPage";
// import TrackingPage from "./pages/TrackingPage";
// import PaymentHistoryPage from "./pages/PaymentHistoryPage";
// import NotFoundPage from "./pages/NotFoundPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function AppRoute() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}

      {/* Protected Routes */}
      {/* <Route
        path="/createDelivery"
        element={
          <ProtectedRoute>
            <DeliveryPage />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracking/:orderId"
        element={
          <ProtectedRoute>
            <TrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentHistoryPage />
          </ProtectedRoute>
        }
      /> */}

      {/* 404 Page */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

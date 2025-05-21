import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DeliveryPage from "./pages/DeliveryPage";

export default function AppRoute({ user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
      <Route
        path="/createDelivery"
        element={<DeliveryPage user={user} setUser={setUser} />}
      />
    </Routes>
  );
}

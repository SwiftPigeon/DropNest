import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AppRoute from "./AppRoute";
import { jwtDecode } from "jwt-decode";

function App() {
  // MOCK USER

  const [user, setUser] = useState(null);

  // ***** ALL FOR TEST *****
  // get token from local storage
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name,
        });
      } catch (err) {
        console.warn("Invalid token:", err);
        setUser(null);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <AppRoute user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;

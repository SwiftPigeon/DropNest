import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AppRoute from "./AppRoute";

function App() {
  // MOCK USER
  const mockUser = {
    name: "emily",
    email: "alex@example.com",
  };

  // const [user, setUser] = useState(mockUser);

  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <AppRoute user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;

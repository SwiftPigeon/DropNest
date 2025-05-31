import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoute from "./AppRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoute />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

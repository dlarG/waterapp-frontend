import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./HomePage";
import MapView from "./MapView";
import "./App.css";
import AuthPage from "./auth/AuthPage";
import Dashboard from "./components/Dashboard";
import MapViewAdmin from "./MapViewAdmin";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/map" element={<MapViewAdmin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

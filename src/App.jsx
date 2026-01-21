import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./HomePage";
import MapView from "./MapView";
// import TestMapSimple from "./TestMapSimple";
import "./App.css";
// import MapViewFixed from "./MapViewFixed";
// import MapViewSimple from "./MapViewSimple";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapView />} />
            {/* <Route path="/test-map-simple" element={<TestMapSimple />} /> */}
            {/* <Route path="/map-fixed" element={<MapViewFixed />} /> */}
            {/* {/* <Route path="/map-simple" element={<MapViewSimple />} /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

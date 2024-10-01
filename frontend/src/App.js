import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Product from "./Product";
import Login from "./Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Product />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

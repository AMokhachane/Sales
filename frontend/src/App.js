import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Login from "./Login";
import Email from "./Email";
import Register from "./Register"
import ProductSales from "./ProductSales";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/" element={<Login />} />
        <Route path="/Email" element={<Email />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/product-sales/:productId" element={<ProductSales />} />
      </Routes>
    </Router>
  );
}

export default App;

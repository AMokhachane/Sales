import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Product from "./Product";
import Login from "./Login";
import Email from "./Email";
import Register from "./Register"
import ProductSales from "./ProductSales";
import CartPage from "./CartPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Product />} />
        <Route path="/" element={<Login />} />
        <Route path="/Email" element={<Email />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/product-sales/:productId" element={<ProductSales />} />
				<Route path="/cart" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCSS from "./Product.module.css"; // Import the styles

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State for unique categories
  const [selectedCategory, setSelectedCategory] = useState(""); // State for the selected category

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/products");
        setProducts(response.data);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(response.data.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter products based on the selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <div>
      <h2>Product List</h2>

      {/* Category Filter */}
      <div>
        <h3>Filter by Category</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)} // Update selected category
          className={ProductCSS.categorySelect} // Add a style class if needed
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={ProductCSS.productList}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={ProductCSS.productCard}>
            <img
              src={product.image}
              alt={product.description}
              className={ProductCSS.productImage}
            />
            <h3>{product.name}</h3>
            <p>Description: {product.description}</p> {/* Display product description */}
            <p>Category: {product.category}</p>
            <p style={{ fontWeight: "bold", color: "#4CAF50" }}>
              Sale Price: ${product.salePrice} {/* Display sale price */}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
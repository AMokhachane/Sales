import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCSS from "./Product.module.css"; // Import the styles

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State for unique categories
  const [selectedCategory, setSelectedCategory] = useState(""); // State for the selected category
  const [currentPage, setCurrentPage] = useState(1); // State for the current page
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const productsPerPage = 4; // Number of products per page

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

  // Filter products based on the selected category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;
    const matchesSearch =
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate the index of the last product and the first product of the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={ProductCSS.productContainer}>
      <h2 className={ProductCSS.title}>Product List</h2>

      {/* Search Bar */}
      <div className={ProductCSS.searchContainer}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to the first page when search changes
          }}
          className={ProductCSS.searchInput}
        />
      </div>

      {/* Category Filter */}
      <div className={ProductCSS.filterContainer}>
        <h3 className={ProductCSS.filterTitle}>Filter by Category</h3>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1); // Reset to the first page when category changes
          }}
          className={ProductCSS.categorySelect}
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
        {currentProducts.map((product) => (
          <div key={product.id} className={ProductCSS.productCard}>
            <img
              src={product.image}
              alt={product.description}
              className={ProductCSS.productImage}
            />
            <h3 className={ProductCSS.productName}>{product.name}</h3>
            <p className={ProductCSS.productDescription}>
              Description: {product.description}
            </p>
            <p className={ProductCSS.productCategory}>
              Category: {product.category}
            </p>
            <p className={ProductCSS.productPrice}>
              Sale Price: ${product.salePrice}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className={ProductCSS.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`${ProductCSS.pageButton} ${
              currentPage === index + 1 ? ProductCSS.active : ""
            }`} // Highlight active page
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Product;
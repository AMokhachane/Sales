import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ProductCSS from "./Product.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAppleAlt, faUser, faSignOutAlt, faShoppingCart  } from "@fortawesome/free-solid-svg-icons";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
	const [cartCount, setCartCount] = useState(0);
  const productsPerPage = 8;

  const navigate = useNavigate();

	const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/products");
        setProducts(response.data);

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

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;
    const matchesPrice =
      selectedPriceRange === "" ||
      (selectedPriceRange === "below10" && product.salePrice < 10) ||
      (selectedPriceRange === "between10And20" &&
        product.salePrice >= 10 &&
        product.salePrice <= 20) ||
      (selectedPriceRange === "above20" && product.salePrice > 20);
    const matchesSearch = product.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleProductClick = (product) => {
    navigate(`/product-sales/${product.id}`, {
      state: {
        image: product.image,
        description: product.description,
        salePrice: product.salePrice,
      },
    });
  };

  // Retrieve user info from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || "Guest";
  const userName = user?.userName || "User";
  const userEmail = user?.userEmail || "user@example.com";

  return (
    <div className={ProductCSS.productContainer}>
      <div className={ProductCSS.UserContainer}>
        <h2 className={ProductCSS.welcomeMessage}>
          Welcome, you are logged in as{" "}
        </h2>

        <div className={ProductCSS.profilePictureContainer}>
          <FontAwesomeIcon icon={faUser} className={ProductCSS.userIcon} />
        </div>
        <span className={ProductCSS.userRole}>{userRole}</span>
        <p className={ProductCSS.userEmail}>{userEmail}</p>
      </div>
      <div className={ProductCSS.left}>
        <div className={ProductCSS.searchContainer}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={ProductCSS.searchInput}
          />
        </div>

        

        <div className={ProductCSS.productList}>
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className={ProductCSS.productCard}
              onClick={() => handleProductClick(product)}
            >
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

        <div className={ProductCSS.pagination}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`${ProductCSS.pageButton} ${
                currentPage === index + 1 ? ProductCSS.active : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className={ProductCSS.leftSide}>
        <div className={ProductCSS.logo}>
          <div className={ProductCSS.logoSquare}>
            <FontAwesomeIcon icon={faAppleAlt} size="3x" color="green" />
          </div>
          <span className={ProductCSS.boldText}>FRESH FRUITS & VEGGIES</span>
        </div>
{/* Shopping Cart Icon */}
<div className={ProductCSS.cartContainer}>
        <FontAwesomeIcon icon={faShoppingCart} size="2x" />
        <span className={ProductCSS.cartCount}>{cartCount}</span>
      </div>
        <div className={ProductCSS.priceContainer}>
          <h3 className={ProductCSS.filterTitle}>Filter by Price</h3>
          <select
            value={selectedPriceRange}
            onChange={(e) => {
              setSelectedPriceRange(e.target.value);
              setCurrentPage(1);
            }}
            className={ProductCSS.priceSelect}
          >
            <option value="">All Prices</option>
            <option value="below10">Below $10</option>
            <option value="between10And20">$10 - $20</option>
            <option value="above20">Above $20</option>
          </select>
        </div>

        <div className={ProductCSS.filterContainer}>
          <h3 className={ProductCSS.filterTitle}>Filter by Category</h3>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
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

        <div className={ProductCSS.tipsContainer}>
          <h3 className={ProductCSS.tipsTitle}>
            Tips for Picking Fresh Fruits & Veggies
          </h3>
          <ul className={ProductCSS.tipsList}>
            <li>Look for vibrant colors; it often indicates ripeness.</li>
            <li>Check for firmness; avoid overly soft or bruised spots.</li>
            <li>Smell the fruit; a sweet aroma often means it's ripe.</li>
            <li>For leafy greens, ensure leaves are crisp and green.</li>
            <li>Avoid any items with mold, blemishes, or wrinkled skin.</li>
          </ul>
        </div>
				<button
            className={ProductCSS.logoutButton}
            onClick={() => {
              localStorage.removeItem("user"); 
              navigate("/"); 
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
						 <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: "8px" }} />
            Logout
          </button>
      </div>
    </div>
  );
};

export default Product;

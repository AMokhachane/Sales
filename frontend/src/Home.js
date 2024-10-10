import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";
import ProductCSS from "./Product.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAppleAlt, faUser, faSignOutAlt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const conversionRate = 18; //Converts USD to South African rands
	const [isCartOpen, setIsCartOpen] = useState(false);
  const productsPerPage = 8;

  const navigate = useNavigate();

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/products"); //Getting products from the Singular API that was provided to me
        const productsWithCartStatus = response.data.map((product) => ({
          ...product,
          isInCart: false,
        }));
        setProducts(productsWithCartStatus);

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

  const handleAddToCartClick = (product) => {
    if (!product.isInCart) {
      addToCart(product);
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id ? { ...p, isInCart: true } : p
        )
      );
    } else {
      navigate("/home");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory; //Filter by category, filter by price, filter by search bar using the product name
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

	const toggleCartDropdown = () => {
    setIsCartOpen((prevState) => !prevState);
  };

  const handleProductClick = (product) => {
    navigate(`/product-sales/${product.id}`, {
      state: {
        image: product.image,
        description: product.description,
        salePrice: product.salePrice,
      },
    }); //For viewing the sales history on click of each product
  };

  const user = JSON.parse(localStorage.getItem("user"));  // Retrieve user info from local storage
  const userRole = user?.role || "Normal User";
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
            >
              <img
                src={product.image}
                alt={product.description}
                className={ProductCSS.productImage}
                onClick={() => handleProductClick(product)}
              />
              <h3 className={ProductCSS.productName}>{product.name}</h3>
              <p className={ProductCSS.productDescription}>
                 {product.description}
              </p>
              <p className={ProductCSS.productCategory}>
                Category: {product.category}
              </p>
              <p className={ProductCSS.productPrice}>
                Sale Price: R{(product.salePrice * conversionRate).toFixed(2)}
              </p>
              <button
                className={ProductCSS.addToCartButton}
                onClick={() => handleAddToCartClick(product)}
              >
                {product.isInCart ? "View Cart" : "Add to Cart"}
              </button>
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

    {/* Cart Section */}
<div className={ProductCSS.cartContainer}>
  <div className={ProductCSS.basketInfo}>
    <FontAwesomeIcon icon={faShoppingCart} size="2x" />
    <p className={ProductCSS.totalItemsText}>
      Total items in cart: {cart.length}
    </p>
    <button
      className={ProductCSS.goToCartButton}
      onClick={toggleCartDropdown}
    >
      {isCartOpen ? "Hide Cart" : "View Cart"}
    </button>
  </div>
  {isCartOpen && (
    <div className={ProductCSS.cartDropdown}>
      {cart.length > 0 ? (
        cart.map((item, index) => (
          <div key={index} className={ProductCSS.cartItem}>
            <p>{item.name}</p>
						<p>{item.description}</p> 
            <p>R{(item.salePrice * conversionRate).toFixed(2)}</p>
            
          </div>
        ))
      ) : (
        <p className={ProductCSS.emptyCartMessage}>Cart is empty</p>
      )}
    </div>
  )}
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
          }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: "8px" }} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
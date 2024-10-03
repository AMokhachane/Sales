import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import ProductCSS from "./Product.module.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const CartPage = () => {
  const location = useLocation();
  const { cart, setCart } = location.state || { cart: [] }; // Fallback to empty array if cart is undefined
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const removeFromCart = (productToRemove) => {
    setCart((prevCart) => {
      return prevCart.filter((item) => item.id !== productToRemove.id);
    });
  };

  return (
    <div className={ProductCSS.cartPageContainer}>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty!</p>
      ) : (
        <div className={ProductCSS.cartDetails}>
          <h3>Cart Items:</h3>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.description}
                <button
                  className={ProductCSS.removeFromCartButton}
                  onClick={() => removeFromCart(item)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default CartPage;
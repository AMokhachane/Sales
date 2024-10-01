import React, { useState } from "react";
import axios from "axios"; 
import styles from "./Login.module.css"; 
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAppleAlt } from '@fortawesome/free-solid-svg-icons'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState(""); // To handle server-side errors
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // API call to login
        const response = await axios.post("http://localhost:5264/api/accounts/login", {
          email: email, 
          password: password,
        });

        // Handle success
        if (response.status === 200) {
          const { userEmail, userName, userID } = response.data;
          localStorage.setItem("user", JSON.stringify({ userName, userEmail, userID }));
          setSuccessMessage("Login successful!");
          setEmail("");
          setPassword("");
          setErrors({});
          navigate("/home");
        }
      } catch (error) {
        // Handle errors from the server
        if (error.response) {
          setServerError(error.response.data.message);
        } else {
          setServerError("An error occurred. Please try again.");
        }
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoSquare}>
            <FontAwesomeIcon icon={faAppleAlt} size="3x" color="#green" />
          </div>
          <span className={styles.boldText}>FRESH FRUITS & VEGGIES</span>
        </div>
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        {serverError && <p className={styles.errorMessage}>{serverError}</p>} {/* Display server errors */}
        <form onSubmit={handleLogin}>
          <div className={styles.Group}>
            <label className={styles.label}>Email</label>
            {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
            <input
              type="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.Group}>
            <label className={styles.label}>Password</label>
            {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
            <input
              type="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.forgotPasswordAndButton}>
            <Link to="/email" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </div>
        </form>
        
        {/* Register link section */}
        <div className={styles.registerLink}>
          <p>If you don't have an account, <Link to="/register" className={styles.register}>register here</Link>.</p>
        </div>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.iconGrid}>
          {/* <img src="https://res.cloudinary.com/drgxphf5l/image/upload/v1726736758/qwbddlqxjjgxsvbdcudg.png" className='image' /> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
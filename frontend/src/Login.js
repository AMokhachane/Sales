import React, { useState } from "react";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAppleAlt } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
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
        const response = await axios.post(
          "http://localhost:5264/api/accounts/login",
          {
            email: email,
            password: password,
          }
        );

        if (response.status === 200) {
          const { userEmail, userID, role } = response.data;
          localStorage.setItem(
            "user",
            JSON.stringify({ userEmail, userID, role }) // Store role in local storage
          );
          setSuccessMessage("Login successful!");
          setEmail("");
          setPassword("");
          setErrors({});
          navigate("/home");
        }
      } catch (error) {
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
            <FontAwesomeIcon icon={faAppleAlt} size="3x" color="green" />
          </div>
          <span className={styles.boldText}>FRESH FRUITS & VEGGIES</span>
        </div>
        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
        {serverError && <p className={styles.errorMessage}>{serverError}</p>}

        <form onSubmit={handleLogin}>
          <div className={styles.Group}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            <input
              type="email"
              className={styles.inputField}
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.Group}>
            <FontAwesomeIcon icon={faLock} className={styles.icon} />
            <input
              type="password"
              className={styles.inputField}
              placeholder="Password"
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
      </div>

      <div className={styles.rightSide}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeText}>Hello and welcome!</h1>
          <p className={styles.welcomeSubtext}>
            If you're new, take a moment to create an account and unlock all the
            amazing features we have to offer.
          </p>
          <p>
            Click{" "}
            <Link to="/register" className={styles.signUpLink}>
              HERE
            </Link>
            to register{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

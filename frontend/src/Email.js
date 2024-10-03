import React, { useState } from "react";
import styles from "./Email.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAppleAlt } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

const Email = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5264/api/accounts/forgotpassword",
        { email }
      );
      setSuccessMessage(response.data.message);

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setError("Failed to send the reset password email. Please try again.");
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <div className={styles.logoSquare}>
            <FontAwesomeIcon icon={faAppleAlt} size="3x" color="#green" />
          </div>
          <span className={styles.boldText}>FRESH FRUITS & VEGGIES</span>
        </div>
        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleForgotPassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.resetButton}>
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default Email;

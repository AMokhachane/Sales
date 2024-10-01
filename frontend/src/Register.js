import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css'; // Assuming you have CSS for styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { faAppleAlt } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
    const [username, setUsername] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Prepare the data to send to the API
        const userData = {
            username,
            emailAddress,
            password,
        };

        try {
            const response = await axios.post('http://localhost:5264/api/accounts/register', userData);
            setSuccessMessage(response.data.message); // Assuming your API returns a message
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setError(error.response.data.errors.join(', ')); // Join error messages
            } else {
                setError('Registration failed. Please try again later.');
            }
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.left}>
			<div className={styles.logo}>
          <div className={styles.logoSquare}>
            <FontAwesomeIcon icon={faAppleAlt} size="3x" color="green" />
          </div>
          <span className={styles.boldText}>FRESH FRUITS & VEGGIES</span>
        </div>
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleRegister}>
                    <div className={styles.Group}>
                        <FontAwesomeIcon icon={faUser} className={styles.icon} />
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.Group}>
                        <FontAwesomeIcon icon={faUser} className={styles.icon} />
                        <input
                            type="email"
                            className={styles.inputField}
                            placeholder="Email Address"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
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
                    <button type="submit" className={styles.registerButton}>
                        Register
                    </button>
                </form>
            </div>
            <div className={styles.rightSide}>
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeText}>Join Us Today!</h1>
                    <p className={styles.welcomeSubtext}>
                        Create an account and unlock all the amazing features we have to offer.
                    </p>
                    <p>
                        Already have an account? <Link to="/login" className={styles.signUpLink}>Login here</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
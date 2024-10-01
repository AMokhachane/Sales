import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css'; // Assuming you have CSS for styles

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
            <h2>Register</h2>
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            <form onSubmit={handleRegister} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Username</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        className={styles.inputField}
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className={styles.registerButton}>Register</button>
            </form>
        </div>
    );
};

export default Register;
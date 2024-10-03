import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProductSales.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const ProductSales = () => {
  const { productId } = useParams(); // Get the productId from the route
  const location = useLocation();
  const { image, description, salePrice } = location.state || {};
  const [salesData, setSalesData] = useState([]);

  // Get user role from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`/product-sales`, {
          params: {
            id: productId,
          },
        });
        setSalesData(response.data);
      } catch (error) {
        console.error("Error fetching product sales data:", error);
      }
    };

    fetchSalesData();
  }, [productId]);

  const totalSalePrice = salesData.reduce(
    (total, sale) => total + sale.salePrice,
    0
  );
  const totalSaleQuantity = salesData.reduce(
    (total, sale) => total + sale.saleQty,
    0
  );

  return (
    <div className={styles.salesContainer}>
      <div className={styles.backButtonContainer}>
        <button onClick={() => navigate("/home")} className={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.arrowIcon} />
          Back to Home
        </button>
      </div>
      {image && (
        <div className={styles.productInfo}>
          <img src={image} alt={description} className={styles.productImage} />
          <p>{description}</p>
          <p>
            <strong>Sale Price:</strong> ${salePrice}
          </p>
        </div>
      )}
      <table className={styles.salesTable}>
        <thead>
          <tr>
            <th>Sale ID</th>
            {userRole === "manager" && <th>Sale Price</th>}
            {userRole === "manager" && <th>Sale Quantity</th>}
            {userRole === "manager" && <th>Sale Date</th>}
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale.saleId}>
              <td>{sale.saleId}</td>
              {userRole === "manager" && <td>${sale.salePrice}</td>}
              {userRole === "manager" && <td>{sale.saleQty}</td>}
              {userRole === "manager" && (
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
              )}
            </tr>
          ))}

          <tr>
            <td colSpan={userRole === "manager" ? 1 : 2}>
              <strong>Total:</strong>
            </td>
            {userRole === "manager" && (
              <td>
                <strong>${totalSalePrice.toFixed(2)}</strong>
              </td>
            )}
            {userRole === "manager" && (
              <td>
                <strong>{totalSaleQuantity}</strong>
              </td>
            )}
            {userRole === "manager" && <td></td>}
          </tr>
          {userRole !== "manager" && (
            <tr>
              <td colSpan="3">
                <strong>Total Sale Price:</strong> ${totalSalePrice.toFixed(2)}{" "}
                | <strong>Total Sale Quantity:</strong> {totalSaleQuantity}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSales;

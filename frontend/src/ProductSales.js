import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ProductSales.module.css"; // Import your CSS module

const ProductSales = () => {
  const { productId } = useParams(); // Get the productId from the route
  const [salesData, setSalesData] = useState([]);
  
  // Get user role from local storage
  const user = JSON.parse(localStorage.getItem("user")); // Get user from local storage
  const userRole = user?.role; // Extract user role

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

  // Calculate total sale price and total sale quantity
  const totalSalePrice = salesData.reduce((total, sale) => total + sale.salePrice, 0);
  const totalSaleQuantity = salesData.reduce((total, sale) => total + sale.saleQty, 0);

  return (
    <div className={styles.salesContainer}>
      <h2 className={styles.title}>Sales Data for Product {productId}</h2>
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
              {userRole === "manager" && <td>{new Date(sale.saleDate).toLocaleDateString()}</td>}
            </tr>
          ))}
          {/* Display totals */}
          <tr>
            <td colSpan={userRole === "manager" ? 1 : 2}><strong>Total:</strong></td>
            {userRole === "manager" && <td><strong>${totalSalePrice.toFixed(2)}</strong></td>}
            {userRole === "manager" && <td><strong>{totalSaleQuantity}</strong></td>}
            {userRole === "manager" && <td></td>}
          </tr>
          {userRole !== "manager" && (
            <tr>
              <td colSpan="3">
                <strong>Total Sale Price:</strong> ${totalSalePrice.toFixed(2)} | <strong>Total Sale Quantity:</strong> {totalSaleQuantity}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSales;
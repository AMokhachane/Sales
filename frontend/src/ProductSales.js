import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ProductSales.module.css"; // Import your CSS module

const ProductSales = () => {
  const { productId } = useParams(); // Get the productId from the route
  const [salesData, setSalesData] = useState([]);

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

  return (
    <div className={styles.salesContainer}>
      <h2 className={styles.title}>Sales Data for Product {productId}</h2>
      <table className={styles.salesTable}>
        <thead>
          <tr>
            <th>Sale ID</th>
            <th>Sale Price</th>
            <th>Sale Quantity</th>
            <th>Sale Date</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale.saleId}>
              <td>{sale.saleId}</td>
              <td>${sale.salePrice}</td>
              <td>{sale.saleQty}</td>
              <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSales;
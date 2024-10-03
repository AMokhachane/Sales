import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProductSales.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const ProductSales = () => {
  const { productId } = useParams(); // Get the productId from the route
  const location = useLocation();
  const { image, description, salePrice } = location.state || {};
  const [salesData, setSalesData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const conversionRate = 18;
  const itemsPerPage = 10; // Set items per page
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(salesData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedData = salesData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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
        // Prepare chart data
        const preparedChartData = response.data.map((sale) => ({
          date: new Date(sale.saleDate).toLocaleDateString(), // Format date
          saleQty: sale.saleQty,
        }));
        setChartData(preparedChartData); // Set the chart data state
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
            <strong>
              Sale Price: R{(salePrice * conversionRate).toFixed(2)}
            </strong>
          </p>
        </div>
      )}
      <table className={styles.salesTable}>
        <thead>
          <tr>
            {userRole === "manager" && <th>Sale Quantity</th>}
            {userRole === "manager" && <th>Sale Date</th>}
            <th>Sale Price</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale.saleId}>
              {userRole === "manager" && <td>{sale.saleQty}</td>}
              {userRole === "manager" && (
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
              )}
              <td>
                <strong>R{(sale.salePrice * conversionRate).toFixed(2)}</strong>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={userRole === "manager" ? 2 : 1}>
              <strong>Total:</strong>
            </td>
            {userRole === "manager" && (
              <td>
                <strong>R{(totalSalePrice * conversionRate).toFixed(2)}</strong>
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
              <td colSpan="2">
                <strong>Total Sale Price:</strong> R
                {(totalSalePrice * conversionRate).toFixed(2)} |{" "}
                <strong>Total Sale Quantity:</strong> {totalSaleQuantity}
              </td>
            </tr>
          )}
        </tbody>
      </table>
			<div>
      
    </div>
      {/* Line Chart for Sales Data */}
      <div className={styles.chartContainer}>
        <h3>Sales Quantity Over Time</h3>
        <LineChart
          width={600}
          height={300}
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="saleQty"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </div>
    </div>
  );
};

export default ProductSales;

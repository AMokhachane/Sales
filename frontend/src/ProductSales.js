import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProductSales.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid,Legend,Label} from "recharts";

const ProductSales = () => {
  const { productId } = useParams();
  const location = useLocation();
  const { image, description, salePrice } = location.state || {};
  const [salesData, setSalesData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const conversionRate = 18;

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== "manager") {
      navigate("/home"); //It doesn't show the sales history if user is not a manager
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`/product-sales`, {
          params: {
            id: productId,
          },
        });
        setSalesData(response.data);
        const preparedChartData = response.data.map((sale) => ({
          date: new Date(sale.saleDate).toLocaleDateString(), //Getting the sales history from the privided Singular API
          saleQty: sale.saleQty,
        }));
        setChartData(preparedChartData);
      } catch (error) {
        console.error("Error fetching product sales data:", error);
      }
    };

    fetchSalesData();
  }, [productId]);
//Sales summary
  const totalSalePrice = salesData.reduce(
    (total, sale) => total + sale.salePrice,
    0
  );
  const totalSaleQuantity = salesData.reduce(
    (total, sale) => total + sale.saleQty,
    0
  );

	const CustomLegend = () => {
		return null; //Hides the information I do not want to display
	};

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

      <div className={styles.cardMoney}>
        <p className={styles.cardTitle}>Total Sales</p>
        <p className={styles.cardValue}>
          R{(totalSalePrice * conversionRate).toFixed(2)}
        </p>
      </div>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Total Quantity Sold</p>
        <p className={styles.cardValue}>{totalSaleQuantity}</p>
      </div>

      <table className={styles.salesTable}>
        <thead>
          <tr>
            {userRole === "manager" && <th>Sale Quantity</th>}
            <th>Sale Date</th>
            <th>Sale Price</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale.saleId}>
              {userRole === "manager" && <td>{sale.saleQty}</td>}
              <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
              <td>R{(sale.salePrice * conversionRate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.chartContainer}>
        <h3>Sales Quantity Over Time</h3>
        <LineChart
          width={600}
          height={300}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date">
            <Label value="Time" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label value="Quantity" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Legend content={<CustomLegend />} />
          <Line
            type="monotone"
            dataKey="saleQty"
            stroke="#8884d8"
            activeDot={{ r: 8 }} //This part of the data is hidden
          />
        </LineChart>
      </div>
    </div>
  );
};

export default ProductSales;
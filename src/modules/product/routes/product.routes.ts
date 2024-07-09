import express from "express";
import {
  allStats,
  barChartStats,
  categoryStats,
  getProducts,
  getProductStat,
  getTransactions,
} from "../contorller/product.conroller";

const productRoute = express.Router();

//Create API to initialize the database. fetch the JSON from the third party API and initialize the database with seed data.
productRoute.get("/getAndAdd", getProducts);

//Create an API to list the all transactions
productRoute.get(`/transactionDetail`, getTransactions);

productRoute.get(`/getProductStat`, getProductStat);

productRoute.get(`/barChartStats`, barChartStats);

productRoute.get(`/categoryStats`, categoryStats);

productRoute.get(`/allStats`, allStats);

export default productRoute;

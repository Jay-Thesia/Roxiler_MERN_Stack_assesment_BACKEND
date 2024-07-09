import { axiosInternal, axiosJP } from "@/configs/axios.config";
import Product from "@/models/Product.model";
import { logger } from "@logger";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data: productTransaction } = await axios.get(
      `https://s3.amazonaws.com/roxiler.com/product_transaction.json`,
      { headers: { Accept: "application/json" } }
    );

    for (const currProduct of productTransaction) {
      let { id, title, price, description, category, image, sold, dateOfSale } =
        currProduct;

      await Product.findOneAndUpdate(
        { productId: id },
        {
          productId: id,
          title,
          price: String(price),
          description,
          category,
          image,
          sold,
          dateOfSale,
        },
        { upsert: true, new: true }
      );
    }
    return res.send(`Product added to DB Succesfully.`);
  } catch (error) {
    logger.error(`Error in get products route ::: ${error}`);
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    search,
    priceMin,
    priceMax,
    page = 1,
    limit,
    month = 3,
  }: any = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let query: any = {};

  // if (month) {
  //   query.dateOfSale = { $month: 12 };
  // }
  if (search) {
    query = {
      $and: [
        {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, month],
          },
        },
        {
          $or: [
            {
              title: new RegExp(search, "i"),
            },
            { description: new RegExp(search, "i") },
            { price: new RegExp(`^${search}`, "i") },
          ],
        },
      ],
    };
  }
  console.log("🚀 ~ query:", query);

  if (priceMin && priceMax) {
    query.price = { $gte: priceMin, $lte: priceMax };
  } else if (priceMin) {
    query.price = { $gte: priceMin };
  } else if (priceMax) {
    query.price = { $lte: priceMax };
  }

  try {
    const transactions = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    const totalCount = transactions.length;

    res.json({
      transactions,
      currentPage: page,
      pageSize: limit,
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

export const getProductStat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const selectedMonth = Number(req.query.month) || 3;

    const totalSaleAmount: any = await Product.aggregate([
      {
        $match: {
          $and: [
            { $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] } },
            { sold: true },
          ],
        },
      },
      {
        $addFields: {
          priceNumeric: { $toDouble: "$price" },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$priceNumeric" },
        },
      },
    ]);
    console.log("🚀 ~ totalSaleAmount:", totalSaleAmount);

    const totalSoldItems = await Product.aggregate([
      {
        $match: {
          $and: [
            { $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] } },
            { sold: true },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
        },
      },
    ]);
    console.log("🚀 ~ totalSoldItems:", totalSoldItems);

    const totalNotSoldItems = await Product.aggregate([
      {
        $match: {
          $and: [
            { dateOfSale: { $exists: true } }, // Ensure dateOfSale exists
            { $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] } }, // Compare month part of dateOfSale
            { sold: false }, // Check if sold is false
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
        },
      },
    ]);
    console.log("🚀 ~ totalNotSoldItems:", totalNotSoldItems);

    res.json({
      totalSaleAmount:
        totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
      totalSoldItems:
        totalSoldItems.length > 0 ? totalSoldItems[0].totalItems : 0,
      totalNotSoldItems:
        totalNotSoldItems.length > 0 ? totalNotSoldItems[0].totalItems : 0,
    });
  } catch (error) {
    logger.error(`Error in getPRoductSat ::: ${error}`);
    next();
  }
};

export const barChartStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const selectedMonth: number = Number(req.query.month) || 3;

  try {
    const items = await Product.aggregate([
      {
        $match: {
          $and: [
            { $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] } },
          ],
        },
      },
      {
        $addFields: {
          priceNumeric: { $toDouble: "$price" },
        },
      },
      {
        $bucket: {
          groupBy: "$priceNumeric",
          boundaries: [
            0,
            101,
            201,
            301,
            401,
            501,
            601,
            701,
            801,
            901,
            Infinity,
          ],
          default: "901-above",
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          range: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const priceRanges = [
      { range: "0-100", count: 0 },
      { range: "101-200", count: 0 },
      { range: "201-300", count: 0 },
      { range: "301-400", count: 0 },
      { range: "401-500", count: 0 },
      { range: "501-600", count: 0 },
      { range: "601-700", count: 0 },
      { range: "701-800", count: 0 },
      { range: "801-900", count: 0 },
      { range: "901-above", count: 0 },
    ];

    items.forEach((item) => {
      const index = priceRanges.findIndex(
        (currRange) => currRange.range.split("-")[0] == item.range
      );
      if (index !== -1) {
        priceRanges[index].count = item.count;
      }
    });

    return res.status(200).send(priceRanges);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const categoryStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const selectedMonth: number = Number(req.query.month) || 3;

  const validCategories = [
    "electronics",
    "jewelery",
    "men's clothing",
    "women's clothing",
  ];

  try {
    const items = await Product.aggregate([
      {
        $match: {
          $and: [
            { $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] } },
            { category: { $in: validCategories } },
          ],
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json(items);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const allStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const selectedMonth: number = Number(req.query.month) || 3;
    let { data: getProductStat } = await axiosInternal.get(
      `/product/getProductStat`,
      { params: { month: selectedMonth } }
    );
    let { data: barChartStats } = await axiosInternal.get(
      `/product/barChartStats`,
      { params: { month: selectedMonth } }
    );

    let { data: categoryStats } = await axiosInternal.get(
      `/product/categoryStats`,
      { params: { month: selectedMonth } }
    );

    res.status(200).send({
      data: { getProductStat, barChartStats, categoryStats },
      message: `All stat are heere`,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

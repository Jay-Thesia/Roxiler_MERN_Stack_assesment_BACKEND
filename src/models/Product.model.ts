import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      require: true,
      unique: true,
    },
    title: {
      type: String,
    },
    price: {
      type: String,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    sold: {
      type: Boolean,
    },
    dateOfSale: {
      type: Date,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
const Product = mongoose.model("Products", productSchema);

export default Product;

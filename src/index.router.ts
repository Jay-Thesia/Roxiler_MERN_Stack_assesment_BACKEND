import express from 'express'

const router=express.Router();
import productRoute from "@modules/product/routes/product.routes"

router.use("/product",productRoute)

export default router
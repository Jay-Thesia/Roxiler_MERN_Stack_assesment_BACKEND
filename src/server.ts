import express, { Express, Request, Response } from "express";
import { PORT } from "./configs/env.config";
import router from "./index.router";
import { logger } from "@/configs/logger.config";
import cors from "cors";
import Product from "./models/Product.model";
import("@/configs/mongodb.config");
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));
app.use(router);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(PORT, async () => {
  logger.info(`[server]: Server is running at http://localhost:${PORT}`);
});

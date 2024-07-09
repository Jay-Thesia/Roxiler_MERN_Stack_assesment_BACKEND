import { logger } from "./logger.config";
import axios from "axios";
import { BASE_URL } from "./env.config";

export const axiosJP = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 3600,
});
export const axiosInternal = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 3600,
});

axiosJP.interceptors.request.use((request) => {
  logger.verbose(`Calling url ::: ${request.url}`);
  return request;
});

axiosInternal.interceptors.request.use((request) => {
  logger.verbose(`Calling internal url ::: ${request}`);
  return request;
});

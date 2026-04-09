import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes/index.js";
import { env } from "./config/env.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl.split(",").map((url) => url.trim()),
      credentials: false
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use("/api", apiRoutes);

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode ?? 500;
    res.status(statusCode).json({
      message: error.message ?? "Unexpected server error."
    });
  });

  return app;
};

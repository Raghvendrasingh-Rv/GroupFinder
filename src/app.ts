import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./common/middleware/notFoundHandler.js";
import { errorMiddleware } from "./common/middleware/error.middleware.js";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OK"
  });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorMiddleware);

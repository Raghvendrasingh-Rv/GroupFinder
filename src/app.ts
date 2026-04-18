import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./common/middleware/notFoundHandler.js";
import { errorMiddleware } from "./common/middleware/error.middleware.js";

export const app = express();

function normalizeOrigin(origin?: string | null) {
  return origin?.trim().replace(/\/$/, "");
}

const allowedOrigins = [
  env.FRONTEND_URL,
  env.CORS_ORIGIN,
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:8000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4000",
  "http://127.0.0.1:8000"
].map((origin) => normalizeOrigin(origin)).filter((origin): origin is string => Boolean(origin));

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
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

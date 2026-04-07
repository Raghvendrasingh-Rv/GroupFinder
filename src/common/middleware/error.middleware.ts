import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS, RESPONSE_MESSAGE } from "../utils/constants.js";
import { formatErrorResponse } from "../utils/responseFormatter.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error instanceof AppError ? error.message : RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR;

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(error);
  }

  res.status(statusCode).json(formatErrorResponse(message));
};

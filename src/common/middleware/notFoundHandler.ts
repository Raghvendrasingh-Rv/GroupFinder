import type { RequestHandler } from "express";
import { HTTP_STATUS, RESPONSE_MESSAGE } from "../utils/constants.js";
import { formatErrorResponse } from "../utils/responseFormatter.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(formatErrorResponse(RESPONSE_MESSAGE.ROUTE_NOT_FOUND));
};

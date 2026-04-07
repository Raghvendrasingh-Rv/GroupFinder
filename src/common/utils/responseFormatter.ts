import { RESPONSE_MESSAGE } from "./constants.js";

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

export function formatSuccessResponse<T>(data: T, message: string = RESPONSE_MESSAGE.SUCCESS): SuccessResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

export function formatErrorResponse(message: string = RESPONSE_MESSAGE.ERROR, errors?: unknown): ErrorResponse {
  const payload: ErrorResponse = {
    success: false,
    message
  };

  if (errors !== undefined) {
    payload.errors = errors;
  }

  return payload;
}

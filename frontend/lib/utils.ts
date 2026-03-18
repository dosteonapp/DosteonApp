import { clsx, type ClassValue } from "clsx";
import { FormikHelpers } from "formik";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleApiError(error: unknown): Error {
  if (error instanceof AxiosError) {
    // Check for API response with message or detail (FastAPI)
    const apiMessage = error.response?.data?.message || error.response?.data?.detail;

    if (apiMessage) return new Error(apiMessage);

    // Check for axios error message
    if (error.message) return new Error(error.message);
  }

  // Fallback error message
  return new Error("Something went wrong. Please try again later.");
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (!response || !response.success) {
    throw new Error(response.message || "An error occurred");
  }
  return response.data as T;
}

export function resetFormStatus<T>(helpers: FormikHelpers<T>) {
  helpers.setStatus(null);
}

/**
 * Formats user name as "First Name LastInitial."
 * e.g. "Test User" -> "Test U."
 */
export function formatUserName(firstName?: string, lastName?: string): string {
  if (!firstName) return "User";
  if (!lastName) return firstName;
  return `${firstName} ${lastName.charAt(0)}.`;
}

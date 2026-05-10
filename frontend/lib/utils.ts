import { clsx, type ClassValue } from "clsx";
import { FormikHelpers } from "formik";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleApiError(error: unknown): Error {
  if (error instanceof AxiosError) {
    // No response at all = device is offline or server unreachable
    if (!error.response) {
      return new Error("No internet connection – please check and try again.");
    }

    const apiMessage = error.response?.data?.message || error.response?.data?.detail;
    if (apiMessage) return new Error(apiMessage);

    if (error.message) return new Error(error.message);
  }

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

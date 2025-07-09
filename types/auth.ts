import { FormikHelpers } from "formik";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data?: {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface SignupValues {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  accountType: "restaurant" | "supplier";
}

export interface ForgotPasswordValues {
  email: string;
}

export interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
  code: string;
}

export interface AuthContextType {
  login: (
    values: LoginValues,
    helpers: FormikHelpers<LoginValues>
  ) => Promise<void>;
  signup: (
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>
  ) => Promise<void>;
  forgotPassword: (
    values: ForgotPasswordValues,
    helpers: FormikHelpers<ForgotPasswordValues>
  ) => Promise<void>;
  resetPassword: (
    values: ResetPasswordValues,
    helpers: FormikHelpers<ResetPasswordValues>
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPasswordData: { email?: string; selector?: string } | null;
  setResetPasswordData: (
    data: { email?: string; selector?: string } | null
  ) => void;
  authenticateWithGoogle: () => Promise<void>;
  authenticatingWithGoogle: boolean;
}

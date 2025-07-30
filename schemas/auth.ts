import * as Yup from "yup";

const passwordSchema = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[0-9]/, "Password must contain at least one number")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .required("Password is required");

const confirmPasswordSchema = Yup.string()
  .oneOf([Yup.ref("password")], "Passwords must match")
  .required("Confirm Password is required");

export const emailSchema = Yup.string()
  .email("Please enter a valid email")
  .required("Email is required");

export const SigninValidationSchema = Yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export const SignupValidationSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastname: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

export const ForgotPasswordValidationSchema = Yup.object().shape({
  email: emailSchema,
});

export const ResetPasswordValidationSchema = Yup.object().shape({
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  code: Yup.string().required("Reset code is required"),
});

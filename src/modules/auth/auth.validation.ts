import { z } from "zod";

const registerCustomerValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string({ error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must not exceed 30 characters"),
  }),
});

const verifyEmailValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase(),
    otp: z
      .string({ error: "OTP is required" })
      .length(2, "OTP must be exactly 6 digits")
   
  }),
});


const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string({ error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
  
  }),
});

export const AuthValidation = {
  registerCustomerValidationSchema,
  verifyEmailValidationSchema,
  loginValidationSchema
};
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
    // only these two roles can self-register (ADMIN can never be chosen here)
    role: z.enum(["CUSTOMER", "MECHANIC"]).optional(),
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
      .length(6, "OTP must be exactly 6 digits"),
  }),
});
const resendOtpSchema = z.object({
	body: z.object({
		email: z.string().email().toLowerCase(),
	}),
})

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase(),
    otp: z
      .string({ error: "OTP is required" })
      .length(6, "OTP must be exactly 6 digits"),
    newPassword: z
      .string({ error: "New password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must not exceed 30 characters"),
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
  resendOtpSchema,
  loginValidationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
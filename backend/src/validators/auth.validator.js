import { z } from 'zod';

export const registerSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "First name must be at least 2 characters.")
        .max(50, "First name cannot exceed 50 characters."),
    lastName: z
        .string()
        .trim()
        .min(1, "Last name is required.")
        .max(50, "Last name cannot exceed 50 characters."),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address."),
    phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(64, "Password cannot exceed 64 characters."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(64, "Password cannot exceed 64 characters.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
});

export  const loginSchema = z.object({
    identifier: z
      .string()
      .trim()
      .min(1, "Email or phone number is required."),
  
    password: z
      .string()
      .min(1, "Password is required."),
  });
  export const completeGoogleProfileSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Please enter a valid Indian mobile number."
        ),
});
/**
 * Auth Module - Zod Validation Schemas
 * REQ-AUTH-001 to REQ-AUTH-005
 */

import { z } from 'zod';

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Email validation
const emailSchema = z.string().email('Invalid email format').toLowerCase();

// Registration schema - REQ-AUTH-001
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

// Login schema - REQ-AUTH-002
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

// Logout schema - REQ-AUTH-004
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LogoutDTO = z.infer<typeof logoutSchema>;

// Forgot password schema - REQ-AUTH-003
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

// Reset password schema - REQ-AUTH-003
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

// Refresh token schema - REQ-AUTH-002
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

// Verify email schema - REQ-AUTH-001
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;

// Validation middleware helper
export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    return schema.parse(data);
  };
};

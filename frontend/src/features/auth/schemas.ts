import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Невірна електронна пошта"),
  password: z.string().min(1, "Пароль є обов’язковим"),
  rememberMe: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Ім’я є обов’язковим"),
  email: z.string().email("Невірна електронна пошта"),
  password: z.string().min(1, "Пароль має містити хоча б 1 символ"),
  rememberMe: z.boolean(),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Невірна електронна пошта"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string().min(1, "Підтвердіть пароль"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;


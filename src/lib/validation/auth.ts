import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\+996[0-9]{9}$/, "Формат: +996 и 9 цифр");

export const otpSchema = z
  .string()
  .regex(/^[0-9]{6}$/, "6 цифр из Telegram");

export const passwordSchema = z
  .string()
  .min(8, "Минимум 8 символов")
  .regex(/[0-9]/, "Хотя бы 1 цифра");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(50, "Максимум 50 символов");

export const languageSchema = z.enum(["ru", "kg"]);

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Введите пароль"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: nameSchema,
  language: languageSchema,
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const setPasswordSchema = z.object({
  password: passwordSchema,
});
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

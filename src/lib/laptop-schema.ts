import { z } from "zod";

const CATEGORY_VALUES = ["Ultra Gaming", "Mid-Range", "Budget"] as const;

// Strip control chars / angle brackets so nothing stored can ever be interpreted
// as markup if it is later rendered somewhere less strict than React.
export function sanitizeText(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

const safeText = (label: string, max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(1, `${label} is required`)
        .max(max, `${label} must be under ${max} characters`),
    );

// Only http(s) images — blocks javascript:, data: and other injection vectors.
const imageUrl = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().url("Image URL must be a valid link").max(2048))
  .refine((v) => /^https?:\/\//i.test(v), "Image URL must start with http:// or https://");

export const laptopSchema = z.object({
  model: safeText("Model name", 120),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .pipe(
      z
        .number()
        .min(0, "Price cannot be negative")
        .max(1_000_000, "Price is unrealistically high")
        .refine(Number.isFinite, "Price must be a number"),
    ),

  image_url: imageUrl,
  category: z.enum(CATEGORY_VALUES, { errorMap: () => ({ message: "Invalid category" }) }),
  cpu: safeText("CPU", 120),
  gpu: safeText("GPU", 120),
  ram: safeText("RAM", 60),
  storage: safeText("Storage", 60),
});

export type LaptopInput = z.infer<typeof laptopSchema>;

export function safeImageUrl(value: string | null | undefined) {
  if (!value) return "";
  return /^https?:\/\//i.test(value.trim()) ? value.trim() : "";
}

// Never surface raw backend/network internals to end users.
export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again.") {
  const raw = error instanceof Error ? error.message : "";
  if (/row-level security|permission denied|not authorized|jwt|403/i.test(raw)) {
    return "You are not authorized to perform this action.";
  }
  if (/duplicate key|unique constraint/i.test(raw)) return "That item already exists.";
  if (/failed to fetch|network|timeout|offline/i.test(raw)) {
    return "Connection problem. Check your internet and try again.";
  }
  if (/invalid login credentials/i.test(raw)) return "Incorrect email or password.";
  if (/email rate limit|too many/i.test(raw)) return "Too many attempts. Please wait a moment.";
  return fallback;
}

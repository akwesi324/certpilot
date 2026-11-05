import { z } from "zod";

/** bcrypt only uses the first 72 bytes, so longer (or multi-byte) passwords are refused. */
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((p) => Buffer.byteLength(p, "utf8") <= 72, "Password is too long (at most 72 bytes)");

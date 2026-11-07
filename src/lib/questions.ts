import { createHash } from "crypto";

export const OPTION_KEYS = ["A", "B", "C", "D"] as const;

/** Stable fingerprint of a question, so the same stem and options are never stored twice. */
export function contentHash(stem: string, options: Record<string, string>): string {
  return createHash("sha256")
    .update(JSON.stringify([stem.trim(), OPTION_KEYS.map((k) => options[k].trim())]))
    .digest("hex");
}

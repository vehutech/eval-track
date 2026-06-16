import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatScore(score: number) {
  return score.toFixed(2);
}

export function scoreVariant(score: number): "destructive" | "warning" | "success" {
  if (score < 3.0) return "destructive";
  if (score < 4.0) return "warning";
  return "success";
}

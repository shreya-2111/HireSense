import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatScore(score) {
  if (score >= 85) return { label: "Strong Match", variant: "strong", color: "emerald" };
  if (score >= 70) return { label: "Good Match", variant: "good", color: "blue" };
  if (score >= 55) return { label: "Potential Match", variant: "potential", color: "amber" };
  return { label: "Low Match", variant: "low", color: "slate" };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

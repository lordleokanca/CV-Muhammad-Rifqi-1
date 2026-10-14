import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Prefixes a file in /public with the site's base path (needed on GitHub Pages). */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

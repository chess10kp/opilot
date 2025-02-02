import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from "fs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



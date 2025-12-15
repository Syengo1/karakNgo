import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// THE MONEY MAKER: Robust Phone Number Formatter
export function formatPhoneNumberForMpesa(phone: string): string | null {
  // 1. Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // 2. Handle 07... or 01... (Standard Kenya)
  if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
    return '254' + cleaned.substring(1);
  }

  // 3. Handle 254... (Already formatted)
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned;
  }
  
  // 4. Handle 7... or 1... (Missing leading zero)
  if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    return '254' + cleaned;
  }

  // Invalid number
  return null;
}
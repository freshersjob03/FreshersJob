import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

export function formatJobLocation(job) {
  const city = String(job?.city || '').trim();
  const state = String(job?.state || '').trim();
  const combined = [city, state].filter(Boolean).join(', ');
  if (combined) return combined;

  const legacy = String(job?.location || '').trim();
  return legacy;
}

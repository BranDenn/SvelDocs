import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function escapeRegex(input: string): string {
	return input.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

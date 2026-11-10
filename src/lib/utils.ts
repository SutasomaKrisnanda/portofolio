import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves static asset paths accurately across local development, custom domains,
 * and GitHub Pages subpaths (e.g. /<repo-name>/models/...).
 */
export function getAssetPath(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // 1. Build-time base path from environment
  const envBase = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');
  if (envBase) {
    return `${envBase}/${cleanPath}`;
  }

  // 2. Runtime detection in browser for GitHub Pages (username.github.io/repo-name/...)
  if (typeof window !== 'undefined') {
    const { hostname, pathname } = window.location;
    if (hostname.endsWith('.github.io')) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        return `/${segments[0]}/${cleanPath}`;
      }
    }
  }

  return `/${cleanPath}`;
}


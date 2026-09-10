import { server, IMAGE_BASE_URL } from '../config/index.js';

/**
 * Strips domain / full URL origin and returns only the relative path (e.g. "/uploads/menu/xyz.jpg").
 * Useful when storing image paths in the backend database.
 */
export const cleanRelativeImagePath = (path) => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlObj = new URL(trimmed);
      return urlObj.pathname;
    }
  } catch (e) {
    const match = trimmed.replace(/^https?:\/\/[^/]+/, '');
    if (match) return match.startsWith('/') ? match : `/${match}`;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

/**
 * Resolves an image path to a full URL for display in <img> tags.
 * Handles both relative paths ("/uploads/...") and full URLs ("http://...").
 */
export const getImageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (cleanPath.startsWith('/public') || cleanPath.startsWith('/uploads')) {
    return `${server}${cleanPath}`;
  }

  const base = IMAGE_BASE_URL ? IMAGE_BASE_URL.replace(/\/public$/, '') : server;
  return `${base}${cleanPath}`;
};

export default {
  cleanRelativeImagePath,
  getImageUrl
};

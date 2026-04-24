/**
 * Optimizes Unsplash URLs by appending size and quality parameters.
 * @param {string} url - The original Unsplash URL.
 * @param {number} width - The desired width (default 400).
 * @param {number} quality - The desired quality (default 80).
 * @returns {string} - The optimized URL.
 */
export const getOptimizedImageUrl = (url, width = 400, quality = 80) => {
  if (!url || !url.includes('images.unsplash.com')) return url;
  
  try {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  } catch (e) {
    return url;
  }
};

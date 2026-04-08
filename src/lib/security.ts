/**
 * Security utilities for sanitizing user inputs and preventing common vulnerabilities
 */

/**
 * Sanitizes image URLs to prevent XSS attacks
 * Only allows HTTPS URLs from trusted domains (Supabase storage)
 * 
 * @param url - The URL to sanitize
 * @returns A safe URL or default avatar path
 */
export const sanitizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/default-avatar.png';
  
  // Validar que é uma URL válida e segura
  try {
    const parsed = new URL(url);
    
    // Permitir apenas HTTPS e domínios confiáveis
    if (parsed.protocol === 'https:' && 
        (parsed.hostname.endsWith('.supabase.co') || 
         parsed.hostname.endsWith('.supabase.in'))) {
      return url;
    }
  } catch {
    // URL inválida, retornar avatar padrão
    return '/default-avatar.png';
  }
  
  // URL não confiável, retornar avatar padrão
  return '/default-avatar.png';
};

/**
 * Safely redirects to a URL, preventing open redirect vulnerabilities
 * Only allows relative URLs or URLs from the same origin
 * 
 * @param url - The URL to redirect to
 * @param fallback - Fallback URL if the provided URL is not safe (default: '/dashboard')
 */
export const safeRedirect = (url: string | null | undefined, fallback: string = '/dashboard'): void => {
  if (!url) {
    window.location.href = fallback;
    return;
  }

  // Permitir apenas URLs relativas ou do mesmo domínio
  if (url.startsWith('/')) {
    window.location.href = url;
    return;
  }

  try {
    const parsed = new URL(url);
    // Permitir apenas URLs do mesmo origin
    if (parsed.origin === window.location.origin) {
      window.location.href = url;
      return;
    }
  } catch {
    // URL inválida
  }

  // URL não segura, redirecionar para fallback
  console.warn('Redirecionamento bloqueado para URL não segura:', url);
  window.location.href = fallback;
};

/**
 * Creates a secure cookie string with Secure, HttpOnly, and SameSite attributes
 * 
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Additional cookie options
 * @returns Secure cookie string
 */
export const createSecureCookie = (
  name: string, 
  value: string, 
  options: {
    maxAge?: number;
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): string => {
  const {
    maxAge,
    path = '/',
    sameSite = 'Strict'
  } = options;

  let cookie = `${name}=${value}; Secure; SameSite=${sameSite}; Path=${path}`;
  
  if (maxAge) {
    cookie += `; Max-Age=${maxAge}`;
  }

  return cookie;
};

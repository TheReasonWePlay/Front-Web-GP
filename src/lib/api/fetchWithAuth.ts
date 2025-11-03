import { API_CONFIG } from './config';

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      console.error('Erreur lors du refresh token :', response.statusText);
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    if (newAccessToken && newRefreshToken) {
      localStorage.setItem('access_token', newAccessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      return newAccessToken;
    }

    return null;
  } catch (err) {
    console.error('Erreur réseau lors du refresh token :', err);
    return null;
  }
}

/**
 * Wrapper around fetch() that automatically refreshes the token on 401
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('access_token');

  // Première tentative
  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Si token expiré
  if (response.status === 401) {
    console.warn('Token expiré, tentative de rafraîchissement...');
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      console.error('Impossible de rafraîchir le token. Redirection vers /login');
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    // Retenter la requête avec le nouveau token
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${newAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return response;
}

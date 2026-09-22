export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function getRefreshTokenExpiry () {
  return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS).toISOString();
}
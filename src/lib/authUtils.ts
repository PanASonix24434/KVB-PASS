/**
 * Password hashing utilities using Web Crypto API.
 * Uses SHA-256 with salt (ic_number) for basic security.
 */

export async function hashPassword(password: string, salt?: string): Promise<string> {
  const encoder = new TextEncoder();
  const salted = salt ? `${password}${salt}` : password;
  const data = encoder.encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  salt?: string
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}

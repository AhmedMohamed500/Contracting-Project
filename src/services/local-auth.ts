import type { ErpUser } from "@/types/erp";

const DEFAULT_ITERATIONS = 120_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

export function validatePrototypePassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z\u0600-\u06ff]/.test(password) && /\d/.test(password);
}

export async function createPasswordCredential(password: string): Promise<{ passwordHash: string; passwordSalt: string; passwordIterations: number }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { passwordHash: await derivePassword(password, salt, DEFAULT_ITERATIONS), passwordSalt: bytesToBase64(salt), passwordIterations: DEFAULT_ITERATIONS };
}

export async function verifyPassword(password: string, user: Pick<ErpUser, "passwordHash" | "passwordSalt" | "passwordIterations">): Promise<boolean> {
  const candidate = await derivePassword(password, base64ToBytes(user.passwordSalt), user.passwordIterations);
  if (candidate.length !== user.passwordHash.length) return false;
  let difference = 0;
  for (let index = 0; index < candidate.length; index += 1) difference |= candidate.charCodeAt(index) ^ user.passwordHash.charCodeAt(index);
  return difference === 0;
}

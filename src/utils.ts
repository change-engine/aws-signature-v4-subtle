import { subtle } from 'crypto';

export async function verifyHmac(data: string, secret: string, signature: string): Promise<boolean> {
  return await subtle.verify(
    'HMAC',
    await subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
      'verify',
    ]),
    new TextEncoder().encode(signature.substring(3)),
    new TextEncoder().encode(data),
  );
}

export async function createHmac(data: string | Uint8Array, secret: string | Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(
    await subtle.sign(
      'HMAC',
      await subtle.importKey(
        'raw',
        secret instanceof Uint8Array ? secret : new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      ),
      data instanceof Uint8Array ? data : new TextEncoder().encode(data),
    ),
  );
}

export async function createHash(data: string): Promise<string> {
  const text = new TextEncoder().encode(data);
  const digest = await subtle.digest({ name: 'SHA-256' }, text);
  return toHex(new Uint8Array(digest));
}

export function toHex(data: Uint8Array): string {
  return [...data].map((b) => b.toString(16).padStart(2, '0')).join('');
}

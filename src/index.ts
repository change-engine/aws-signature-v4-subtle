// https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html

import { BodyAndAuth, Config, Request } from './types';
import { createHash, createHmac, toHex } from './utils';

// https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
// > Each path segment must be URI-encoded twice (except for Amazon S3 which
// > only gets URI-encoded once). ... do not normalize URI paths for requests
// > to Amazon S3.
function makeCanonicalUri(path: string, isS3: boolean): string {
  const uriPath = path || '/';
  return isS3 ? encodeURI(uriPath) : encodeURI(encodeURI(uriPath.replace(/\/+/g, '/')));
}

function makeCanonicalQuery(query: string): string {
  return (query || '').split('&').sort().join('&');
}

function makeCanonicalHeaderValues(headerKeys: string[], headers: { [key: string]: string }): string {
  return (
    headerKeys
      .map((key) => `${key.toLowerCase().trim()}:${headers[key].trim().replace(/ +/g, ' ')}`)
      .sort()
      .join('\n') + '\n'
  );
}

function makeCanonicalHeaderKeyList(headerKeys: string[]): string {
  return headerKeys
    .map((key) => key.toLowerCase())
    .sort()
    .join(';');
}

function getFormattedDate(): string {
  return new Date()
    .toISOString()
    .replace(/[:-]/g, '')
    .replace(/\.\d\d\dZ/, 'Z');
}

async function hmacSignature(secret: string, values: string[], data: string): Promise<string> {
  let signingKey = new TextEncoder().encode(`AWS4${secret}`);

  for (const value of values) {
    signingKey = await createHmac(value, signingKey);
  }

  return toHex(await createHmac(data, signingKey));
}

export async function createCanonicalRequest(config: Config, request: Request): Promise<BodyAndAuth> {
  const { search, pathname } = new URL(request.url);

  if (!request.headers['X-Amz-Date']) {
    request.headers['X-Amz-Date'] = getFormattedDate();
  }

  const signableHeaderKeys = Object.keys(request.headers);
  const canonicalHeaderKeyList = makeCanonicalHeaderKeyList(signableHeaderKeys);

  const canonicalRequest = [
    request.method || (request.body ? 'POST' : 'GET'),
    makeCanonicalUri(pathname, config.service === 's3'),
    makeCanonicalQuery(search.replace(/^\?/, '')),
    makeCanonicalHeaderValues(signableHeaderKeys, request.headers),
    canonicalHeaderKeyList,
    await createHash(request.body),
  ];

  const hashedCanonicalRequest = await createHash(canonicalRequest.join('\n'));

  const signingValues = [request.headers['X-Amz-Date'].split('T')[0], config.region, config.service, 'aws4_request'];
  const credentialScope = signingValues.join('/');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    request.headers['X-Amz-Date'],
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  const signature = await hmacSignature(config.accessKeySecret, signingValues, stringToSign);

  return {
    body: request.body,
    authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${canonicalHeaderKeyList}, Signature=${signature}`,
  };
}

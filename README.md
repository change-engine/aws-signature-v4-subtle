# aws-signature-v4-subtle

Sign requests to AWS with their Version 4 Signature algorithm. Uses only `crypto.subtle`.

# Usage

## To retrieve a Secret from Secrets Manager:

```typescript
const { authorization, body } = await createCanonicalRequest(
  {
    service: 'secretsmanager',
    region: 'us-west-1',
    accessKeyId: '<Access Key ID>',
    accessKeySecret: '<Access Key Secret>',
  },
  {
    url: 'https://secretsmanager.us-west-1.amazonaws.com',
    method: 'POST',
    headers: {
      'content-type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'secretsmanager.GetSecretValue',
      Host: 'secretsmanager.us-west-1.amazonaws.com',
    },
    body: JSON.stringify({ SecretId: 'SOME_SECRET_ID' }),
  },
);

const { url, ...rest } = request;

const response = await fetch(url, {
  ...rest,
  headers: { ...request.headers, Authorization: authorization },
  body,
});
```

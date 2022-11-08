# aws-signature-v4-subtle

Sign requests to AWS with their Version 4 Signature algorithm. Uses only `crypto.subtle`.

# Usage

## To retrieve a Secret from Secrets Manager:

```typescript
const response = await fetch(
  ...(await AwsToFetch(
    {
      AWS_REGION: 'us-west-1',
      AWS_ACCESS_KEY_ID: '<Access Key ID>',
      AWS_SECRET_ACCESS_KEY: '<Access Key Secret>',
    },
    'secretsmanager',
    'POST',
    {
      'content-type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'secretsmanager.GetSecretValue',
    },
    JSON.stringify({
      SecretId: `SLACK_SIGNING_SECRET_${accountId}`,
    }),
  )),
);
if (!response.ok) throw new Error('Error talking to AWS');
const secret = (await response.json<{ SecretString: string }>()).SecretString;
```

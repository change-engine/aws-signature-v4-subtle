import { jest } from '@jest/globals';
import { createCanonicalRequest } from '../src/index';

beforeAll(() => {
  // Lock Time
  jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => '2022-11-08T12:11:45.949Z');
});

afterAll(() => {
  // Unlock Time
  jest.resetAllMocks();
});

test('createCanonicalRequest', async () => {
  expect(
    await createCanonicalRequest(
      {
        service: 'secretsmanager',
        region: 'fake-region',
        accessKeyId: '<Access Key ID>',
        accessKeySecret: '<Access Key Secret>',
      },
      {
        url: 'https://secretsmanager.fake-region.example.com',
        method: 'POST',
        headers: {
          'content-type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'secretsmanager.GetSecretValue',
          Host: 'secretsmanager.fake-region.example.com',
        },
        body: JSON.stringify({ SecretId: 'SOME_SECRET_ID' }),
      },
    ),
  ).toStrictEqual({
    body: JSON.stringify({ SecretId: 'SOME_SECRET_ID' }),
    authorization:
      'AWS4-HMAC-SHA256 Credential=<Access Key ID>/' +
      '20221108/fake-region/secretsmanager/aws4_request, ' +
      'SignedHeaders=content-type;host;x-amz-date;x-amz-target, ' +
      'Signature=a675b5568a3474fb0590ef5a7c365199873a490a685fc6f9627d4cd4448719c7',
  });
});

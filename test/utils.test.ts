import { createHash, createHmac, toHex } from '../src/utils';

test('createHmac', async () => {
  expect(toHex(await createHmac('Some Data', 'Some Secret'))).toBe(
    '456cd94107ef2a93831cb7a4e4893852abd54b1d10c7e8de50fccf478f8d52a5',
  );
});

test('createHmac with Uint8Array', async () => {
  expect(toHex(await createHmac(await createHmac('Some Data', 'Some Secret'), 'Some Secret'))).toBe(
    '2cde8816a47b3daa9471e402a078896d5fe0281c78930e4f1959a8e0331237f6',
  );
});

test('createHash', async () => {
  expect(await createHash('Some Data')).toBe('2d27ec8437ec76ec2db484c98ed89f7793f0575e271518dd1d62a18fde6e202d');
});

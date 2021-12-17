import { ProviderFailure, WalletProvider } from '@cardano-sdk/core';
import { Sdk } from '../../src/sdk';
import { createGraphQLWalletProviderFromSdk } from '../../src/WalletProvider/CardanoGraphQLWalletProvider';

// eslint-disable-next-line sonarjs/no-duplicate-string
jest.mock('../../src/util', () => {
  const actual = jest.requireActual('../../src/util');
  return {
    ...actual,
    getExactlyOneObject: jest.fn().mockImplementation((...args) => actual.getExactlyOneObject(...args))
  };
});
const { getExactlyOneObject } = jest.requireMock('../../src/util');

describe('CardanoGraphQLWalletProvider.ledgerTip', () => {
  let provider: WalletProvider;
  const sdk = { Tip: jest.fn() };
  const tip = {
    blockNo: 1,
    hash: '6804edf9712d2b619edb6ac86861fe93a730693183a262b165fcc1ba1bc99cad',
    slot: { number: 2 }
  };

  beforeEach(() => (provider = createGraphQLWalletProviderFromSdk(sdk as unknown as Sdk)));
  afterEach(() => {
    sdk.Tip.mockReset();
    getExactlyOneObject.mockClear();
  });

  it('makes a graphql query and coerces result to core types', async () => {
    sdk.Tip.mockResolvedValueOnce({
      queryBlock: [tip]
    });
    expect(await provider.ledgerTip()).toEqual({
      blockNo: tip.blockNo,
      hash: tip.hash,
      slot: tip.slot.number
    });
  });

  it('uses util.getExactlyOneObject to validate response', async () => {
    sdk.Tip.mockResolvedValueOnce({});
    await expect(provider.ledgerTip()).rejects.toThrow(ProviderFailure.NotFound);
    expect(getExactlyOneObject).toBeCalledTimes(1);
  });
});

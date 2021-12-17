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

describe('CardanoGraphQLWalletProvider.currentWalletProtocolParameters', () => {
  let provider: WalletProvider;
  const sdk = { CurrentProtocolParameters: jest.fn() };
  const protocolParameters = {
    __typename: 'ProtocolParametersAlonzo',
    coinsPerUtxoWord: 34_482,
    maxCollateralInputs: 3,
    maxTxSize: 16_384,
    maxValueSize: 5000,
    minFeeCoefficient: 44,
    minFeeConstant: 155_381,
    minPoolCost: 340_000_000,
    poolDeposit: 500_000_000,
    protocolVersion: {
      major: 4,
      minor: 0,
      patch: 1
    },
    stakeKeyDeposit: 2_000_000
  };

  beforeEach(() => (provider = createGraphQLWalletProviderFromSdk(sdk as unknown as Sdk)));
  afterEach(() => {
    sdk.CurrentProtocolParameters.mockReset();
    getExactlyOneObject.mockClear();
  });

  it('makes a graphql query and coerces result to core types', async () => {
    sdk.CurrentProtocolParameters.mockResolvedValueOnce({
      queryProtocolVersion: [{ protocolParameters }]
    });
    expect(await provider.currentWalletProtocolParameters()).toEqual({
      coinsPerUtxoWord: protocolParameters.coinsPerUtxoWord,
      maxCollateralInputs: protocolParameters.maxCollateralInputs,
      maxTxSize: protocolParameters.maxTxSize,
      maxValueSize: protocolParameters.maxValueSize,
      minFeeCoefficient: protocolParameters.minFeeCoefficient,
      minFeeConstant: protocolParameters.minFeeConstant,
      minPoolCost: protocolParameters.minPoolCost,
      poolDeposit: protocolParameters.poolDeposit,
      protocolVersion: protocolParameters.protocolVersion,
      stakeKeyDeposit: protocolParameters.stakeKeyDeposit
    });
  });

  it('uses util.getExactlyOneObject to validate response', async () => {
    sdk.CurrentProtocolParameters.mockResolvedValueOnce({});
    await expect(provider.currentWalletProtocolParameters()).rejects.toThrow(ProviderFailure.NotFound);
    expect(getExactlyOneObject).toBeCalledTimes(1);
  });

  it('throws if latest parameters are not Alonzo', async () => {
    sdk.CurrentProtocolParameters.mockResolvedValueOnce({
      queryProtocolVersion: [{ protocolParameters: { ...protocolParameters, __typename: 'ProtocolParametersShelley' } }]
    });
    await expect(provider.currentWalletProtocolParameters()).rejects.toThrow(ProviderFailure.NotFound);
    expect(getExactlyOneObject).toBeCalledTimes(1);
  });
});

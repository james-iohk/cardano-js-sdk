import { Cardano, ProviderFailure, WalletProvider } from '@cardano-sdk/core';
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

describe('CardanoGraphQLWalletProvider.genesisParameters', () => {
  let provider: WalletProvider;
  const sdk = { GenesisParameters: jest.fn() };
  const networkConstants = {
    activeSlotsCoefficient: 0.05,
    maxKESEvolutions: 62,
    networkMagic: 764_824_073,
    securityParameter: 2160,
    slotsPerKESPeriod: 129_600,
    systemStart: '2017-09-23T21:44:51.000Z',
    updateQuorum: 5
  };
  const timeSettings = {
    epochLength: 100_000,
    slotLength: 1
  };
  const ada = {
    supply: { max: 100_000_000n }
  };

  beforeEach(() => (provider = createGraphQLWalletProviderFromSdk(sdk as unknown as Sdk)));
  afterEach(() => {
    sdk.GenesisParameters.mockReset();
    getExactlyOneObject.mockClear();
  });

  it('makes a graphql query and coerces result to core types', async () => {
    sdk.GenesisParameters.mockResolvedValueOnce({
      queryAda: [ada],
      queryNetworkConstants: [networkConstants],
      queryTimeSettings: [timeSettings]
    });
    expect(await provider.genesisParameters()).toEqual({
      activeSlotsCoefficient: networkConstants.activeSlotsCoefficient,
      epochLength: timeSettings.epochLength,
      maxKesEvolutions: networkConstants.maxKESEvolutions,
      maxLovelaceSupply: BigInt(ada.supply.max),
      networkMagic: networkConstants.networkMagic,
      securityParameter: networkConstants.securityParameter,
      slotLength: timeSettings.slotLength,
      slotsPerKesPeriod: networkConstants.slotsPerKESPeriod,
      systemStart: new Date(networkConstants.systemStart),
      updateQuorum: networkConstants.updateQuorum
    } as Cardano.CompactGenesis);
  });

  // eslint-disable-next-line sonarjs/no-identical-functions
  it('uses util.getExactlyOneObject to validate response', async () => {
    sdk.GenesisParameters.mockResolvedValueOnce({});
    await expect(provider.genesisParameters()).rejects.toThrow(ProviderFailure.NotFound);
    expect(getExactlyOneObject).toBeCalledTimes(1);
  });
});

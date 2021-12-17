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

describe('CardanoGraphQLWalletProvider.networkInfo', () => {
  let provider: WalletProvider;
  const sdk = { NetworkInfo: jest.fn() };
  const block = {
    epoch: {
      activeStakeAggregate: {
        quantitySum: 300_000n
      },
      number: 123,
      startedAt: {
        date: '2021-12-16T16:25:03.994Z'
      }
    },
    totalLiveStake: 100_000_000n
  };
  const timeSettings = {
    epochLength: 60 * 60,
    slotLength: 1
  };
  const ada = {
    supply: { circulating: 10_000_000n, max: 100_000_000n, total: 20_000_000n }
  };

  beforeEach(() => (provider = createGraphQLWalletProviderFromSdk(sdk as unknown as Sdk)));
  afterEach(() => {
    sdk.NetworkInfo.mockReset();
    getExactlyOneObject.mockClear();
  });

  it('makes a graphql query and coerces result to core types', async () => {
    sdk.NetworkInfo.mockResolvedValueOnce({
      queryAda: [ada],
      queryBlock: [block],
      queryTimeSettings: [timeSettings]
    });
    expect(await provider.networkInfo()).toEqual({
      currentEpoch: {
        end: { date: new Date('2021-12-16T17:25:03.994Z') },
        number: block.epoch.number,
        start: { date: new Date(block.epoch.startedAt.date) }
      },
      lovelaceSupply: {
        circulating: BigInt(ada.supply.circulating),
        max: BigInt(ada.supply.max),
        total: BigInt(ada.supply.total)
      },
      stake: {
        active: block.epoch.activeStakeAggregate.quantitySum,
        live: block.totalLiveStake
      }
    });
  });

  it('throws if active stake is null', async () => {
    sdk.NetworkInfo.mockResolvedValueOnce({
      queryAda: [ada],
      queryBlock: [{ ...block, epoch: { ...block.epoch, activeStakeAggregate: null } }],
      queryTimeSettings: [timeSettings]
    });
    await expect(provider.networkInfo()).rejects.toThrow(ProviderFailure.InvalidResponse);
  });

  it('uses util.getExactlyOneObject to validate response', async () => {
    sdk.NetworkInfo.mockResolvedValueOnce({});
    await expect(provider.networkInfo()).rejects.toThrow(ProviderFailure.NotFound);
    expect(getExactlyOneObject).toBeCalledTimes(1);
  });
});

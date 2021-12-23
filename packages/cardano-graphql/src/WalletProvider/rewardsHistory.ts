import { WalletProvider } from '@cardano-sdk/core';
import { WalletProviderFnProps } from './WalletProviderFnProps';

export const rewardsHistoryProvider =
  ({ sdk, getExactlyOneObject }: WalletProviderFnProps): WalletProvider['rewardsHistory'] =>
  async ({ stakeAddresses, epochs }) => {
    sdk;
    getExactlyOneObject;
    stakeAddresses;
    epochs;
    throw new Error('TODO: not implemented');
  };

import { ProviderFromSdk, createProvider, getExactlyOneObject } from '../util';
import { WalletProvider } from '@cardano-sdk/core';
import { currentWalletProtocolParametersProvider } from './currentWalletProtocolParameters';
import { genesisParametersProvider } from './genesisParameters';
import { ledgerTipProvider } from './ledgerTip';
import { networkInfoProvider } from './networkInfo';
import { queryBlocksByHashesProvider } from './queryBlocksByHashes';
import { queryTransactionsByAddressesProvider, queryTransactionsByHashesProvider } from './queryTransactions';

export const createGraphQLWalletProviderFromSdk: ProviderFromSdk<WalletProvider> = (sdk) => {
  const fnProps = { getExactlyOneObject, sdk };
  return {
    currentWalletProtocolParameters: currentWalletProtocolParametersProvider(fnProps),
    genesisParameters: genesisParametersProvider(fnProps),
    ledgerTip: ledgerTipProvider(fnProps),
    networkInfo: networkInfoProvider(fnProps),
    queryBlocksByHashes: queryBlocksByHashesProvider(fnProps),
    queryTransactionsByAddresses: queryTransactionsByAddressesProvider(fnProps),
    queryTransactionsByHashes: queryTransactionsByHashesProvider(fnProps)
  } as WalletProvider;
};

export const createGraphQLWalletProvider = createProvider<WalletProvider>(createGraphQLWalletProviderFromSdk);
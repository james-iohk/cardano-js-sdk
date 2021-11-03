import { Cardano } from '@cardano-sdk/core';
import { CertificateType } from '@cardano-sdk/core/src/Cardano';
import { KeyManagement, SingleAddressWallet, SingleAddressWalletProps, TransactionFailure } from '../../src';
import { firstValueFrom } from 'rxjs';
import { providerStub } from '../mocks';

const walletProps: SingleAddressWalletProps = { name: 'some-wallet' };
const networkId = Cardano.NetworkId.mainnet;
const mnemonicWords = KeyManagement.util.generateMnemonicWords();
const password = 'your_password';

describe('integration/withdrawal', () => {
  let keyManager: KeyManagement.KeyManager;
  let wallet: SingleAddressWallet;

  beforeAll(async () => {
    keyManager = KeyManagement.createInMemoryKeyManager({ mnemonicWords, networkId, password });
    const walletProvider = providerStub();
    wallet = new SingleAddressWallet(walletProps, {
      keyManager,
      walletProvider
    });
  });

  it('has balance', async () => {
    await firstValueFrom(wallet.balance.total$);
    expect(typeof wallet.balance.total$.value?.coins).toBe('bigint');
    expect(typeof wallet.balance.available$.value?.rewards).toBe('bigint');
  });

  it('can submit transaction', async () => {
    await firstValueFrom(wallet.balance.available$);
    const availableRewards = wallet.balance.available$.value!.rewards;

    const txInternals = await wallet.initializeTx({
      certificates: [{ __typename: CertificateType.StakeDeregistration, address: keyManager.stakeKey.to_bech32() }],
      outputs: new Set(), // In a real transaction you would probably want to have some outputs
      withdrawals: [{ address: wallet.addresses[0], quantity: availableRewards }]
    });
    expect(typeof txInternals.body.fee).toBe('bigint');
    const tx = await wallet.finalizeTx(txInternals);

    const confirmedSubscription = wallet.transactions.outgoing.confirmed$.subscribe((confirmedTx) => {
      if (confirmedTx === tx) {
        // Transaction successful
      }
    });

    const failedSubscription = wallet.transactions.outgoing.failed$.subscribe(({ tx: failedTx, reason }) => {
      if (failedTx === tx) {
        // Transaction failed because of reason, which is most likely:
        expect(reason === TransactionFailure.Timeout || reason === TransactionFailure.FailedToSubmit).toBe(true);
      }
    });

    try {
      await wallet.submitTx(tx);
    } catch {
      // Failed to submit transaction
    }

    // Cleanup
    confirmedSubscription.unsubscribe();
    failedSubscription.unsubscribe();
    wallet.shutdown();
  });
});

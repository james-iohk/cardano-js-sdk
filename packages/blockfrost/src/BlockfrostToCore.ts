import { Cardano, ProtocolParametersRequiredByWallet } from '@cardano-sdk/core';
import { Responses } from '@blockfrost/blockfrost-js';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type BlockfrostAddressUtxoContent = Responses['address_utxo_content'];
type BlockfrostInputs = Responses['tx_content_utxo']['inputs'];
type BlockfrostInput = Pick<Unpacked<BlockfrostInputs>, 'address' | 'amount' | 'output_index' | 'tx_hash'>;
type BlockfrostOutputs = Responses['tx_content_utxo']['outputs'];
type BlockfrostOutput = Unpacked<BlockfrostOutputs>;
type BlockfrostUtxo = Unpacked<BlockfrostAddressUtxoContent>;

export const BlockfrostToCore = {
  addressUtxoContent: (address: string, blockfrost: Responses['address_utxo_content']): Cardano.Utxo[] =>
    blockfrost.map((utxo) => [
      BlockfrostToCore.txIn(BlockfrostToCore.inputFromUtxo(address, utxo)),
      BlockfrostToCore.txOut(BlockfrostToCore.outputFromUtxo(address, utxo))
    ]) as Cardano.Utxo[],

  blockToTip: (block: Responses['block_content']): Cardano.Tip => ({
    blockNo: block.height!,
    hash: block.hash,
    slot: block.slot!
  }),

  currentWalletProtocolParameters: (
    blockfrost: Responses['epoch_param_content']
  ): ProtocolParametersRequiredByWallet => ({
    coinsPerUtxoWord: Number(blockfrost.coins_per_utxo_word),
    maxCollateralInputs: Number(blockfrost.max_collateral_inputs),
    maxTxSize: Number(blockfrost.max_tx_size),
    maxValueSize: Number(blockfrost.max_val_size),
    minFeeCoefficient: blockfrost.min_fee_a,
    minFeeConstant: blockfrost.min_fee_b,
    minPoolCost: Number(blockfrost.min_pool_cost),
    poolDeposit: Number(blockfrost.pool_deposit),
    protocolVersion: { major: blockfrost.protocol_major_ver, minor: blockfrost.protocol_minor_ver },
    stakeKeyDeposit: Number(blockfrost.key_deposit)
  }),

  inputFromUtxo: (address: string, utxo: BlockfrostUtxo): BlockfrostInput => ({
    address,
    amount: utxo.amount,
    output_index: utxo.output_index,
    tx_hash: utxo.tx_hash
  }),

  inputs: (inputs: BlockfrostInputs): Cardano.TxIn[] => inputs.map((input) => BlockfrostToCore.txIn(input)),

  outputFromUtxo: (address: string, utxo: BlockfrostUtxo): BlockfrostOutput => ({
    address,
    amount: utxo.amount
  }),

  outputs: (outputs: BlockfrostOutputs): Cardano.TxOut[] => outputs.map((output) => BlockfrostToCore.txOut(output)),

  // without `as OgmiosSchema.Utxo` above TS thinks the return value is (OgmiosSchema.TxIn | OgmiosSchema.TxOut)[][]
  transactionUtxos: (utxoResponse: Responses['tx_content_utxo']) => ({
    inputs: utxoResponse.inputs.map((input) => ({
      ...BlockfrostToCore.txIn(input),
      address: input.address
    })),
    outputs: utxoResponse.outputs.map(BlockfrostToCore.txOut)
  }),

  txContentUtxo: (blockfrost: Responses['tx_content_utxo']) => ({
    hash: blockfrost.hash,
    inputs: BlockfrostToCore.inputs(blockfrost.inputs),
    outputs: BlockfrostToCore.outputs(blockfrost.outputs)
  }),

  txIn: (blockfrost: BlockfrostInput): Cardano.TxIn => ({
    address: blockfrost.address,
    index: blockfrost.output_index,
    txId: blockfrost.tx_hash
  }),

  txOut: (blockfrost: BlockfrostOutput): Cardano.TxOut => {
    const assets: Cardano.Value['assets'] = {};
    for (const amount of blockfrost.amount) {
      if (amount.unit === 'lovelace') continue;
      assets[amount.unit] = BigInt(amount.quantity);
    }
    return {
      address: blockfrost.address,
      value: {
        assets,
        coins: BigInt(blockfrost.amount.find(({ unit }) => unit === 'lovelace')!.quantity)
      }
    };
  }
};
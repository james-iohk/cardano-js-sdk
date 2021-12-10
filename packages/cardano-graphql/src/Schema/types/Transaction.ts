/* eslint-disable no-use-before-define */
/* eslint-disable sonarjs/no-duplicate-string */
import { Asset } from './Asset';
import { AuxiliaryData } from './AuxiliaryData';
import { Block } from './Block';
import { Cardano } from '@cardano-sdk/core';
import { Directive, Field, Int, ObjectType } from 'type-graphql';
import { Slot } from './Slot';

export type SizeInBytes = string;

@ObjectType()
export class ExUnits {
  @Field(() => Int)
  memory: number;
  @Field(() => Int)
  steps: number;
}

@ObjectType()
export class Redeemer {
  @Field(() => String)
  fee: Cardano.Lovelace;
  @Field(() => Int)
  index: number;
  @Field(() => String)
  purpose: Cardano.Redeemer['purpose'];
  @Field(() => String)
  scriptHash: Cardano.Hash28ByteBase16;
  @Field(() => Transaction)
  transaction: Transaction;
  @Field(() => ExUnits)
  executionUnits: Cardano.ExUnits;
}

// Review: this didn't exist in original cardano-graphql schema
export class Value {
  @Field(() => [Token], { nullable: true })
  assets?: Token[];
  @Field(() => String)
  coin: Cardano.Lovelace;
}

@ObjectType()
export class TransactionInput {
  @Field(() => String)
  address: Cardano.Address;
  @Field(() => Redeemer, { nullable: true })
  redeemer?: Redeemer;
  // Review: what is the difference between 'transaction' and 'sourceTransaction'?
  // Is one of them an inverse for Transaction.collateral? If so, should probably be nullable?
  // @Field(() => Transaction)
  // sourceTransaction: Transaction;
  @Field(() => Transaction)
  transaction: Transaction;
  @Field(() => Int)
  index: number;
  @Field(() => Value)
  value: Value;
}

@ObjectType()
export class TransactionOutput {
  @Field(() => String)
  address: Cardano.Address;
  @Field()
  addressHasScript: boolean; // Review: what's this?
  @Field(() => Int)
  index: number;
  @Field(() => Transaction)
  transaction: Transaction;
  @Field(() => Value)
  value: Value;
}
@ObjectType()
export class Token {
  @Field(() => Asset)
  asset: Asset;
  @Field(() => String)
  quantity: bigint;
  @Field(() => TransactionOutput)
  transactionOutput: TransactionOutput;
}

@ObjectType()
export class Withdrawal {
  @Field(() => String)
  rewardAccount: Cardano.RewardAccount;
  @Field(() => String)
  quantity: Cardano.Lovelace;
  @Field(() => String, { nullable: true })
  redeemer?: Redeemer;
  @Field(() => Transaction)
  transaction: Transaction;
}

@ObjectType()
export class Transaction {
  @Directive('@id')
  @Field(() => String)
  hash: Cardano.TransactionId;
  @Field()
  block: Block;
  @Field(() => Int)
  blockIndex: number;
  @Field(() => [TransactionInput], { nullable: true })
  collateral?: TransactionInput[];
  @Field(() => String)
  deposit: Cardano.Lovelace;
  @Field(() => String)
  fee: Cardano.Lovelace;
  @Directive('@hasInverse(field: transaction)')
  @Field(() => [TransactionInput])
  inputs: TransactionInput[];
  @Directive('@hasInverse(field: transaction)')
  @Field(() => [TransactionOutput])
  outputs: TransactionOutput[];
  @Field(() => Int, { nullable: true })
  invalidBefore?: Slot;
  @Field(() => Int, { nullable: true })
  invalidHereafter?: Slot;
  @Directive('@hasInverse(field: transaction)')
  @Field(() => AuxiliaryData, { nullable: true })
  auxiliaryData?: AuxiliaryData;
  // TODO: simplify core type to use negative qty for burn
  @Field(() => [Token], { nullable: true })
  mint?: Token[];
  @Directive('@hasInverse(field: transaction)')
  @Field(() => [Redeemer], { nullable: true })
  redeemers?: Redeemer[];
  // Review: not sure how we want to handle overflow on aggregates.
  // Got to dig deeper to implementing custom dgraph stuff,
  // maybe it's possible to have custom aggregate query implementations
  // that would return strings (bigints)
  @Field(() => Int)
  size: number;
  @Field(() => String)
  totalOutputCoin: Cardano.Lovelace;
  @Field()
  validContract: boolean;
  @Directive('@hasInverse(field: transaction)')
  @Field(() => [Withdrawal], { nullable: true })
  withdrawals?: Withdrawal[];
}

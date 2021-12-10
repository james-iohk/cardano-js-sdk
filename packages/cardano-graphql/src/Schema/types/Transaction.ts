import { Block } from './Block';
import { Cardano } from '@cardano-sdk/core';
import { Directive, Field, Int, ObjectType } from 'type-graphql';
import { Slot } from './Slot';

@ObjectType()
export class TransactionInput {
  // TODO
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
  @Field(() => [TransactionInput])
  inputs: TransactionInput[];
  @Field(() => Int, { nullable: true })
  invalidBefore?: Slot;
  @Field(() => Int, { nullable: true })
  invalidHereafter?: Slot;
  // @Field(() => AuxiliaryData, { nullable: true })
  // auxiliaryData?: AuxiliaryData;
}

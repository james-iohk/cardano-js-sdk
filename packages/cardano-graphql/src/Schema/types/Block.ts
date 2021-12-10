/* eslint-disable no-use-before-define */
import { Cardano } from '@cardano-sdk/core';
import { Directive, Field, Int, ObjectType } from 'type-graphql';
import { Epoch } from './Epoch';
import { Slot } from './Slot';
import { Transaction } from './Transaction';

@ObjectType()
export class Block {
  @Directive('@id')
  @Field(() => String)
  hash: Cardano.BlockId;
  @Field(() => Int)
  blockNo: Cardano.BlockNo;
  @Field(() => Int)
  slot: Slot;
  @Field(() => Epoch)
  epoch: Epoch;
  @Field(() => Int)
  size: Cardano.BlockSize;
  @Directive('@hasInverse(field: block)')
  @Field(() => [Transaction])
  transactions: Transaction[];
  @Field(() => String)
  totalOutput: Cardano.Lovelace;
  @Field(() => String)
  fees: Cardano.Lovelace;
  @Field(() => String)
  vrf: Cardano.VrfVkBech32;
  @Field(() => Block)
  previousBlock?: Block;
  @Field(() => Block)
  nextBlock?: Block;
  @Field(() => Int)
  confirmations: number;
  @Field(() => String)
  nextBlockProtocolVersion: JSON;
  @Field(() => String)
  opCert: Cardano.Hash32ByteBase16;
}

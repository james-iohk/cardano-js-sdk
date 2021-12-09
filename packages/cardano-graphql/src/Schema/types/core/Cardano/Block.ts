/* eslint-disable no-use-before-define */
import { Cardano } from '@cardano-sdk/core';
import { Directive, Field, Int, ObjectType } from 'type-graphql';

// Joining these 2 for simplicity as block and it's header are always 1:1
// and you might want to order/filter blocks by header property
export type BlockWithPartialHeader = Omit<Cardano.Block, 'header'> & Cardano.PartialBlockHeader;

@ObjectType()
export class Block implements BlockWithPartialHeader {
  @Directive('@id')
  @Field(() => String)
  hash: Cardano.BlockId;
  @Field(() => Int)
  blockNo: Cardano.BlockNo;
  @Field(() => Int)
  slot: Cardano.Slot;
  @Field()
  date: Date;
  @Field(() => Int)
  epoch: Cardano.Epoch;
  @Field(() => Int)
  epochSlot: number;
  @Field(() => String)
  slotLeader: Cardano.PoolId;
  @Field(() => Int)
  size: Cardano.BlockSize;
  @Field(() => Int)
  txCount: number;
  @Field(() => String)
  totalOutput: Cardano.Lovelace;
  @Field(() => String)
  fees: Cardano.Lovelace;
  @Field(() => String)
  vrf: Cardano.VrfVkBech32;
  @Field(() => String)
  previousBlock?: Cardano.BlockId;
  @Field(() => String)
  nextBlock?: Cardano.BlockId;
  @Field(() => Int)
  confirmations: number;
}

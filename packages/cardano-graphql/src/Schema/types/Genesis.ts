import { Cardano } from '@cardano-sdk/core';
import { Field, Float, Int } from 'type-graphql';

export class Genesis implements Cardano.CompactGenesis {
  @Field()
  systemStart: Date;
  @Field()
  systemStartSlot: Cardano.Slot;
  @Field(() => Int)
  networkMagic: number;
  @Field(() => Float)
  activeSlotsCoefficient: Cardano.Ratio;
  @Field(() => Int)
  securityParameter: number;
  @Field(() => Int)
  epochLength: number;
  @Field(() => Int)
  slotsPerKesPeriod: number;
  @Field(() => Int)
  maxKesEvolutions: number;
  @Field(() => Int)
  slotLength: number;
  @Field(() => Int)
  updateQuorum: number;
  @Field(() => String)
  maxLovelaceSupply: Cardano.Lovelace;
}

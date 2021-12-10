import { Directive, Field, Int, ObjectType } from 'type-graphql';
import { StakePool } from './StakePool';

// Review: not present in original cardano-graphql schema
@ObjectType()
export class Slot {
  @Directive('@id')
  @Field(() => Int)
  number: number;
  @Field(() => Int)
  slotInEpoch: number;
  @Field()
  date: Date;
  @Field(() => StakePool, { nullable: true })
  leader: StakePool;
}

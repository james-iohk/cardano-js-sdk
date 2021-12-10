// Review: seems like it doesn't include actual script in original cardano-graphql schema.

import { AuxiliaryDataBody } from './AuxiliaryDataBody';
import { Cardano } from '@cardano-sdk/core';
import { Directive, Field, Int, ObjectType } from 'type-graphql';

// Should we add it?
@ObjectType()
export class Script {
  @Directive('@id')
  @Field(() => String)
  hash: Cardano.Hash28ByteBase16;
  @Field(() => Int)
  serializedSize: number;
  @Field(() => String)
  type: string;
  @Field(() => AuxiliaryDataBody)
  auxiliaryDataBody: AuxiliaryDataBody;
}

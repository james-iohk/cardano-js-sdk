/* eslint-disable no-use-before-define */
import { AnyMetadatum, Metadatum } from './Metadatum';
import { AuxiliaryData } from './AuxiliaryData';
import { Directive, Field } from 'type-graphql';
import { Script } from './Script';

export class AuxiliaryDataBody {
  @Field(() => [Metadatum], { nullable: true })
  blob?: AnyMetadatum[];
  @Directive('@hasInverse(field: auxiliaryDataBody)')
  @Field(() => [Script], { nullable: true })
  scripts?: Script[];
  @Field(() => AuxiliaryData)
  auxiliaryData: AuxiliaryData;
}

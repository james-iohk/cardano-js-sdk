import { Cardano } from '@cardano-sdk/core';
import { Field, ObjectType, createUnionType } from 'type-graphql';

// enum MetadatumType {
//   BigInt = 'bigint',
//   Map = 'map',
//   String = 'string',
//   Array = 'array',
//   Bytes = 'bytes'
// }

// export class BigIntMetadatum {
//   type: MetadatumType;

// }

// const Metadatum = createUnionType({
//   name: 'Metadatum',
//   resolveType: (value) => {
//     if ('hostname' in value) return RelayByName;
//     if ('dnsName' in value) return RelayByNameMultihost;
//     return RelayByAddress;
//   },
//   // the name of the GraphQL union
//   types: () => [RelayByName, RelayByAddress, RelayByNameMultihost] as const
// });

// @ObjectType()
// export class TransactionMetadata {
//   @Field(() => String)
//   key: string;
//   @Field(() => Metadatum)
// eslint-disable-next-line max-len
//   metadatum: Metadatum; // Review: used to be of type JSON, but this type loses information, e.g. array of numbers could be Uint8Array or bigint[]
// }

@ObjectType()
export class Script {
  // TODO
}

@ObjectType()
export class AuxiliaryDataBody {
  // @Field(() => [TransactionMetadata])
  // blob?: TransactionMetadata[];
  @Field(() => [Script])
  scripts?: Script[];
}

@ObjectType()
export class AuxiliaryData {
  @Field(() => String)
  hash: Cardano.Hash32ByteBase16;
  @Field(() => AuxiliaryDataBody)
  body: AuxiliaryDataBody;
}

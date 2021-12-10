/* eslint-disable no-use-before-define */
import { Field, Int, ObjectType, createUnionType } from 'type-graphql';
import { NotImplementedError } from '@cardano-sdk/core';

enum MetadatumStringType {
  Other = 'Other',
  Bytes = 'Bytes'
}

enum MetadatumArrayType {
  Map = 'Array',
  Array = 'Map'
}

// Review: I think integers will be int32 or int64. We left it as bigint in core types,
// so have to verify and refactor either this or core type
@ObjectType()
export class IntegerMetadatum {
  @Field(() => Int)
  value: number;
}

@ObjectType()
export class KeyValueMetadatum {
  @Field(() => String)
  key: string;
  @Field(() => Metadatum)
  metadatum: AnyMetadatum;
}

@ObjectType()
export class StringMetadatum {
  valueType: MetadatumStringType.Other;
  @Field(() => String)
  value: string;
}

@ObjectType()
export class BytesMetadatum {
  valueType: MetadatumStringType.Bytes;
  @Field(() => String)
  value: string;
}

@ObjectType()
export class MetadatumMap {
  valueType: MetadatumArrayType.Map;
  @Field(() => [KeyValueMetadatum])
  value: KeyValueMetadatum[];
}

@ObjectType()
export class MetadatumArray {
  valueType: MetadatumArrayType.Array;
  // Review: used to be of type JSON, but this type loses information,
  // e.g. bytes are encoded to string, so given a string value we can't really infer type of this metadatum.
  @Field(() => [Metadatum])
  value: AnyMetadatum[];
}

const isArrayMetadatum = (metadatum: AnyMetadatum): metadatum is MetadatumMap | MetadatumArray =>
  Array.isArray(metadatum.value);
const isStringMetadatum = (metadatum: AnyMetadatum): metadatum is StringMetadatum | BytesMetadatum =>
  Array.isArray(metadatum.value);
const isIntegerMetadatum = (metadatum: AnyMetadatum): metadatum is IntegerMetadatum =>
  typeof metadatum.value === 'number';

export type AnyMetadatum = IntegerMetadatum | MetadatumMap | StringMetadatum | BytesMetadatum | MetadatumArray;

export const Metadatum = createUnionType({
  name: 'Metadatum',
  resolveType: (metadatum) => {
    if (isStringMetadatum(metadatum)) {
      if (metadatum.valueType === MetadatumStringType.Bytes) return BytesMetadatum;
      return StringMetadatum;
    }
    if (isArrayMetadatum(metadatum)) {
      if (metadatum.valueType === MetadatumArrayType.Array) return MetadatumArray;
      return MetadatumMap;
    }
    if (isIntegerMetadatum(metadatum)) return IntegerMetadatum;
    throw new NotImplementedError(`Unknown metadatum type: ${typeof metadatum}`);
  },
  // the name of the GraphQL union
  types: () => [MetadatumArray, MetadatumMap, StringMetadatum, BytesMetadatum, IntegerMetadatum] as const
});

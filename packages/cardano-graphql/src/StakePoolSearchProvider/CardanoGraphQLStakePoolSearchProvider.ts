import { Cardano, ProviderError, ProviderFailure, StakePoolSearchProvider, util } from '@cardano-sdk/core';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../sdk';
import { isNotNil } from '../util';

export type GraphQLClien = GraphQLClient['options'];

export const createGraphQLStakePoolSearchProvider = (
  url: string,
  options?: RequestInit,
  initSdk = getSdk
): StakePoolSearchProvider => {
  const graphQLClient = new GraphQLClient(url, options);
  const sdk = initSdk(graphQLClient);
  return {
    async queryStakePools(fragments: string[]): Promise<Cardano.StakePool[]> {
      const query = fragments.join(' ');
      try {
        const byStakePoolFields = (await sdk.StakePools({ query })).queryStakePool?.filter(isNotNil);
        const byMetadataFields = await sdk.StakePoolsByMetadata({
          omit: byStakePoolFields?.length ? byStakePoolFields?.map((sp) => sp.id) : undefined,
          query
        });
        const responseStakePools = [
          ...(byStakePoolFields || []),
          ...(byMetadataFields.queryStakePoolMetadata || []).map((sp) => sp?.stakePool)
        ].filter(isNotNil);
        return responseStakePools.map((responseStakePool) => {
          const stakePool = util.replaceNullsWithUndefineds(responseStakePool);
          const metadata = stakePool.metadata;
          const ext = metadata?.ext;
          return {
            ...stakePool,
            cost: BigInt(stakePool.cost),
            // TODO: Rebuild sdk.ts and convert 'margin' and 'relays' to updated types
            margin: {} as Cardano.Fraction,
            metadata: metadata
              ? {
                  ...metadata,
                  ext: ext
                    ? {
                        ...ext,
                        pool: {
                          ...ext.pool,
                          status: ext.pool.status as unknown as Cardano.PoolStatus
                        }
                      }
                    : undefined
                }
              : undefined,
            metrics: {
              ...stakePool.metrics!,
              livePledge: BigInt(stakePool.metrics.livePledge),
              stake: {
                active: BigInt(stakePool.metrics.stake.active),
                live: BigInt(stakePool.metrics.stake.live)
              }
            },
            pledge: BigInt(stakePool.pledge),
            relays: []
          };
        });
      } catch (error) {
        throw new ProviderError(ProviderFailure.Unknown, error);
      }
    }
  };
};

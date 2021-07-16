import { Schema } from '@cardano-ogmios/client'

const throwIfNegative = (value: number): void => {
  if (value < 0) {
    throw new Error('The value provided cannot be applied as it will result in a negative balance')
  }
}

export const applyValue = (
  balance: Schema.Value,
  value: Schema.Value,
  spending = false
): Schema.Value => {
  const coins = balance.coins + (spending ? -Math.abs(value.coins) : value.coins)
  throwIfNegative(coins)
  const balanceToApply: Schema.Value = { coins }
  if (balance.assets !== undefined || value.assets !== undefined) {
    balanceToApply.assets = { ...balance.assets } ?? {}
  }
  const assets = Object.entries(value.assets ?? {})
  if (assets.length > 0) {
    assets.forEach(([assetId, qty]) => {
      balanceToApply.assets[assetId] = (balance.assets[assetId] !== undefined)
        ? balance.assets[assetId] + (spending ? -Math.abs(qty) : qty)
        : (spending ? -Math.abs(qty) : qty)
      throwIfNegative(balanceToApply.assets[assetId])
    })
  }

  return balanceToApply
}
export interface DeliverySettings {
  freeDeliveryThreshold: number;
  deliveryFee: number;
  stateFees: Record<string, number>;
}

export const DEFAULT_DELIVERY: DeliverySettings = {
  freeDeliveryThreshold: 50000,
  deliveryFee: 3500,
  stateFees: {},
};

export function computeDelivery(subtotal: number, state: string, s: DeliverySettings): number {
  if (s.freeDeliveryThreshold > 0 && subtotal >= s.freeDeliveryThreshold) return 0;
  const stateFee = state ? s.stateFees[state] : undefined;
  return stateFee != null ? stateFee : s.deliveryFee;
}

export function parseDeliverySettings(
  storeInfo: Record<string, unknown> | undefined,
  stateFees: Record<string, unknown> | undefined | null
): DeliverySettings {
  const threshold = Number(storeInfo?.freeDeliveryThreshold);
  const fee = Number(storeInfo?.deliveryFee);
  const fees: Record<string, number> = {};
  for (const [state, value] of Object.entries(stateFees ?? {})) {
    if (value === "" || value == null) continue;
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) fees[state] = n;
  }
  return {
    freeDeliveryThreshold: Number.isFinite(threshold) ? threshold : DEFAULT_DELIVERY.freeDeliveryThreshold,
    deliveryFee: Number.isFinite(fee) ? fee : DEFAULT_DELIVERY.deliveryFee,
    stateFees: fees,
  };
}

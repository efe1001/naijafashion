"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { computeDelivery, parseDeliverySettings } from "@/lib/delivery";

export function useDelivery(subtotal: number, state: string) {
  const storeInfo = useSettingsStore((s) => s.storeInfo);
  const stateFees = useSettingsStore((s) => s.stateFees);
  const settings = parseDeliverySettings(storeInfo as unknown as Record<string, unknown>, stateFees);
  return { delivery: computeDelivery(subtotal, state, settings), settings };
}

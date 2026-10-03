import type { Piasters } from "./types";

/** Whole/decimal EGP typed in a form → integer piasters (SRS DC-06). */
export function egpToPiasters(egp: number): Piasters {
  return Math.round(egp * 100);
}

export function piastersToEgp(amount: Piasters): number {
  return amount / 100;
}

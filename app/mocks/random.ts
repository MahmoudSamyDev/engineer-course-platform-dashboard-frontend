/** Deterministic random numbers (mulberry32) so mock data, screenshots and tests are stable. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!,
    chance: (p: number) => next() < p,
  };
}

export type Random = ReturnType<typeof createRandom>;

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Booking reference `KM-{YYMM}-{6 Crockford chars}` (Website SRS §6.4). */
export function bookingReference(random: Random, yymm: string): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CROCKFORD[random.int(0, CROCKFORD.length - 1)];
  return `KM-${yymm}-${code}`;
}

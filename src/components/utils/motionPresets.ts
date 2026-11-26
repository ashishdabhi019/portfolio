export const EDITORIAL_EASE = [0.16, 1, 0.3, 1] as const;

export const SOFT_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.9,
} as const;

export const TACTILE_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 30,
} as const;

export const VIEWPORT_REVEAL = {
  once: true,
  amount: "some",
} as const;

export const staggerDelay = (index: number, step = 0.05, max = 0.3) =>
  Math.min(index * step, max);

import { SIFR, type Particle } from './sifr';

// A local what-if profile. The supplied model remains the immutable reference.
// This control changes one qualitative prominence score, not ingredient quantity,
// measured heat, confidence, coordinates, or a prediction of a tasted recipe.
export const LAB_PARTICLE_ID = 'laksa-4';
export const LAB_ORIGINAL = SIFR.particles.find(p => p.id === LAB_PARTICLE_ID)!;
export const LAB_ORIGINAL_SCORE = Math.round(LAB_ORIGINAL.intensity * 100);
export type LabView = 'original' | 'variation';

export function normaliseChilliScore(score: number) {
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : LAB_ORIGINAL_SCORE;
}

export function createLaksaVariation(score: number): Particle[] {
  const intensity = normaliseChilliScore(score) / 100;
  return SIFR.particles.map(p => p.id === LAB_PARTICLE_ID ? { ...p, intensity } : p);
}

// The renderer caches the original Gaussian kernels. Ratios let every projection
// use the derived model without moving anchors or changing the shared height scale.
export function prominenceRatios(particles: Particle[]) {
  const byId = new Map(particles.map(p => [p.id, p]));
  return SIFR.particles.map(p => {
    const current = byId.get(p.id);
    return current && p.intensity > 0 ? current.intensity / p.intensity : 1;
  });
}

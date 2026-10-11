import data from './sifr-data.json';
export const SIFR = data;
export type Particle = typeof data.particles[number];
export type DishKey = 'chicken_rice' | 'laksa' | 'compare';
export type ViewKey = 'topography' | 'particles' | 'barcode';
export type CompareMode = 'overlay' | 'common' | 'difference';
export const color = (p: Particle) => SIFR.palette[p.dominant_descriptor as keyof typeof SIFR.palette];
export const sigma = (p: Particle) => 0.065 + (1 - p.volatility) * 0.025;
export const contribution = (p: Particle, x: number, y: number) => p.intensity * Math.exp(-((x-p.x)**2 + (y-p.y)**2)/(2*sigma(p)**2));
export const field = (ps: Particle[], x: number, y: number) => ps.reduce((z,p)=>z+contribution(p,x,y),0);
export const barcode = (ps: Particle[]) => [...ps].sort((a,b)=>a.x-b.x || b.intensity-a.intensity);
export const isCommon = (p: Particle) => SIFR.particles.some(q=>q.dish!==p.dish && q.label===p.label && Math.hypot(q.x-p.x,q.y-p.y)<0.06);
export const activeParticles = (dish: DishKey, layer='all') => SIFR.particles.filter(p=>(dish==='compare'||p.dish===dish)&&(layer==='all'||p.layer.split('/').includes(layer)));
// A single fixed scale for both dishes and every filter. No per-dish rescaling.
export const HEIGHT_SCALE = 0.19;
export const DOMAIN = { min:-0.16, max:1.16 };

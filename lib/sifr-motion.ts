// Presentation timing only. These helpers never modify the sensory model.
export const FORMATION_MS = 1750;
export const PROJECTION_MS = 1150;
export const FRAME_MS = 1000 / 30;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => { const t = clamp01(n); return t*t*(3-2*t); };
export const mix = (a: number,b: number,t: number) => a+(b-a)*t;
export const noise = (seed: number) => { const n=Math.sin(seed*127.1+311.7)*43758.5453; return n-Math.floor(n); };
export function formation(progress: number,x: number,y: number) {
  const delay = (x*.45+y*.55)*.10;
  return { gather: ease(progress/.25), rise: ease((progress-.22-delay)/(.78-delay)) };
}

import { SIFR, type Particle } from './sifr';

// Interpretive reading aids, not PCA axis labels or new model particles.
// Anchors are recomputed from the visible members' supplied coordinates.
const regions = [
  { id: 'savoury', labels: { chicken_rice: 'Chicken / stock', laksa: 'Marine / fermented', compare: 'Stock / marine umami' }, members: ['chicken_rice-1','chicken_rice-2','chicken_rice-7','laksa-2','laksa-3','laksa-12'] },
  { id: 'richness', labels: { chicken_rice: 'Chicken fat', laksa: 'Coconut richness', compare: 'Coconut / fats' }, members: ['chicken_rice-3','laksa-1','laksa-13'] },
  { id: 'rice', labels: { chicken_rice: 'Rice / pandan', laksa: '', compare: 'Rice / pandan' }, members: ['chicken_rice-4'] },
  { id: 'aromatics', labels: { chicken_rice: 'Citrus / green', laksa: 'Citrus / herbs', compare: 'Citrus / herbs' }, members: ['chicken_rice-9','chicken_rice-10','laksa-5','laksa-6','laksa-7','laksa-8','laksa-9','laksa-11'] },
  { id: 'edge', labels: { chicken_rice: 'Ginger / garlic / heat', laksa: 'Chilli / garlic', compare: 'Ginger / garlic / heat' }, members: ['chicken_rice-5','chicken_rice-6','chicken_rice-8','laksa-4','laksa-10'] },
];

export function visibleRegions(particles: Particle[], compare: boolean) {
  return regions.flatMap(region => {
    const members = particles.filter(p => region.members.includes(p.id));
    if (!members.length) return [];
    const key = compare ? 'compare' : members[0].dish as 'chicken_rice' | 'laksa';
    const weight = members.reduce((sum,p) => sum+p.intensity,0);
    return [{ id: region.id, label: region.labels[key], x: members.reduce((s,p)=>s+p.x*p.intensity,0)/weight, y: members.reduce((s,p)=>s+p.y*p.intensity,0)/weight, particle: [...members].sort((a,b)=>b.intensity-a.intensity)[0], members }];
  });
}

export const RELEASES = [
  { version: '0.2.0', date: '11 October 2026', title: 'Shape a flavour', changes: ['Sifr Lab creates a local Laksa variation by changing one hypothetical chilli prominence score.', 'Original / My variation and Reset keep the reference recoverable. All three projections and inspection use the displayed profile.', 'Animated field, marker size and barcode respond to the same derived value. The original 24 records, coordinates and fixed height scale are unchanged.', 'No measured-heat or recipe prediction is claimed. Variations stay in the current page session.'] },
  { version: '0.1.3', date: '7 October 2026', title: 'Formation', changes: ['Shared particles persist as dish fields and contours continuously reform.', 'Relief grows around particle anchors; barcode bands collect and release the same object.', 'Filters preserve full barcode positions and ghost excluded particles. Rapid changes retarget the visible state.', 'Pre-Formation checkpoint: saved Site version 3 (v0.1.2). Original 24 records unchanged.'] },
  { version: '0.1.2', date: '7 October 2026', title: 'A living sensory field', changes: ['Restless ground samples rise into the supplied profile, then settle into a restrained shimmer.', 'Particles move between terrain, flat field, and barcode; motion can be paused or replayed.', 'Larger, brighter terrain, stronger focus, and a three-stop guided comparison.'] },
  { version: '0.1.1', date: '7 October 2026', title: 'Follow the particle', changes: ['Point-cloud terrain sampled from the original Gaussian field.', 'Linked particle focus, contribution isolation, and barcode highlighting.', 'Optional data-anchored region labels; original Relief view retained.'] },
  { version: '0.1', date: '7 October 2026', title: 'First sensory instrument', changes: ['Original 24-particle handover preserved.', 'Topography, Particles, Barcode and shared-space Compare.', 'Saved Site version 1 retained as the baseline rollback point.'] },
];

export const CURRENT_VERSION = RELEASES[0].version;
export const MODEL_PARTICLE_COUNT = SIFR.particles.length;

import {SIFR} from './sifr';

// Curated reading prompts. Every highlight resolves to supplied model records.
const groups = [
  {id:'garlic',title:'Shared garlic',heading:'One anchor, two dishes.',ids:['chicken_rice-6','laksa-10'],description:'Garlic sulfur volatiles occupy exactly the same coordinates in both dishes. Their inferred prominence differs, so the same anchor contributes to different terrain heights.'},
  {id:'chilli',title:'Stronger chilli',heading:'Nearby position. Different prominence.',ids:['chicken_rice-8','laksa-4'],description:'Capsaicinoids sit in closely related regions. Laksa has greater inferred prominence in this snapshot; these scores are not measured heat units.'},
  {id:'aromatics',title:'Wider aromatics',heading:'More of the citrus and herbal region.',ids:['chicken_rice-9','chicken_rice-10','laksa-5','laksa-6','laksa-7','laksa-8','laksa-9','laksa-11'],description:'Laksa’s citrus, herbal and floral records spread across this region. Chicken Rice has a smaller lime and cucumber edge in the supplied model.'},
];
export const COMPARE_STOPS = groups.map(g=>({...g,particles:SIFR.particles.filter(p=>g.ids.includes(p.id))}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import ts from 'typescript';

// Run the actual TypeScript model without adding a test-framework dependency.
function loadModule(path, imports) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    assert.ok(name in imports, `Unexpected test import: ${name}`);
    return imports[name];
  }, module, module.exports);
  return module.exports;
}

const raw = fs.readFileSync('lib/sifr-data.json');
assert.equal(createHash('sha256').update(raw).digest('hex'), '6a5d850dcde8e75bee643aa96e8309c43f10e2b279c8148b6e6cff79fdd25776', 'Original handover data must stay byte-identical');
const data = JSON.parse(raw);
const model = loadModule('lib/sifr.ts', { './sifr-data.json': { default: data } });
const regions = loadModule('lib/sifr-regions.ts', { './sifr': model });
const { SIFR, activeParticles, contribution, field, barcode, isCommon, sigma } = model;
assert.equal(SIFR.particles.length, 24);
assert.equal(activeParticles('chicken_rice').length, 11);
assert.equal(activeParticles('laksa').length, 13);
assert.equal(new Set(SIFR.particles.map(p => p.id)).size, 24);
assert.equal(model.HEIGHT_SCALE, .19);
assert.deepEqual(model.DOMAIN, { min: -.16, max: 1.16 });
for (const p of SIFR.particles) {
  for (const key of ['x', 'y', 'intensity', 'volatility', 'confidence']) assert.ok(Number.isFinite(p[key]));
  assert.ok(model.color(p), `Descriptor colour missing for ${p.id}`);
  assert.equal(contribution(p, p.x, p.y), p.intensity);
  assert.equal(sigma(p), .065 + (1 - p.volatility) * .025);
}
const garlic = SIFR.particles.filter(p => p.label === 'Garlic sulfur volatiles');
assert.equal(garlic.length, 2);
assert.deepEqual(garlic.map(p => [p.x,p.y]), [[.2767,.9543],[.2767,.9543]]);
const heat = SIFR.particles.filter(p => p.label === 'Capsaicinoids');
assert.ok(Math.hypot(heat[0].x-heat[1].x,heat[0].y-heat[1].y) < .06);
assert.equal(SIFR.particles.filter(isCommon).length, 4);
for (const dish of ['chicken_rice','laksa','compare']) {
  const particles = activeParticles(dish), before = particles.map(p => p.id);
  const sorted = barcode(particles);
  assert.deepEqual(particles.map(p => p.id), before, 'Barcode must not mutate source order');
  assert.deepEqual(new Set(sorted.map(p => p.id)), new Set(before));
  assert.ok(sorted.every((p,i) => i === 0 || p.x >= sorted[i-1].x));
  for (const [x,y] of [[0,0],[.3,.5],[.8,.7],[1,1]]) {
    assert.equal(field(particles,x,y), particles.reduce((z,p) => z+contribution(p,x,y),0));
  }
  for (const region of regions.visibleRegions(particles,dish === 'compare')) {
    const total = region.members.reduce((z,p) => z+p.intensity,0);
    assert.equal(region.x, region.members.reduce((z,p) => z+p.x*p.intensity,0)/total);
    assert.equal(region.y, region.members.reduce((z,p) => z+p.y*p.intensity,0)/total);
    assert.ok(region.members.some(p => p.id === region.particle.id));
  }
}
console.log('PASS: original data checksum, 24 records, shared anchors, Gaussian fields, barcode identity/order, annotation anchors.');

const motion = loadModule('lib/sifr-motion.ts', {});
const scene = loadModule('lib/sifr-scene.ts', { './sifr': model, './sifr-motion': motion });
const comparison = loadModule('lib/sifr-compare.ts', { './sifr': model });
for (const x of [0,.3,1]) for (const y of [0,.7,1]) {
  assert.equal(motion.formation(0,x,y).rise,0);
  assert.equal(motion.formation(1,x,y).rise,1);
  let previous=0;
  for(let t=0;t<=1;t+=.025){const rise=motion.formation(t,x,y).rise;assert.ok(rise>=previous&&rise<=1);previous=rise;}
}
for(const mode of ['overlay','common','difference']) {
  const surfaces=scene.makeSurfaces(SIFR.particles,true,mode,null,[]);
  for(const s of surfaces) for(const k of [0,105,1200,3100,5000,6400]) {
    const sample=s.cloud[k], own=field(s.ps,sample.x,sample.y),other=field(surfaces.find(o=>o!==s).ps,sample.x,sample.y);
    assert.equal(sample.z,mode==='difference'?Math.max(0,own-other):own);
  }
  assert.deepEqual(surfaces[0].cloud.map(p=>[p.x,p.y]),surfaces[1].cloud.map(p=>[p.x,p.y]));
}
const chosen=SIFR.particles.find(p=>p.id==='chicken_rice-4');
for(const s of scene.makeSurfaces(SIFR.particles,true,'overlay',chosen,[chosen.id])) for(const k of [100,1200,3100,5000]) {
  const sample=s.cloud[k];
  assert.equal(sample.z,s.dish.id===chosen.dish?contribution(chosen,sample.x,sample.y):0);
  if(sample.z>.001)assert.equal(sample.owner,chosen.id);
}
for(const stop of comparison.COMPARE_STOPS)assert.equal(stop.particles.length,stop.ids.length);
assert.deepEqual(comparison.COMPARE_STOPS[0].particles.map(p=>p.intensity),[.6,.46]);
assert.deepEqual(comparison.COMPARE_STOPS[1].particles.map(p=>p.intensity),[.55,.86]);
assert.equal(createHash('sha256').update(fs.readFileSync('lib/sifr-data.json')).digest('hex'),createHash('sha256').update(raw).digest('hex'));
console.log('PASS: motion endpoints, monotonic rise, identical sample lattices, exact settled fields, isolation and guided comparison values.');

const formationModel=loadModule('lib/sifr-formation.ts',{'./sifr':model,'./sifr-motion':motion,'./sifr-scene':scene});
const target=(dish,layer='all',mode='overlay',view='topography')=>formationModel.targetState({dish,layer,mode,view});
const cr=target('chicken_rice'),la=target('laksa'),frames=formationModel.createFieldFrames();
for(const [dish,layer,mode] of [['chicken_rice','all','overlay'],['laksa','all','overlay'],['chicken_rice','taste','overlay'],['compare','all','common'],['compare','all','difference']]){
 const state=target(dish,layer,mode);formationModel.evaluateField(state,frames);
 for(const k of [106,1200,3100,5000,formationModel.MARKER_OFFSET]){
  const {x,y}=formationModel.FIELD_NODES[k],a=SIFR.particles.filter((p,i)=>state.amplitude[i]&&p.dish==='chicken_rice'),b=SIFR.particles.filter((p,i)=>state.amplitude[i]&&p.dish==='laksa');
  const za=field(a,x,y),zb=field(b,x,y),expected=dish==='compare'?(mode==='difference'?Math.max(0,za-zb):za):za+zb;
  assert.ok(Math.abs(frames[0].z[k]-expected)<1e-12,`Exact field ${dish}/${layer}/${mode}`);
  if(dish==='compare')assert.ok(Math.abs(frames[1].z[k]-(mode==='difference'?Math.max(0,zb-za):zb))<1e-12);
 }
}
for(const t of [0,.1,.35,.5,.8,1]){
 const state=formationModel.interpolateVisual(cr,la,t);formationModel.evaluateField(state,frames);
 for(let i=0;i<24;i++)if(formationModel.sharedPartner[i]>i)assert.equal(formationModel.markerPresence(state,i),1,'Shared marker never disappears');
 const k=3100,{x,y}=formationModel.FIELD_NODES[k];
 assert.ok(Math.abs(frames[0].z[k]-SIFR.particles.reduce((z,p,i)=>z+contribution(p,x,y)*state.amplitude[i],0))<1e-12,'Intermediate relief is the interpolated particle field');
 const retarget=formationModel.interpolateVisual(state,cr,0);assert.deepEqual(retarget,state,'Interrupt starts at currently displayed state');
}
const filtered=target('chicken_rice','taste');
for(let i=0;i<24;i++){const p=SIFR.particles[i];if(p.dish==='chicken_rice'&&!p.layer.split('/').includes('taste')){assert.equal(filtered.amplitude[i],0);assert.equal(filtered.visibility[i],.15);}}
assert.equal(formationModel.transitionDuration({dish:'chicken_rice',view:'topography'},{dish:'laksa',view:'topography'}),1750);
assert.equal(formationModel.transitionDuration({dish:'chicken_rice',view:'topography'},{dish:'chicken_rice',view:'particles'}),1150);
assert.equal(formationModel.transitionDuration({dish:'chicken_rice',view:'topography'},{dish:'chicken_rice',view:'topography'}),650);
console.log('PASS: exact animated fields, shared-marker continuity, interrupted retargets, ghost weights, and duration ranges.');

const lab=loadModule('lib/sifr-lab.ts',{'./sifr':model});
assert.equal(lab.LAB_PARTICLE_ID,'laksa-4');
assert.equal(lab.LAB_ORIGINAL_SCORE,86);
assert.equal(lab.normaliseChilliScore(-12),0);
assert.equal(lab.normaliseChilliScore(140),100);
assert.equal(lab.normaliseChilliScore(NaN),86);
const referenceJSON=JSON.stringify(SIFR.particles);
for(const score of [0,43,86,100]){
 const variation=lab.createLaksaVariation(score),ratios=lab.prominenceRatios(variation);
 const chilli=variation.find(p=>p.id===lab.LAB_PARTICLE_ID);
 assert.equal(chilli.intensity,score/100,'Inspection receives the current derived prominence');
 for(const original of SIFR.particles){
  const derived=variation.find(p=>p.id===original.id);
  assert.deepEqual({...derived,intensity:original.intensity},original,'Only prominence may change');
  if(original.id!==lab.LAB_PARTICLE_ID)assert.equal(derived.intensity,original.intensity);
 }
 const laksa=variation.filter(p=>p.dish==='laksa');
 const signature=barcode(laksa);
 assert.deepEqual(signature.map(p=>p.id),barcode(activeParticles('laksa')).map(p=>p.id),'Variation keeps barcode identity and x order');
 assert.equal(signature.find(p=>p.id===lab.LAB_PARTICLE_ID).intensity,score/100,'Barcode uses the same variation');
 for(const view of ['topography','particles','barcode']){
  const state=formationModel.targetState({dish:'laksa',layer:'all',mode:'overlay',view,prominence:ratios});
  formationModel.evaluateField(state,frames);
  for(const k of [106,1200,3100,5000,formationModel.MARKER_OFFSET+SIFR.particles.findIndex(p=>p.id===lab.LAB_PARTICLE_ID)]){
   const {x,y}=formationModel.FIELD_NODES[k];
   assert.ok(Math.abs(frames[0].z[k]-field(laksa,x,y))<1e-12,`Derived field matches model at ${score} in ${view}`);
  }
 }
 const isolated=formationModel.targetState({dish:'laksa',layer:'all',mode:'overlay',view:'topography',prominence:ratios,isolateId:chilli.id});
 formationModel.evaluateField(isolated,frames);
 for(const k of [100,3100,formationModel.MARKER_OFFSET+SIFR.particles.findIndex(p=>p.id===chilli.id)]){
  const {x,y}=formationModel.FIELD_NODES[k];
  assert.ok(Math.abs(frames[0].z[k]-contribution(chilli,x,y))<1e-12,'Contribution-only uses the derived prominence, including zero');
 }
 for(const region of regions.visibleRegions(laksa,false))assert.ok(Number.isFinite(region.x)&&Number.isFinite(region.y),'Zero prominence cannot break region anchors');
}
const half=formationModel.targetState({dish:'laksa',layer:'all',mode:'overlay',view:'topography',prominence:lab.prominenceRatios(lab.createLaksaVariation(43))});
for(const progress of [0,.2,.5,.8,1]){
 const state=formationModel.interpolateVisual(la,half,progress);
 formationModel.evaluateField(state,frames);
 const k=3100,{x,y}=formationModel.FIELD_NODES[k];
 const expected=SIFR.particles.reduce((z,p,i)=>z+contribution(p,x,y)*state.amplitude[i]*state.prominence[i],0);
 assert.ok(Math.abs(frames[0].z[k]-expected)<1e-12,'Changed prominence participates throughout the animated field');
 assert.deepEqual(formationModel.interpolateVisual(state,la,0),state,'Reset or retarget starts from the current variation');
}
const restored=lab.createLaksaVariation(lab.LAB_ORIGINAL_SCORE);
assert.deepEqual(restored,SIFR.particles,'Reset restores the exact reference values');
assert.deepEqual(lab.prominenceRatios(restored),Array(24).fill(1),'Reset removes every derived multiplier');
assert.equal(JSON.stringify(SIFR.particles),referenceJSON,'Lab must never mutate the reference');
assert.equal(createHash('sha256').update(fs.readFileSync('lib/sifr-data.json')).digest('hex'),'6a5d850dcde8e75bee643aa96e8309c43f10e2b279c8148b6e6cff79fdd25776');
console.log('PASS: bounded Lab variation, exact shared fields in all projections, barcode/inspection values, zero isolation, animated retargets, and exact reset.');

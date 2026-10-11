import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';

const code=ts.transpileModule(fs.readFileSync('lib/sifr-atlas-model.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('require','module','exports',code)(name=>{throw Error(`Unexpected runtime import ${name}`);},module,module.exports);
const {buildAtlasProfile,normalizeIngredient,sharedIngredientScore,atlasContribution,atlasField,atlasBarcode,INGREDIENT_FAMILIES}=module.exports;
const food=(id,ingredients)=>({id,name:id,area:'Test fixture',category:'Illustrative test',ingredients:ingredients.map(name=>({name,amount:'1 source amount'})),sourceUrl:'https://example.org/recipe',originalSourceUrl:null});
const originalChecksum='6a5d850dcde8e75bee643aa96e8309c43f10e2b279c8148b6e6cff79fdd25776';
assert.equal(createHash('sha256').update(fs.readFileSync('lib/sifr-data.json')).digest('hex'),originalChecksum);
assert.ok(INGREDIENT_FAMILIES.length>=50);
assert.equal(normalizeIngredient(' Garlic Cloves '),'garlic');
assert.equal(normalizeIngredient('Spring Onions'),normalizeIngredient('Scallions'));
assert.equal(normalizeIngredient('CILANTRO'),normalizeIngredient('Fresh Coriander'));
assert.notEqual(normalizeIngredient('fresh mint'),normalizeIngredient('dried mint'),'Do not silently collapse fresh and dried preparations');

const a=food('A',['Garlic','Coconut Milk','Rice','Uncatalogued test ingredient']);
const before=JSON.stringify(a),base=buildAtlasProfile(a);
assert.equal(base.methodLabel,'Ingredient-derived sketch');
assert.equal(base.unmappedCount,1);
const nonLatin=buildAtlasProfile(food('Unmapped name',['味噌']));
assert.equal(nonLatin.ingredientCount,1,'Unmapped non-Latin names must remain visible');
assert.equal(nonLatin.unmappedCount,1);
assert.equal(base.particles.length,4);
assert.ok(base.particles.every(p=>p.intensity===1),'Start with equal units, independent of source amounts');
const unknown=base.particles.find(p=>!p.mapped);
assert.equal(unknown.descriptor,'unmapped');
assert.equal(unknown.family,'unmapped');
assert.equal(atlasContribution(unknown,unknown.x,unknown.y),0,'Never invent a sensory-field contribution for an unknown ingredient');
const changedAmounts=buildAtlasProfile({...a,ingredients:a.ingredients.map((i,n)=>({...i,amount:n?'2 kg':'a pinch'}))});
assert.deepEqual(changedAmounts.particles,base.particles,'Do not turn incompatible recipe measures into contribution weights');
const b=food('B',['Water','Spring Onions','Garlic Cloves']);
const garlic=base.particles.find(p=>p.ingredient==='garlic');
const crossDish=buildAtlasProfile(b).particles.find(p=>p.ingredient==='garlic');
assert.deepEqual([garlic.id,garlic.x,garlic.y,garlic.descriptor],[crossDish.id,crossDish.x,crossDish.y,crossDish.descriptor],'Same ingredient stays in the same coordinate across dishes');
assert.deepEqual(buildAtlasProfile({...a,ingredients:[...a.ingredients].reverse()}).particles.find(p=>p.id===garlic.id),garlic,'Ingredient order cannot refit the geometry');
assert.equal(buildAtlasProfile(food('Repeated',['Garlic','Garlic Cloves'])).ingredientCount,1,'Repeated ingredient rows merge into one identity without overstating frequency');

for(const value of [0,.5,1,2,-4,5,NaN]){
 const variation=buildAtlasProfile(a,{[garlic.id]:value}),expected=Number.isFinite(value)?Math.max(0,Math.min(2,value)):1;
 assert.equal(variation.particles.find(p=>p.id===garlic.id).intensity,expected);
 for(const p of variation.particles){const ref=base.particles.find(q=>q.id===p.id);assert.deepEqual({...p,intensity:ref.intensity},ref);if(p.id!==garlic.id)assert.equal(p.intensity,ref.intensity,'Changing one ingredient cannot renormalize the others');}
 for(const [x,y] of [[0,0],[.3,.5],[garlic.x,garlic.y],[.8,.8]]){
  const expectedField=atlasField(base.particles,x,y)+(expected-1)*atlasContribution(garlic,x,y);
  assert.ok(Math.abs(atlasField(variation.particles,x,y)-expectedField)<1e-10,'The changed field equals exactly one changed ingredient contribution');
 }
 const barcode=atlasBarcode(variation.particles);
 assert.deepEqual(new Set(barcode.map(p=>p.id)),new Set(base.particles.map(p=>p.id)),'Barcode and spatial projections retain every identity, including zero and unknown');
 assert.deepEqual(barcode.map(p=>p.id),atlasBarcode(base.particles).map(p=>p.id),'Changing a weight cannot reorder the barcode');
}
assert.deepEqual(buildAtlasProfile(a,{garlic:0}),buildAtlasProfile(a,{[garlic.id]:0}),'Overrides accept canonical ingredient name or stable particle ID');
assert.deepEqual(buildAtlasProfile(a,{}),base,'Reset returns the exact original sketch');
assert.equal(JSON.stringify(a),before,'Recipe records and their amounts stay immutable');
assert.equal(sharedIngredientScore(a,a),1);
assert.equal(sharedIngredientScore(a,b),1/6);
assert.equal(sharedIngredientScore(a,b),sharedIngredientScore(b,a));
assert.equal(sharedIngredientScore(food('Empty',[]),food('Empty',[])),0);
assert.equal(sharedIngredientScore(food('A',['Garlic','Garlic']),food('B',['Garlic Cloves'])),1);
console.log('PASS: stable identities/coordinates, equal source-independent weights, bounded overrides, exact one-ingredient field changes, projection identity, unmapped honesty, reset and overlap.');

if(fs.existsSync('lib/atlas-foods.json')){
 const dataset=JSON.parse(fs.readFileSync('lib/atlas-foods.json','utf8'));
 let total=0,unmapped=0;const unknowns=new Map();const coordinates=new Map();
 for(const entry of dataset.foods){
  const profile=buildAtlasProfile(entry);total+=profile.ingredientCount;unmapped+=profile.unmappedCount;
  assert.equal(new Set(profile.particles.map(p=>p.id)).size,profile.ingredientCount);
  for(const p of profile.particles){
   assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);
   assert.ok(/^#[0-9a-f]{6}$/i.test(p.color));assert.equal(p.intensity,1);
   if(coordinates.has(p.id))assert.deepEqual([p.x,p.y],coordinates.get(p.id));else coordinates.set(p.id,[p.x,p.y]);
   if(!p.mapped)unknowns.set(p.ingredient,(unknowns.get(p.ingredient)||0)+1);
  }
 }
 console.log(`PASS: ${dataset.foods.length} indexed recipes; ${total} ingredient occurrences after within-recipe deduplication; ${unmapped} explicitly unmapped (${(100*unmapped/Math.max(1,total)).toFixed(1)}%).`);
 console.log('Unmapped examples:',[...unknowns].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([name,count])=>`${name} (${count})`).join(', '));
}
assert.equal(createHash('sha256').update(fs.readFileSync('lib/sifr-data.json')).digest('hex'),originalChecksum);
console.log('PASS: original 24-record Sifr model remains byte-identical.');

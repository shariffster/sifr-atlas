'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight, X} from 'lucide-react';
import type {AtlasFood} from '@/lib/atlas-types';
import {buildAtlasProfile, normalizeIngredient, sharedIngredientScore} from '@/lib/sifr-atlas-model';
import {AtlasProfile} from './atlas-profile';

type Filter = {id:string;label:string;match:string};
type Props = {food:AtlasFood;foods:AtlasFood[];filter:Filter|null;onFollowIngredient:(ingredient:string)=>void};

export function relatedAtlasRecipe(food:AtlasFood,foods:AtlasFood[],filter:Filter|null) {
 const candidates=foods.filter(candidate=>candidate.id!==food.id&&candidate.area!==food.area);
 const pattern=filter?new RegExp(filter.match,'i'):null;
 const matches=pattern?candidates.filter(candidate=>candidate.ingredients.some(i=>pattern.test(i.name))):candidates;
 return (matches.length?matches:candidates).map(candidate=>({food:candidate,score:sharedIngredientScore(food,candidate)}))
  .sort((a,b)=>b.score-a.score||a.food.name.localeCompare(b.food.name))[0]?.food;
}

export default function AtlasDetail({food,foods,filter,onFollowIngredient}:Props) {
 const [tab,setTab]=useState<'ingredients'|'profile'>('ingredients');
 const [view,setView]=useState<'topography'|'particles'|'barcode'>('topography');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const previousFilter=useRef<string|null>(null);
 const profile=useMemo(()=>buildAtlasProfile(food),[food]);
 useEffect(()=>{
  const pattern=filter?new RegExp(filter.match,'i'):null;
  const initial=profile.particles.find(p=>pattern?.test(p.label))?.id??null;
  const filterChanged=previousFilter.current!==(filter?.id??null);
  previousFilter.current=filter?.id??null;
  setSelectedId(previous=>filterChanged?initial:profile.particles.some(p=>p.id===previous)?previous:initial);
 },[profile,filter]);
 const selected=profile.particles.find(p=>p.id===selectedId);
 const related=useMemo(()=>relatedAtlasRecipe(food,foods,filter),[food,foods,filter]);
 const inspect=(ingredient:string)=>{setSelectedId(`ingredient:${normalizeIngredient(ingredient)}`);setTab('profile');};
 return <section className="fa-detail" aria-label={`${food.name} recipe snapshot`}>
  <div className="fa-detail-heading"><div><h3>{food.name}</h3><p>{food.area} · TheMealDB #{food.id.replace('mealdb-','')}</p></div><a aria-label={`Open source recipe for ${food.name}`} href={food.sourceUrl} target="_blank" rel="noreferrer"><ArrowUpRight size={19}/></a></div>
  <p className="fa-version-note">One recorded version, not a definitive cultural standard.</p>
  {related&&<a className="fa-compare-link" href={`/compare?left=${encodeURIComponent(food.id)}&right=${encodeURIComponent(related.id)}`}><span><strong>Compare this recipe</strong><small>with {related.name}</small></span><ArrowRight size={19}/></a>}
  <div className="fa-detail-tabs" role="tablist" aria-label="Recipe information">
   <button type="button" id="recipe-input-tab" role="tab" aria-selected={tab==='ingredients'} aria-controls="recipe-input-panel" className={tab==='ingredients'?'active':''} onClick={()=>setTab('ingredients')}>Listed ingredients <span>{food.ingredients.length}</span></button>
   <button type="button" id="recipe-profile-tab" role="tab" aria-selected={tab==='profile'} aria-controls="recipe-profile-panel" className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}>Derived profile</button>
  </div>
  {tab==='ingredients'?<div id="recipe-input-panel" role="tabpanel" aria-labelledby="recipe-input-tab">
   <p className="fa-panel-hint">Source amounts, as listed. Select an ingredient to inspect its model marker.</p>
   <div className="fa-ingredient-table" tabIndex={0} aria-label="Scrollable source ingredient list">{food.ingredients.map((ingredient,index)=>{
    const particle=profile.particles.find(p=>p.ingredient===normalizeIngredient(ingredient.name));
    const highlighted=!!filter&&new RegExp(filter.match,'i').test(ingredient.name);
    return <button type="button" key={`${ingredient.name}-${index}`} className={highlighted?'highlight':''} onClick={()=>inspect(ingredient.name)} aria-label={`Inspect ${ingredient.name}, ${ingredient.amount||'amount not stated'}`}><span><i style={{backgroundColor:particle?.color??'#8b9992'}}/>{ingredient.name}</span><span>{ingredient.amount||'Not stated'}</span></button>;
   })}</div>
   <button type="button" className="fa-sketch-preview" onClick={()=>setTab('profile')}><span><strong>Ingredient-derived sketch</strong><span>Topography, particles and barcode</span></span><ArrowRight size={19}/></button>
  </div>:<div id="recipe-profile-panel" role="tabpanel" aria-labelledby="recipe-profile-tab" className="fa-output">
   <div className="fa-projection-tabs" role="group" aria-label="Profile projection">{(['topography','particles','barcode'] as const).map(projection=><button type="button" key={projection} aria-pressed={view===projection} className={view===projection?'active':''} onClick={()=>setView(projection)}>{projection[0].toUpperCase()+projection.slice(1)}</button>)}</div>
   <h4>Ingredient-derived sketch</h4>
   <AtlasProfile profile={profile} view={view} selectedId={selectedId} onSelect={setSelectedId}/>
   <p className="fa-model-note">Equal starting weights. Source quantities do not predict taste or intensity.</p>
   <div className="fa-particle-buttons" aria-label="Inspect an ingredient in the profile">{profile.particles.map(particle=><button type="button" key={particle.id} aria-pressed={selectedId===particle.id} onClick={()=>setSelectedId(particle.id)} className={selectedId===particle.id?'active':''}><i style={{backgroundColor:particle.color}}/>{particle.label}</button>)}</div>
   {selected&&<div className="fa-selected-particle"><div><strong>{selected.label}</strong><button type="button" aria-label="Clear profile selection" onClick={()=>setSelectedId(null)}><X size={14}/></button></div><p>{selected.mapped?`Rule-based cue: ${selected.descriptor.replace(/_/g,' ')}. This is a reading aid, not a measurement.`:'This ingredient is not mapped. Its neutral marker adds no field contribution.'}</p><button type="button" onClick={()=>onFollowIngredient(selected.label)}>Follow this ingredient on the map <ArrowRight size={14}/></button></div>}
  </div>}
  <div className="fa-provenance"><span>Snapshot · 11 Oct 2026</span><a href={food.sourceUrl} target="_blank" rel="noreferrer">View source <ArrowUpRight size={13}/></a></div>
  {food.originalSourceUrl&&<a className="fa-original-source" href={food.originalSourceUrl} target="_blank" rel="noreferrer">Original recipe source <ArrowUpRight size={12}/></a>}
 </section>;
}

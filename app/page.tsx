'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowRight, ArrowUpRight, Info, List, Map, Minus, Plus, Search, X} from 'lucide-react';
import dataset from '@/lib/atlas-foods.json';
import world from '@/lib/atlas-world.json';
import type {AtlasFood} from '@/lib/atlas-types';
import {ATLAS_TRAILS, areaAnchor, areaFrequency, hasTrail, mapPoint} from '@/lib/atlas-library';
import AtlasDetail, {relatedAtlasRecipe} from './atlas-detail';
import './atlas.css';

type Filter = {id:string;label:string;match:string};
const foods:AtlasFood[]=dataset.foods;
const areas=[...new Set(foods.map(food=>food.area))].sort((a,b)=>(areaAnchor(a)?.country??a).localeCompare(areaAnchor(b)?.country??b));
const ingredientNames=[...new Set(foods.flatMap(food=>food.ingredients.map(ingredient=>ingredient.name)))].sort();
const countryName=(area:string)=>areaAnchor(area)?.country??area;
const escapePattern=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const matches=(food:AtlasFood,filter:Filter|null)=>{
 if(!filter)return true;
 const trail=ATLAS_TRAILS.find(item=>item.id===filter.id);
 return trail?hasTrail(food,trail):food.ingredients.some(ingredient=>new RegExp(filter.match,'i').test(ingredient.name));
};

export default function FieldAtlas() {
 const [filter,setFilter]=useState<Filter|null>(ATLAS_TRAILS[0]);
 const [area,setArea]=useState('Malaysian');
 const [selected,setSelected]=useState('mealdb-53051');
 const [query,setQuery]=useState('');
 const [searchOpen,setSearchOpen]=useState(false);
 const [info,setInfo]=useState(false);
 const [zoom,setZoom]=useState(1);
 const [mapMode,setMapMode]=useState<'map'|'list'>('map');
 const region=useMemo(()=>foods.filter(food=>food.area===area),[area]);
 const matching=useMemo(()=>region.filter(food=>matches(food,filter)),[region,filter]);
 const active=foods.find(food=>food.id===selected);
 const comparisonFood=active??foods.find(food=>food.id==='mealdb-53051')!;
 const comparisonRecipe=useMemo(()=>relatedAtlasRecipe(comparisonFood,foods,filter),[comparisonFood,filter]);
 const comparisonHref=comparisonRecipe?`/compare?left=${encodeURIComponent(comparisonFood.id)}&right=${encodeURIComponent(comparisonRecipe.id)}`:'/compare';
 const globalMatches=useMemo(()=>foods.filter(food=>matches(food,filter)),[filter]);
 const counts=useMemo(()=>{
  const trail=ATLAS_TRAILS.find(item=>item.id===filter?.id);
  const frequencies=trail?areaFrequency(foods,trail):areas.map(sourceArea=>{
   const sample=foods.filter(food=>food.area===sourceArea);
   return {area:sourceArea,total:sample.length,matches:sample.filter(food=>matches(food,filter)).length};
  });
  return frequencies.map(count=>({...count,anchor:areaAnchor(count.area)}));
 },[filter]);
 const countsByIso=useMemo(()=>Object.fromEntries(counts.filter(count=>count.anchor).map(count=>[count.anchor!.iso,count])),[counts]);
 const changeArea=(next:string)=>{
  const candidates=foods.filter(food=>food.area===next&&matches(food,filter));
  setArea(next);setSelected(candidates.find(food=>food.id==='mealdb-53051')?.id??candidates[0]?.id??'');
  setQuery('');setSearchOpen(false);setZoom(1);
 };
 const changeFilter=(next:Filter|null)=>{
  setFilter(next);
  if(!region.some(food=>food.id===selected&&matches(food,next)))setSelected(region.find(food=>matches(food,next))?.id??'');
  setQuery('');setSearchOpen(false);
 };
 const chooseFood=(food:AtlasFood)=>{
  setArea(food.area);setSelected(food.id);
  if(!matches(food,filter))setFilter(null);
  setQuery('');setSearchOpen(false);setZoom(1);
 };
 const followIngredient=(name:string)=>{
  const trail=ATLAS_TRAILS.find(item=>item.label.toLowerCase()===name.toLowerCase());
  changeFilter(trail??{id:`exact:${name.toLowerCase()}`,label:name,match:`^${escapePattern(name)}$`});
 };
 useEffect(()=>{
  const recipeId=new URLSearchParams(window.location.search).get('recipe');
  const recipe=foods.find(food=>food.id===recipeId);
  if(recipe){setArea(recipe.area);setSelected(recipe.id);if(!matches(recipe,ATLAS_TRAILS[0]))setFilter(null);}
 },[]);
 const searchItems=useMemo(()=>{
  const term=query.trim().toLowerCase();
  const places=areas.filter(sourceArea=>countryName(sourceArea).toLowerCase().includes(term)||sourceArea.toLowerCase().includes(term)).map(value=>({type:'place' as const,value,label:countryName(value),note:`${foods.filter(food=>food.area===value).length} recipes`}));
  if(!term)return places.slice(0,8);
  const recipes=foods.filter(food=>food.name.toLowerCase().includes(term)).map(food=>({type:'recipe' as const,value:food.id,label:food.name,note:countryName(food.area)}));
  const ingredients=ingredientNames.filter(name=>name.toLowerCase().includes(term)).map(name=>({type:'ingredient' as const,value:name,label:name,note:'Ingredient'}));
  return [...places.slice(0,4),...recipes.slice(0,4),...ingredients.slice(0,4)].slice(0,10);
 },[query]);
 const chooseSearch=(item:typeof searchItems[number])=>{
  if(item.type==='place')changeArea(item.value);
  else if(item.type==='recipe'){const food=foods.find(food=>food.id===item.value);if(food)chooseFood(food);}
  else followIngredient(item.value);
 };
 const anchor=areaAnchor(area);
 const point=anchor?mapPoint(anchor.lon,anchor.lat):{x:500,y:235};
 const transform=zoom===1?'':`translate(${500-point.x*zoom},${235-point.y*zoom}) scale(${zoom})`;
 return <main className="fa-root">
  <header className="fa-header">
   <Link className="fa-brand" href="/" aria-label="Sifr Field Atlas"><strong className="fa-wordmark">sifr<span>°</span></strong><span>Field Atlas</span></Link>
   <nav aria-label="Atlas navigation"><span className="fa-nav-active" aria-current="page">Explore</span><Link className="fa-nav-compare" href={comparisonHref}>Compare</Link><button type="button" aria-expanded={info} aria-controls="atlas-explanation" onClick={()=>setInfo(!info)}><Info size={16}/> How to read this atlas</button></nav>
   <div className="fa-edition">{foods.length} recipes <span>·</span> {areas.length} places</div>
   <button type="button" className="fa-mobile-info" aria-label="How to read this atlas" aria-expanded={info} onClick={()=>setInfo(!info)}><Info size={19}/></button>
  </header>
  {info&&<div className="fa-info" id="atlas-explanation"><div><strong>A sample to explore, not a definitive food map.</strong><p>Colour shows matching recipes within our selected sample. Ingredient trails group related listed names, such as coconut milk and coconut cream. Place labels come from TheMealDB; they do not establish a dish’s origin. Recipes travel, overlap and change. Profiles are rule-based ingredient sketches with equal starting weights, not measured or predicted taste. Select an ingredient marker to follow its listed presence across this sample.</p><a href="https://www.themealdb.com/api.php" target="_blank" rel="noreferrer">About the recipe data <ArrowUpRight size={13}/></a></div><button type="button" aria-label="Close explanation" onClick={()=>setInfo(false)}><X size={19}/></button></div>}
  <section className="fa-workspace">
   <div className="fa-map-pane">
    <div className="fa-map-title"><div><h1>Follow an ingredient.</h1><p>Find the places and recipes it connects.</p></div>
     <div className="fa-place-search" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setSearchOpen(false);}}><Search size={17}/><input aria-label="Find a place, recipe or ingredient" aria-expanded={searchOpen} aria-controls="atlas-search-results" autoComplete="off" placeholder="Place, recipe, ingredient" value={query} onFocus={()=>setSearchOpen(true)} onChange={event=>{setQuery(event.target.value);setSearchOpen(true);}} onKeyDown={event=>{if(event.key==='Escape')setSearchOpen(false);if(event.key==='Enter'&&searchItems[0])chooseSearch(searchItems[0]);}}/>{searchOpen&&<div className="fa-search-results" id="atlas-search-results" aria-label="Search results">{searchItems.length?searchItems.map(item=><button type="button" key={`${item.type}-${item.value}`} onClick={()=>chooseSearch(item)}><strong>{item.label}</strong><span>{item.note}</span></button>):<p>No recipe, place or ingredient matches “{query}”. Try coconut, rice or Malaysia.</p>}</div>}</div>
    </div>
    <div className="fa-filters" aria-label="Ingredient trails"><span>Explore</span>{ATLAS_TRAILS.map(trail=><button type="button" key={trail.id} aria-pressed={filter?.id===trail.id} className={filter?.id===trail.id?'selected':''} onClick={()=>changeFilter(trail)}>{trail.label}</button>)}{filter&&!ATLAS_TRAILS.some(trail=>trail.id===filter.id)&&<button type="button" className="selected" aria-pressed="true" onClick={()=>changeFilter(null)}>{filter.label}<X size={12}/></button>}<button type="button" aria-pressed={!filter} className={!filter?'selected':''} onClick={()=>changeFilter(null)}>All recipes</button></div>
    <div className="fa-map-stage">
     <div className="fa-map-caption"><span className="fa-dot"/>{filter?`${filter.label} in the recipe sample`:'All sampled recipes'}<span>{globalMatches.length} of {foods.length} recipes</span></div>
     <div className="fa-map-mode" role="group" aria-label="Explore places using"><button type="button" aria-pressed={mapMode==='map'} className={mapMode==='map'?'active':''} onClick={()=>setMapMode('map')}><Map size={14}/> Map</button><button type="button" aria-pressed={mapMode==='list'} className={mapMode==='list'?'active':''} onClick={()=>setMapMode('list')}><List size={14}/> List</button></div>
     {mapMode==='map'?<div className="fa-world-viewport"><svg className="fa-world" viewBox="0 0 1000 470" aria-label="World map of ingredients in sampled recipes" role="group"><g transform={transform}>
      {[100,200,300,400].map(y=><path key={y} d={`M0 ${y}H1000`} stroke="#263631" strokeDasharray="2 7" strokeWidth=".7"/>)}
      {world.features.filter(feature=>feature.id!=='ATA').map(feature=>{
       const count=countsByIso[feature.id];const isActive=anchor?.iso===feature.id;
       // The accessible name stays on the path; avoid SVG title serialization during hydration.
       return <path key={`${feature.id}-${feature.name}`} d={feature.path} className={`fa-country${count?' populated':''}${isActive?' selected':''}`} fill={isActive?'#dfc99d':count?.matches?`rgba(149,172,160,${.18+.5*count.matches/count.total})`:'#182522'} stroke={isActive?'#f2dfba':'#42544c'} strokeWidth={isActive?1.25:.55} tabIndex={count?0:undefined} role={count?'button':undefined} aria-label={count?`${countryName(count.area)}, ${count.matches} of ${count.total} sampled recipes`:`${feature.name}, not sampled`} aria-pressed={count?isActive:undefined} onClick={()=>count&&changeArea(count.area)} onKeyDown={event=>{if(count&&(event.key==='Enter'||event.key===' ')){event.preventDefault();changeArea(count.area);}}}/>;
      })}
      <text x="182" y="300" className="fa-ocean-label">PACIFIC OCEAN</text><text x="402" y="265" className="fa-ocean-label">ATLANTIC</text><text x="650" y="350" className="fa-ocean-label">INDIAN OCEAN</text>
      {counts.filter(count=>count.anchor).map(count=>{
       const marker=mapPoint(count.anchor!.lon,count.anchor!.lat);const isActive=count.area===area;
       return <g key={count.area} className="fa-map-marker" onClick={()=>changeArea(count.area)} aria-hidden="true"><circle cx={marker.x} cy={marker.y} r="13" fill="transparent"/><circle cx={marker.x} cy={marker.y} r={isActive?4:count.matches?2.5:1.7} fill={isActive?'#e7e9e2':count.matches?'#bdcfc2':'#81968a'}/></g>;
      })}
      {anchor&&<g className="fa-map-callout" pointerEvents="none"><path d={`M${point.x} ${point.y}v43h${point.x>850?-62:62}`} stroke="#dfc99d" strokeWidth=".8" fill="none"/><text x={point.x+(point.x>850?-70:70)} y={point.y+42} textAnchor={point.x>850?'end':'start'} fill="#e7e9e2" fontSize="13">{countryName(area)}</text><text x={point.x+(point.x>850?-70:70)} y={point.y+60} textAnchor={point.x>850?'end':'start'} fill="#b0c1b6" fontSize="11">{matching.length} of {region.length} recipes</text></g>}
     </g></svg></div>:<div className="fa-place-list" aria-label="Sampled places">{counts.map(count=><button type="button" key={count.area} className={area===count.area?'active':''} onClick={()=>changeArea(count.area)}><span>{countryName(count.area)}</span><span>{count.matches} of {count.total}<ArrowRight size={14}/></span></button>)}</div>}
     {mapMode==='map'&&<><div className="fa-map-controls"><button type="button" aria-label="Zoom in around selected place" disabled={zoom>=2} onClick={()=>setZoom(Math.min(2,zoom+.25))}><Plus size={17}/></button><button type="button" aria-label="Zoom out" disabled={zoom<=1} onClick={()=>setZoom(Math.max(1,zoom-.25))}><Minus size={17}/></button></div><div className="fa-map-legend"><div><i className="fa-swatch empty"/>Not sampled / no match</div><div><span className="fa-scale"><i/><i/><i/><i/></span>Share within sample</div><div><i className="fa-swatch gold"/>Selected place</div></div></>}
    </div>
    <div className="fa-map-bottom"><p><strong>One ingredient. Many versions.</strong><br/>Select a place to explore its recipes, or start with an ingredient.</p><div><p>{foods.length} source snapshots. {areas.length} places.</p><a href={dataset.meta.sourceUrl} target="_blank" rel="noreferrer">Recipe data: TheMealDB <ArrowUpRight size={13}/></a></div></div>
   </div>
   <aside className="fa-drawer" aria-label="Selected place and recipe">
    <div className="fa-region" aria-live="polite"><div className="fa-region-title"><h2>{countryName(area)}</h2><span>{region.length} recipes</span></div><p>{filter?<><strong>{matching.length} of {region.length}</strong> sampled recipes match {filter.label.toLowerCase()}.</>:<>Browse the {region.length} recipes in this sample.</>}</p></div>
    <div className="fa-recipe-list">{matching.length?matching.map(food=><button type="button" key={food.id} className={selected===food.id?'active':''} aria-pressed={selected===food.id} onClick={()=>setSelected(food.id)}><span>{food.name}<small>{food.category} · TheMealDB #{food.id.replace('mealdb-','')}</small></span><ArrowRight size={17}/></button>):<div className="fa-empty"><p>No sampled recipes here match {filter?.label.toLowerCase()}.</p><button type="button" onClick={()=>changeFilter(null)}>Show all {region.length} recipes</button></div>}</div>
    {active&&<AtlasDetail food={active} foods={foods} filter={filter} onFollowIngredient={followIngredient}/>}
   </aside>
  </section>
  <footer className="fa-footer"><span>Food crosses borders. This map shows a recipe sample, not cultural ownership.</span><span><a href={world.sourceUrl} target="_blank" rel="noreferrer">Natural Earth</a><span>·</span><Link href="/instrument">Original instrument</Link><span>·</span><a href="https://github.com/shariffster/sifr-atlas" target="_blank" rel="noreferrer">Source</a><span>·</span>v0.3.0</span></footer>
 </main>;
}

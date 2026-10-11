'use client';

import {useMemo,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Check,RotateCcw} from 'lucide-react';
import AtlasProfile from '@/app/atlas-profile';
import dataset from '@/lib/atlas-foods.json';
import type {AtlasFood} from '@/lib/atlas-types';
import {buildAtlasProfile,normalizeIngredient} from '@/lib/sifr-atlas-model';
import './compare.css';

type Side='left'|'right';
type View='topography'|'particles'|'barcode';
type Filter='all'|'shared'|'different';
type Occurrence=AtlasFood['ingredients'][number];
type IngredientRow={id:string;name:string;left:Occurrence[];right:Occurrence[];shared:boolean};
const foods:AtlasFood[]=[...dataset.foods].sort((a,b)=>a.name.localeCompare(b.name));
const findFood=(id:string|undefined,fallback:string)=>foods.find(f=>f.id===id)??foods.find(f=>f.id===fallback)??foods[0];

function sourceRows(food:AtlasFood){
  const rows=new Map<string,Occurrence[]>();
  for(const ingredient of food.ingredients){
    const key=normalizeIngredient(ingredient.name);
    rows.set(key,[...(rows.get(key)??[]),ingredient]);
  }
  return rows;
}

function SourceAmounts({occurrences}:{occurrences:Occurrence[]}){
  if(!occurrences.length)return <span className="compare-absent">Not listed</span>;
  return <>{occurrences.map((item,index)=><span className="compare-source-amount" key={`${item.name}-${index}`}><span>{item.amount.trim()||'Amount not specified'}</span><small>{item.name}{occurrences.length>1?` · source entry ${index+1}`:''}</small></span>)}</>;
}

export default function CompareRecipes({initialLeftId,initialRightId}:{initialLeftId?:string;initialRightId?:string}){
  const [leftId,setLeftId]=useState(()=>findFood(initialLeftId,'mealdb-53051').id);
  const [rightId,setRightId]=useState(()=>findFood(initialRightId,'mealdb-53195').id);
  const [view,setView]=useState<View>('topography');
  const [filter,setFilter]=useState<Filter>('all');
  const [selectedId,setSelectedId]=useState<string|null>(()=>{
    const a=sourceRows(findFood(initialLeftId,'mealdb-53051'));
    const b=sourceRows(findFood(initialRightId,'mealdb-53195'));
    const first=a.has('coconut milk')||b.has('coconut milk')?'coconut milk':[...a.keys()].find(id=>b.has(id));
    return first?`ingredient:${first}`:null;
  });
  const [activeSide,setActiveSide]=useState<Side>('left');
  const [weights,setWeights]=useState<Record<Side,Record<string,number>>>({left:{},right:{}});
  const [showOriginal,setShowOriginal]=useState(true);
  const left=foods.find(f=>f.id===leftId)!;
  const right=foods.find(f=>f.id===rightId)!;
  const originalLeft=useMemo(()=>buildAtlasProfile(left),[left]);
  const originalRight=useMemo(()=>buildAtlasProfile(right),[right]);
  const variationLeft=useMemo(()=>buildAtlasProfile(left,weights.left),[left,weights.left]);
  const variationRight=useMemo(()=>buildAtlasProfile(right,weights.right),[right,weights.right]);
  const profileLeft=showOriginal?originalLeft:variationLeft;
  const profileRight=showOriginal?originalRight:variationRight;
  const hasVariation=variationLeft.hasOverrides||variationRight.hasOverrides;
  const rows=useMemo(()=>{
    const a=sourceRows(left),b=sourceRows(right);
    return [...new Set([...a.keys(),...b.keys()])].map(id=>({id,name:(a.get(id)??b.get(id))![0].name,left:a.get(id)??[],right:b.get(id)??[],shared:a.has(id)&&b.has(id)})).sort((a,b)=>Number(b.shared)-Number(a.shared)||a.name.localeCompare(b.name)) satisfies IngredientRow[];
  },[left,right]);
  const sharedCount=rows.filter(row=>row.shared).length;
  const filteredRows=rows.filter(row=>filter==='all'||(filter==='shared'?row.shared:!row.shared));
  const selectedLeft=profileLeft.particles.find(p=>p.id===selectedId);
  const selectedRight=profileRight.particles.find(p=>p.id===selectedId);
  const selected=selectedLeft??selectedRight;
  const editable=activeSide==='left'?selectedLeft:selectedRight;
  const currentWeight=selectedId?(weights[activeSide][selectedId]??1):1;
  const invalidRequest=Boolean((initialLeftId&&!foods.some(f=>f.id===initialLeftId))||(initialRightId&&!foods.some(f=>f.id===initialRightId)));

  function chooseRecipe(side:Side,id:string){
    if(side==='left')setLeftId(id);else setRightId(id);
    const next=foods.find(food=>food.id===id)!;
    const other=side==='left'?right:left;
    if(selectedId&&![...next.ingredients,...other.ingredients].some(ingredient=>`ingredient:${normalizeIngredient(ingredient.name)}`===selectedId))setSelectedId(null);
    setWeights(previous=>({...previous,[side]:{}}));
    setShowOriginal(false);
    const url=new URL(window.location.href);
    url.searchParams.set('left',side==='left'?id:leftId);
    url.searchParams.set('right',side==='right'?id:rightId);
    window.history.replaceState(window.history.state,'',url);
  }

  function selectIngredient(id:string){
    setSelectedId(id);
    const inLeft=originalLeft.particles.some(p=>p.id===id);
    const inRight=originalRight.particles.some(p=>p.id===id);
    if(activeSide==='left'&&!inLeft&&inRight)setActiveSide('right');
    if(activeSide==='right'&&!inRight&&inLeft)setActiveSide('left');
  }

  function changeWeight(value:number){
    if(!selectedId||!editable?.mapped)return;
    setWeights(previous=>({...previous,[activeSide]:{...previous[activeSide],[selectedId]:value}}));
    setShowOriginal(false);
  }

  return <main className="sifr-compare">
    <header className="compare-nav">
      <a className="compare-logo" href={`/?recipe=${left.id}`} aria-label="Sifr Atlas">sifr<span>°</span></a>
      <nav aria-label="Main navigation"><a href={`/?recipe=${left.id}`}>Atlas</a><a href="/compare" aria-current="page">Compare recipes</a><a href="#comparison-method">Method</a></nav>
      <a className="compare-return" href={`/?recipe=${left.id}`}><ArrowLeft size={14}/>Back to Atlas</a>
    </header>

    <section className="compare-intro" aria-labelledby="compare-title">
      <div><h1 id="compare-title">Shared ingredients. <span>Different expressions.</span></h1><p>Look closely at two recorded recipes. Follow an ingredient between them.</p></div>
      <div className="compare-views" role="group" aria-label="Profile view">{(['topography','particles','barcode'] as const).map(item=><button type="button" key={item} aria-pressed={view===item} onClick={()=>setView(item)}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div>
    </section>

    {invalidRequest&&<p className="compare-notice" role="status">A requested recipe is not in this sample. A starting recipe is shown; choose any recipe below.</p>}

    <section className="compare-pair" aria-label="Two recipe profiles">
      {([{side:'left',food:left,profile:profileLeft,selection:selectedLeft},{side:'right',food:right,profile:profileRight,selection:selectedRight}] as const).map(({side,food,profile,selection})=><article className="compare-recipe" key={side}>
        <div className="compare-recipe-head">
          <div><label className="sr-only" htmlFor={`recipe-${side}`}>{side==='left'?'First recipe':'Second recipe'}</label><select id={`recipe-${side}`} value={food.id} title={food.name} onChange={event=>chooseRecipe(side,event.target.value)}>{foods.map(recipe=><option key={recipe.id} value={recipe.id}>{recipe.name} · {recipe.area}</option>)}</select><p>{food.area} source label <span>·</span> One recorded version</p></div>
          <a className="compare-source-icon" href={food.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open TheMealDB source for ${food.name}`}><ArrowUpRight size={19}/></a>
        </div>
        <AtlasProfile profile={profile} view={view} selectedId={selectedId} onSelect={selectIngredient}/>
        <div className="compare-profile-caption"><span>{profile.methodLabel}</span><span>{profile.ingredientCount} ingredients{profile.hasOverrides?' · Variation':''}</span></div>
        <div className="compare-colourband" aria-label={`${food.name} ingredients`}>{profile.particles.map(particle=><button type="button" key={particle.id} aria-label={`Select ${particle.label} in ${food.name}`} aria-pressed={selectedId===particle.id} title={`${particle.label}${particle.mapped?'':' · unmapped'}`} style={{background:particle.color,opacity:selectedId&&selectedId!==particle.id?.45:1}} onClick={()=>selectIngredient(particle.id)}/>)}</div>
        <p className="compare-selection-status">{selection?<><span className="compare-selection-dot" style={{background:selection.color}}/>{selection.label}<span>{selection.mapped?`${selection.intensity.toFixed(1)}× model weight`:'Unmapped ingredient'}</span></>:selected?<>{selected.label}<span>Not listed in this recipe</span></>:'Select an ingredient in either profile or the table.'}</p>
      </article>)}
    </section>

    <section className="compare-experiment" aria-labelledby="weight-heading">
      <div className="compare-experiment-heading"><h2 id="weight-heading">A small what-if</h2><p>{selected?<>Change the sketch’s weight for <strong>{selected.label}</strong>.</>:'Select an ingredient to explore its contribution.'}</p></div>
      <div className="compare-weight-controls">
        <label className="compare-side-label" htmlFor="weight-recipe">In<select id="weight-recipe" value={activeSide} onChange={event=>setActiveSide(event.target.value as Side)}><option value="left">{left.name}</option><option value="right">{right.name}</option></select></label>
        <div className="compare-range"><label htmlFor="model-weight">Model weight <output htmlFor="model-weight">{currentWeight.toFixed(1)}×</output></label><input id="model-weight" type="range" min="0" max="2" step="0.1" value={currentWeight} disabled={!editable?.mapped} aria-describedby="weight-explanation" onChange={event=>changeWeight(Number(event.target.value))}/><div aria-hidden="true"><span>0×</span><span>1× original</span><span>2×</span></div></div>
        <div className="compare-variation-actions"><div role="group" aria-label="Displayed model"><button type="button" aria-pressed={showOriginal} onClick={()=>setShowOriginal(true)}>Original</button><button type="button" aria-pressed={!showOriginal} onClick={()=>setShowOriginal(false)}>Variation</button></div><button type="button" disabled={!hasVariation} onClick={()=>{setWeights({left:{},right:{}});setShowOriginal(true);}}><RotateCcw size={13}/>Reset</button></div>
      </div>
      <p id="weight-explanation" className="compare-weight-note">{!editable&&selected?'This ingredient is not listed in the chosen recipe. Select the other recipe to adjust it. ':editable&&!editable.mapped?'This ingredient is unmapped, so no field contribution is assigned. ':''}Equal starting weights. This changes the drawing, not source amounts or a prediction of taste.{showOriginal&&hasVariation?' Original sketches are displayed; your variation is kept.':''}</p>
    </section>

    <section className="compare-ingredients" aria-labelledby="ingredient-heading">
      <div className="compare-ledger-head"><div><h2 id="ingredient-heading">Read the ingredients</h2><p>{sharedCount} shared names <span>·</span> Quantities exactly as recorded in each source</p></div><div className="compare-filters" role="group" aria-label="Ingredient filter">{([{id:'all',label:'All',count:rows.length},{id:'shared',label:'Shared',count:sharedCount},{id:'different',label:'Different',count:rows.length-sharedCount}] as const).map(item=><button type="button" key={item.id} aria-pressed={filter===item.id} onClick={()=>setFilter(item.id)}>{item.label} <span>{item.count}</span></button>)}</div></div>
      <table className="compare-ledger"><caption className="sr-only">All ingredient source entries, aligned by normalised name. Repeated source entries are displayed separately and not added together.</caption><thead><tr><th scope="col">Ingredient</th><th scope="col">{left.name}</th><th scope="col">{right.name}</th></tr></thead><tbody>{filteredRows.length?filteredRows.map(row=><tr key={row.id} className={selectedId===`ingredient:${row.id}`?'is-selected':undefined}><th scope="row"><button type="button" aria-pressed={selectedId===`ingredient:${row.id}`} onClick={()=>selectIngredient(`ingredient:${row.id}`)}><span>{row.name}<small>{row.shared?'Shared':'In one recipe'}</small></span>{selectedId===`ingredient:${row.id}`&&<Check size={14} aria-hidden="true"/>}</button></th><td><SourceAmounts occurrences={row.left}/></td><td><SourceAmounts occurrences={row.right}/></td></tr>):<tr><td colSpan={3} className="compare-empty">{filter==='shared'?'No shared ingredient names in this pair.':'Every ingredient name is shared in this pair.'} Choose All to see the source lists.</td></tr>}</tbody></table>
      <div className="compare-source-links">{[left,right].map((food,index)=><div key={`${food.id}-${index}`}><span>{food.name}</span><a href={food.sourceUrl} target="_blank" rel="noreferrer">TheMealDB record <ArrowUpRight size={12}/></a>{food.originalSourceUrl&&<a href={food.originalSourceUrl} target="_blank" rel="noreferrer">Original recipe <ArrowUpRight size={12}/></a>}</div>)}</div>
    </section>

    <details id="comparison-method" className="compare-method"><summary>How to read this comparison</summary><div><p>Ingredients are the inputs. Each profile gives unique normalised ingredient names equal starting weights, using an authored descriptor layout. Coordinates and height scale stay fixed between recipes and views. Unknown ingredients remain visible as unmapped markers.</p><p>Source quantities are displayed as text, including repeated entries. Spelling and simple name variants are aligned for comparison; this is ingredient overlap, not measured flavour similarity. The sketches do not model proportions, preparation or serving conditions, and cannot establish sensory differences between recipes with the same ingredients.</p><p>The library contains {foods.length} indexed recipes from TheMealDB. Source-area labels offer context, not exclusive cultural ownership or a definitive version of a cuisine. A future sensory profile would need preparation records and tasting evidence.</p></div></details>
    <footer className="compare-footer"><a href={`/?recipe=${left.id}`}><ArrowLeft size={14}/>Keep exploring the Atlas</a><p>Ingredients are the inputs. Recipes carry the context.</p><span>Sifr · 0.3.1</span></footer>
  </main>;
}

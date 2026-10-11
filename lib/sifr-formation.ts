import {SIFR, color, contribution, isCommon, DOMAIN, type DishKey, type CompareMode, type ViewKey} from './sifr';
import {ease, mix, noise} from './sifr-motion';
import {GRID, CONTOUR_GRID, rgb} from './sifr-scene';

// Transient presentation weights. Source records are never edited or copied back.
export type FormationTarget = {dish:DishKey;layer:string;mode:CompareMode;view:ViewKey;isolateId?:string;prominence?:number[]};
export type VisualState = {amplitude:number[];visibility:number[];prominence:number[];compare:number;difference:number;relief:number;barcode:number};
export const sharedPartner = SIFR.particles.map(p=>isCommon(p)?SIFR.particles.findIndex(q=>q.dish!==p.dish&&q.label===p.label):-1);
export function targetState(target:FormationTarget):VisualState {
 const included=SIFR.particles.map(p=>(target.dish==='compare'||p.dish===target.dish));
 const active=SIFR.particles.map((p,i)=>included[i]&&(target.layer==='all'||p.layer.split('/').includes(target.layer))&&
  (target.dish!=='compare'||target.mode!=='common'||isCommon(p))&&(!target.isolateId||p.id===target.isolateId));
 return {amplitude:active.map(Number),visibility:active.map((a,i)=>a?1:included[i]&&!target.isolateId?.15:0),prominence:SIFR.particles.map((_,i)=>target.prominence?.[i]??1),compare:target.dish==='compare'?1:0,
  difference:target.dish==='compare'&&target.mode==='difference'&&!target.isolateId?1:0,relief:target.view==='topography'?1:0,barcode:target.view==='barcode'?1:0};
}
export const copyVisual=(s:VisualState):VisualState=>({...s,amplitude:[...s.amplitude],visibility:[...s.visibility],prominence:[...s.prominence]});
export function interpolateVisual(from:VisualState,to:VisualState,progress:number):VisualState {
 const t=ease(progress);
 // Shared pairs use identical timing, keeping their combined presence continuous.
 const at=(i:number)=>sharedPartner[i]>=0?t:ease((progress-noise(i+8)*.055)/(1-noise(i+8)*.055));
 return {amplitude:to.amplitude.map((v,i)=>mix(from.amplitude[i],v,at(i))),visibility:to.visibility.map((v,i)=>mix(from.visibility[i],v,at(i))),prominence:to.prominence.map((v,i)=>mix(from.prominence[i],v,t)),
  compare:mix(from.compare,to.compare,t),difference:mix(from.difference,to.difference,t),relief:mix(from.relief,to.relief,t),barcode:mix(from.barcode,to.barcode,t)};
}
export const transitionDuration=(previous:FormationTarget|null,next:FormationTarget,replay=false)=>!previous||replay||previous.dish!==next.dish?1750:previous.view!==next.view?1150:650;

const span=DOMAIN.max-DOMAIN.min;
const cloud=Array.from({length:(GRID+1)**2},(_,k)=>({x:DOMAIN.min+((k%(GRID+1))+(noise(k+1)-.5)*.36)/GRID*span,y:DOMAIN.min+(Math.floor(k/(GRID+1))+(noise(k+19)-.5)*.36)/GRID*span,phase:noise(k+31)*Math.PI*2}));
const vertices=Array.from({length:(CONTOUR_GRID+1)**2},(_,k)=>({x:DOMAIN.min+(k%(CONTOUR_GRID+1))/CONTOUR_GRID*span,y:DOMAIN.min+Math.floor(k/(CONTOUR_GRID+1))/CONTOUR_GRID*span,phase:0}));
export const CLOUD_COUNT=cloud.length;
export const VERTEX_OFFSET=CLOUD_COUNT;
export const MARKER_OFFSET=CLOUD_COUNT+vertices.length;
export const FIELD_NODES=[...cloud,...vertices,...SIFR.particles.map(p=>({x:p.x,y:p.y,phase:0}))];
// Expensive Gaussian evaluations happen once, never inside an animation frame.
const kernels=SIFR.particles.map(p=>Float64Array.from(FIELD_NODES,v=>contribution(p,v.x,v.y)));
const colors=SIFR.particles.map(p=>rgb(color(p)));
const dishIndex=SIFR.particles.map(p=>p.dish===SIFR.dishes[0].id?0:1);
export type FieldFrame={z:Float64Array;ink:Float64Array;r:Float64Array;g:Float64Array;b:Float64Array;share:Float64Array;owner:Int16Array};
const frame=():FieldFrame=>({z:new Float64Array(FIELD_NODES.length),ink:new Float64Array(FIELD_NODES.length),r:new Float64Array(FIELD_NODES.length),g:new Float64Array(FIELD_NODES.length),b:new Float64Array(FIELD_NODES.length),share:new Float64Array(FIELD_NODES.length),owner:new Int16Array(FIELD_NODES.length)});
export const createFieldFrames=()=>[frame(),frame()];
export function evaluateField(state:VisualState,frames:FieldFrame[],focusIds:string[]=[]){
 const focused=SIFR.particles.map(p=>focusIds.includes(p.id));
 const participating=SIFR.particles.flatMap((_,i)=>state.amplitude[i]||state.visibility[i]?[i]:[]);
 for(let k=0;k<FIELD_NODES.length;k++){
  let za=0,zb=0,ia=0,ib=0,ra=0,rb=0,ga=0,gb=0,ba=0,bb=0,fa=0,fb=0,ma=0,mb=0,oa=-1,ob=-1;
  for(const i of participating){
   const base=kernels[i][k]*state.prominence[i],height=base*state.amplitude[i],ink=base*state.visibility[i];
   if(dishIndex[i]===0){za+=height;ia+=ink;ra+=ink*colors[i][0];ga+=ink*colors[i][1];ba+=ink*colors[i][2];if(focused[i])fa+=ink;if(ink>ma){ma=ink;oa=i;}}
   else {zb+=height;ib+=ink;rb+=ink*colors[i][0];gb+=ink*colors[i][1];bb+=ink*colors[i][2];if(focused[i])fb+=ink;if(ink>mb){mb=ink;ob=i;}}
  }
  const da=mix(za,Math.max(0,za-zb),state.difference),db=mix(zb,Math.max(0,zb-za),state.difference),blend=1-state.compare;
  const a=frames[0],b=frames[1],sum=ia+ib*blend;
  a.z[k]=da+db*blend;a.ink[k]=sum;a.r[k]=sum?(ra+rb*blend)/sum:130;a.g[k]=sum?(ga+gb*blend)/sum:150;a.b[k]=sum?(ba+bb*blend)/sum:145;a.share[k]=sum?(fa+fb*blend)/sum:0;a.owner[k]=ma>=mb*blend?oa:ob;
  b.z[k]=db*state.compare;b.ink[k]=ib*state.compare;b.r[k]=ib?rb/ib:130;b.g[k]=ib?gb/ib:150;b.b[k]=ib?bb/ib:145;b.share[k]=ib?fb/ib:0;b.owner[k]=ob;
 }
 return frames;
}
// Marker presence merges a same-named pair for a single dish; Compare splits it.
export function markerPresence(state:VisualState,index:number){
 const partner=sharedPartner[index];
 if(partner<0)return state.visibility[index];
 if(index<partner)return mix(Math.min(1,state.visibility[index]+state.visibility[partner]),state.visibility[index],state.compare);
 return state.visibility[index]*state.compare;
}

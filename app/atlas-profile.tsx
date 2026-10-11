'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {atlasBarcode,ATLAS_SIGMA,type AtlasParticle,type AtlasProfileModel} from '@/lib/sifr-atlas-model';

export type AtlasProfileProps={profile:AtlasProfileModel;view:'topography'|'particles'|'barcode';selectedId:string|null;onSelect:(id:string)=>void};
type Marker=AtlasParticle&{presence:number};
type RenderState={field:Float32Array;markers:Marker[];mix:[number,number,number]};
type Hit={id:string;x:number;y:number;left?:number;right?:number;top?:number;bottom?:number};
const GRID=40,COUNT=(GRID+1)**2;
const nodes=Array.from({length:COUNT},(_,i)=>({x:-.08+(i%(GRID+1))/GRID*1.16,y:-.08+Math.floor(i/(GRID+1))/GRID*1.16}));
const kernels=new Map<string,Float32Array>();
const rgb=(color:string)=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const eased=(t:number)=>t===1?1:1-Math.pow(2,-8*t);
function kernel(p:AtlasParticle){
 let values=kernels.get(p.id);
 if(!values){values=Float32Array.from(nodes,q=>p.mapped?Math.exp(-((q.x-p.x)**2+(q.y-p.y)**2)/(2*ATLAS_SIGMA**2)):0);if(kernels.size>=256)kernels.delete(kernels.keys().next().value!);kernels.set(p.id,values);}
 return values;
}
function makeField(particles:AtlasParticle[]){
 const result=new Float32Array(COUNT*4),sources=particles.map(p=>({p,k:kernel(p),color:rgb(p.color)}));
 for(let i=0;i<COUNT;i++){
  let z=0,r=0,g=0,b=0;
  for(const source of sources){const weight=source.k[i]*source.p.intensity;z+=weight;r+=weight*source.color[0];g+=weight*source.color[1];b+=weight*source.color[2];}
  result[i*4]=z;result[i*4+1]=z?r/z:139;result[i*4+2]=z?g/z:153;result[i*4+3]=z?b/z:146;
 }
 return result;
}
const projection=(view:AtlasProfileProps['view']):[number,number,number]=>view==='topography'?[1,0,0]:view==='particles'?[0,1,0]:[0,0,1];

export function AtlasProfile({profile,view,selectedId,onSelect}:AtlasProfileProps){
 const canvas=useRef<HTMLCanvasElement>(null),displayed=useRef<RenderState|null>(null),hits=useRef<Hit[]>([]);
 const [motion,setMotion]=useState(true),[reduced,setReduced]=useState(false);
 const targetField=useMemo(()=>makeField(profile.particles),[profile]);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const context=el.getContext('2d');if(!context)return;
  const targetMix=projection(view),targetMarkers=profile.particles.map(p=>({...p,presence:1}));
  const from=displayed.current??{field:new Float32Array(COUNT*4),markers:targetMarkers.map(p=>({...p,presence:0})),mix:targetMix};
  const fromMarkers=new Map(from.markers.map(p=>[p.id,p])),toMarkers=new Map(targetMarkers.map(p=>[p.id,p]));
  const ids=[...new Set([...fromMarkers.keys(),...toMarkers.keys()])];
  let animation=0,start=0,visible=true,lastWidth=0,lastHeight=0,finished=false;
  const duration=motion&&!reduced?380:0;
  const draw=(progress:number)=>{
   const box=el.getBoundingClientRect(),w=box.width,h=box.height;if(!w||!h)return;
   const dpr=Math.min(window.devicePixelRatio||1,1.7);
   if(lastWidth!==w||lastHeight!==h){el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);lastWidth=w;lastHeight=h;}
   context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,w,h);
   const t=progress===1?1:eased(progress),values=new Float32Array(COUNT*4);
   for(let i=0;i<values.length;i++)values[i]=mix(from.field[i]??0,targetField[i],t);
   const markers=ids.map(id=>{const a=fromMarkers.get(id),b=toMarkers.get(id),p=b??a!;return{...p,intensity:mix(a?.intensity??0,b?.intensity??0,t),presence:mix(a?.presence??0,b?1:0,t)};}).filter(p=>p.presence>.001);
   const blend=targetMix.map((v,i)=>mix(from.mix[i],v,t)) as [number,number,number];
   displayed.current={field:values,markers,mix:blend};
   el.dataset.phase=progress===1?'settled':'forming';el.dataset.view=view;el.dataset.ingredients=String(profile.ingredientCount);
   const relief=blend[0],bands=blend[2],spatial=1-bands,scale=Math.min(w*.73,h*1.17);
   const project=(x:number,y:number,z=0)=>({x:w*.48+((x-.5)*.985+(y-.5)*.173)*scale,y:h*.61+(-(x-.5)*.173+(y-.5)*.985)*scale*.52-Math.log1p(Math.max(0,z))*scale*.21});
   const line=(points:{x:number;y:number}[])=>{context.beginPath();points.forEach((p,i)=>i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));};
   context.globalAlpha=spatial;context.strokeStyle='#819b8c25';context.lineWidth=.7;
   for(let i=0;i<=5;i++){line([project(0,i/5),project(1,i/5)]);context.stroke();line([project(i/5,0),project(i/5,1)]);context.stroke();}
   // Same fixed sampling lattice and height compression for every recipe.
   const selectedParticle=profile.particles.find(p=>p.id===selectedId),selectedKernel=selectedParticle?.mapped?kernel(selectedParticle):undefined;
   for(let i=0;i<COUNT;i++){
    const z=values[i*4];if(z<.012)continue;const point=project(nodes[i].x,nodes[i].y,z*relief);
    const focus=selectedId?Math.min(1,(selectedKernel?selectedKernel[i]*(selectedParticle?.intensity??0):0)/Math.max(.001,z)):1;
    context.globalAlpha=spatial*(.24+.76*relief)*Math.min(.9,z*.65)*(!selectedId?1:.26+.74*focus);
    context.fillStyle=`rgb(${Math.round(values[i*4+1])},${Math.round(values[i*4+2])},${Math.round(values[i*4+3])})`;
    const size=w<480?1.6:1.8;context.fillRect(point.x-size/2,point.y-size/2,size,size);
   }
   if(relief>.01&&spatial>.01){
    context.globalAlpha=spatial*relief*(selectedId?.60:.68);context.strokeStyle='#c5d3b7';context.lineWidth=.85;
    for(const level of [.2,.45,.8,1.2,1.8,2.6,3.8]){
     context.beginPath();
     for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
      const k=y*(GRID+1)+x,corners=[k,k+1,k+GRID+2,k+GRID+1],cross:{x:number;y:number}[]=[];
      for(let edge=0;edge<4;edge++){const ai=corners[edge],bi=corners[(edge+1)%4],az=values[ai*4],bz=values[bi*4];if((az<level)!==(bz<level)){const f=(level-az)/(bz-az);cross.push(project(mix(nodes[ai].x,nodes[bi].x,f),mix(nodes[ai].y,nodes[bi].y,f),level*relief));}}
      for(let i=0;i+1<cross.length;i+=2){context.moveTo(cross[i].x,cross[i].y);context.lineTo(cross[i+1].x,cross[i+1].y);}
     }context.stroke();
    }
   }
   const ordered=atlasBarcode(markers),total=ordered.reduce((sum,p)=>sum+(.35+p.intensity)*p.presence,0);
   const rectangles=new Map<string,{left:number;right:number;top:number;bottom:number}>();let left=22;
   const barTop=h*.29,barHeight=h*.43;
   for(const p of ordered){
    const width=total?(w-44)*(.35+p.intensity)*p.presence/total:0;
    rectangles.set(p.id,{left,right:left+width,top:barTop,bottom:barTop+barHeight});
    context.globalAlpha=bands*p.presence*(selectedId&&selectedId!==p.id?.28:1);context.fillStyle=p.color;
    context.fillRect(left+1,barTop,Math.max(0,width-2),barHeight);
    if(p.id===selectedId){context.globalAlpha=bands;context.strokeStyle='#f3e4c1';context.lineWidth=1.5;context.strokeRect(left-.5,barTop-3,Math.max(0,width+1),barHeight+6);}
    left+=width;
   }
   hits.current=[];
   const nearestField=(x:number,y:number)=>{const ix=Math.max(0,Math.min(GRID,Math.round((x+.08)/1.16*GRID))),iy=Math.max(0,Math.min(GRID,Math.round((y+.08)/1.16*GRID)));return values[(iy*(GRID+1)+ix)*4];};
   for(const p of markers){
    const point=project(p.x,p.y,nearestField(p.x,p.y)*relief),rectangle=rectangles.get(p.id);
    if(rectangle){point.x=mix(point.x,(rectangle.left+rectangle.right)/2,bands);point.y=mix(point.y,(rectangle.top+rectangle.bottom)/2,bands);}
    const selected=p.id===selectedId,r=3.5+Math.sqrt(p.intensity)*2.5;
    context.globalAlpha=p.presence*spatial*(selectedId&&!selected?.5:1);context.fillStyle='#0b1112';context.strokeStyle=p.color;context.lineWidth=selected?2:1.3;
    context.beginPath();context.arc(point.x,point.y,r,0,Math.PI*2);context.fill();context.stroke();
    if(selected){context.strokeStyle='#f3e4c1';context.lineWidth=1.2;context.beginPath();context.arc(point.x,point.y,r+5,0,Math.PI*2);context.stroke();}
    if(selected&&p.presence>.5){
     const label=p.label+(p.mapped?'':' · unmapped');context.globalAlpha=1;context.font='13px Arial, sans-serif';
     const maxWidth=w-32;let shown=label;while(context.measureText(shown).width>maxWidth&&shown.length>2)shown=shown.slice(0,-2)+'…';
     const textWidth=context.measureText(shown).width,textX=Math.max(16,Math.min(w-textWidth-16,point.x+14));
     const textY=bands>.5?barTop-18:Math.max(48,Math.min(h-46,point.y-r-17));
     context.fillStyle='#0b1112e8';context.fillRect(textX-5,textY-15,textWidth+10,22);context.fillStyle='#e7e9e2';context.fillText(shown,textX,textY);
    }
    if(toMarkers.has(p.id))hits.current.push({id:p.id,x:point.x,y:point.y,...(bands>.65?rectangle:{})});
   }
   context.globalAlpha=1;context.font='11px Arial, sans-serif';context.fillStyle='#aebbaa';
   context.fillText(profile.unmappedCount?`${profile.unmappedCount} unmapped · neutral markers; no field contribution`:'Fixed ingredient layout · equal starting contributions',14,h-15,w-28);
   if(!profile.ingredientCount){context.textAlign='center';context.font='15px Arial, sans-serif';context.fillText('No ingredient records in this recipe.',w/2,h/2);context.textAlign='left';}
   finished=progress===1;
  };
  const tick=(time:number)=>{if(document.hidden||!visible){animation=0;return;}if(!start)start=time;const progress=duration?Math.min(1,(time-start)/duration):1;draw(progress);if(progress<1)animation=requestAnimationFrame(tick);else animation=0;};
  const schedule=()=>{if(!animation&&!finished&&visible&&!document.hidden)animation=requestAnimationFrame(tick);};
  const resize=new ResizeObserver(()=>{const bounds=el.getBoundingClientRect();if(bounds.width!==lastWidth||bounds.height!==lastHeight)draw(finished?1:0);});resize.observe(el);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(animation);animation=0;}});intersection.observe(el);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(animation);animation=0;}else schedule();};document.addEventListener('visibilitychange',visibility);
  schedule();
  return()=>{cancelAnimationFrame(animation);resize.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);};
 },[profile,targetField,view,selectedId,motion,reduced]);
 const selected=profile.particles.find(p=>p.id===selectedId);
 return <div className="atlas-profile" style={{position:'relative',width:'100%',height:'clamp(280px,36vw,440px)',minWidth:0}}>
  <canvas ref={canvas} role="img" aria-label={`${profile.foodName}: ingredient-derived ${view}. ${selected?`Selected ${selected.label}. `:''}${profile.unmappedCount} unmapped ingredients. Use the ingredient buttons to inspect.`} style={{display:'block',width:'100%',height:'100%',touchAction:'pan-y'}} onPointerUp={event=>{const box=event.currentTarget.getBoundingClientRect(),x=event.clientX-box.left,y=event.clientY-box.top;const stripe=hits.current.find(p=>p.left!==undefined&&x>=p.left&&x<=p.right!&&y>=p.top!&&y<=p.bottom!);const nearest=stripe??[...hits.current].sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(nearest&&(stripe||Math.hypot(nearest.x-x,nearest.y-y)<26))onSelect(nearest.id);}}/>
  <button type="button" className="tool atlas-profile-motion" aria-label={reduced?'Reduced motion enabled':motion?'Pause profile motion':'Resume profile motion'} disabled={reduced} onClick={()=>setMotion(value=>!value)} style={{position:'absolute',right:10,top:4,minHeight:36,fontSize:12,gap:6}}>{motion&&!reduced?<Pause size={13}/>:<Play size={13}/>}<span style={{display:'inline'}}>{reduced?'Reduced motion':motion?'Pause':'Resume'}</span></button>
 </div>;
}
export default AtlasProfile;

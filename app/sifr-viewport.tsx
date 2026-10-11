'use client';
import {useEffect,useRef,useState} from 'react';
import {SIFR,color,field,HEIGHT_SCALE,isCommon,type Particle,type CompareMode,type ViewKey,type DishKey} from '@/lib/sifr';
import {visibleRegions} from '@/lib/sifr-regions';
import {rgb,CONTOUR_GRID} from '@/lib/sifr-scene';
import {clamp01,ease,mix,noise,FRAME_MS} from '@/lib/sifr-motion';
import {targetState,copyVisual,interpolateVisual,transitionDuration,createFieldFrames,evaluateField,markerPresence,sharedPartner,FIELD_NODES,CLOUD_COUNT,VERTEX_OFFSET,MARKER_OFFSET,type FormationTarget} from '@/lib/sifr-formation';
import {prominenceRatios} from '@/lib/sifr-lab';

type Props={modelParticles:Particle[];dish:DishKey;layer:string;barcodeDish:DishKey;onBarcodeReady:(dish:DishKey)=>void;view:ViewKey;compare:boolean;mode:CompareMode;confidence:boolean;reset:number;onSelect:(p:Particle)=>void;selected:Particle|null;isolate:boolean;regions:boolean;surface:'points'|'relief';motion:boolean;replay:number;highlightIds:string[]};
type Point={x:number;y:number;depth:number};
type Label={id:string;text:string;left:number;top:number;width:number;particle:Particle};
const palette=SIFR.particles.map(p=>rgb(color(p))),dishColors=SIFR.dishes.map(d=>rgb(d.color));
const drift=FIELD_NODES.slice(0,CLOUD_COUNT).map((_,k)=>({x:.78+noise(k+3)*.65,y:.82+noise(k+11)*.55,light:.8+noise(k+18)*.5,sx:noise(k+5),sy:noise(k+43)}));

export default function SifrViewport(props:Props){
 const canvas=useRef<HTMLCanvasElement>(null),status=useRef<HTMLSpanElement>(null),current=useRef(props);
 const hits=useRef<{p:Particle;x:number;y:number}[]>([]),angle=useRef(-.18);
 const gesture=useRef<{x:number;y:number;angle:number;moved:boolean}|null>(null);
 const [labels,setLabels]=useState<Label[]>([]);
 const engine=useRef({wake:()=>{},invalidate:()=>{}});
 useEffect(()=>{angle.current=-.18;engine.current.invalidate();engine.current.wake();},[props.reset]);
 useEffect(()=>{current.current=props;engine.current.invalidate();engine.current.wake();},[props]);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const cache=document.createElement('canvas'),cacheCtx=cache.getContext('2d')!;
  const barcodeStage=el.parentElement?.querySelector<HTMLElement>('.barcode-stage');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,visible=true,lastWall=0,lastDraw=0,clock=0,elapsed=0,duration=1750,dirty=true,key='',labelKey='',draws=0,averageMs=0;
  let previous:FormationTarget|null=null,lastReplay=-1,hasFrame=false,cacheValid=false,replaying=false,barcodeTurn=false;
  let target=targetState({dish:'chicken_rice',layer:'all',mode:'overlay',view:'topography'}),visual=copyVisual(target),from=copyVisual(target);
  visual.amplitude.fill(0);visual.visibility=visual.visibility.map(v=>v*.15);from=copyVisual(visual);
  const fields=createFieldFrames(),destFields=createFieldFrames();
  const displayed=new Float32Array(CLOUD_COUNT*4),correction=new Float32Array(CLOUD_COUNT*4);
  let rectify=false,initial=true,focusKey='',fieldSettled=false;
  const rects=new Map<string,{left:number;top:number;width:number;height:number}>();let lastMarkers=new Map<number,Point>();const markerCorrection=new Map<number,Point>();
  function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  function invalidate(){dirty=true;cacheValid=false;labelKey='';}
  function readRects(){const box=el!.getBoundingClientRect();el!.parentElement?.querySelectorAll<HTMLElement>('.barcode-stage [data-particle-id]').forEach(node=>{const r=node.getBoundingClientRect();if(r.width&&r.height)rects.set(node.dataset.particleId!,{left:r.left-box.left,top:r.top-box.top,width:r.width,height:r.height});});}
  engine.current={wake,invalidate};
  function tick(now:number){
   frame=0;if(!visible||document.hidden){lastWall=0;return;}
   const p=current.current,moving=p.motion&&!reduced.matches;
   if(!dirty&&now-lastDraw<FRAME_MS){if(moving)wake();return;}
   const begin=performance.now();let dt=lastWall?Math.max(0,now-lastWall):0;lastWall=now;lastDraw=now;
   const box=el!.getBoundingClientRect(),w=box.width,h=box.height;if(!w||!h)return;
   const dpr=Math.min(window.devicePixelRatio||1,1.65);
   if(el!.width!==Math.round(w*dpr)||el!.height!==Math.round(h*dpr)){el!.width=Math.round(w*dpr);el!.height=Math.round(h*dpr);cache.width=el!.width;cache.height=el!.height;invalidate();}
   ctx!.setTransform(dpr,0,0,dpr,0,0);ctx!.clearRect(0,0,w,h);
   const next:FormationTarget={dish:p.dish,layer:p.layer,mode:p.mode,view:p.view,isolateId:p.isolate?p.selected?.id:undefined,prominence:prominenceRatios(p.modelParticles)};
   const shapeKey=JSON.stringify(next)+'|'+p.replay;
   if(shapeKey!==key){
    initial=!hasFrame;from=copyVisual(visual);target=targetState(next);replaying=lastReplay!==p.replay&&lastReplay>=0;
    barcodeTurn=p.view==='barcode'&&p.barcodeDish!==p.dish&&from.barcode>.74;
    duration=transitionDuration(previous,next,replaying);elapsed=0;dt=0;rectify=hasFrame;markerCorrection.clear();
    if(initial){from=copyVisual(target);from.amplitude.fill(0);from.visibility=target.visibility.map(v=>v*.15);from.barcode=0;}
    previous=next;lastReplay=p.replay;key=shapeKey;labelKey='';cacheValid=false;readRects();evaluateField(target,destFields);
   }
   if(dirty||elapsed<duration)readRects();if(moving){elapsed+=dt;clock+=Math.min(dt,70);}else elapsed=duration;
   const progress=clamp01(elapsed/duration),t=ease(progress),settled=progress===1;
   visual=interpolateVisual(from,target,progress);
   if(barcodeTurn&&!settled)visual.barcode=progress<.5?mix(from.barcode,0,ease(progress*2)):ease((progress-.5)*2);
   if(replaying&&!settled){const dip=1-.86*Math.sin(Math.PI*progress);visual.amplitude=visual.amplitude.map(v=>v*dip);}
   const focused=p.selected?[p.selected.id]:p.highlightIds,newFocusKey=focused.join(',');
   if(!settled||!fieldSettled||dirty||newFocusKey!==focusKey||!hasFrame)evaluateField(visual,fields,focused);
   fieldSettled=settled;
   focusKey=newFocusKey;
   const b=visual.barcode,travel=ease((b-.20)/.70),surfaceLift=visual.relief*(1-ease(b/.40)),seconds=clock/1000;
   const rot=angle.current,c=Math.cos(rot),s=Math.sin(rot),scale=Math.min(w/Math.max(1.28,1.10*(Math.abs(c)+Math.abs(s))),h/1.25);
   const project=(x:number,y:number,z=0):Point=>{const a=x-.5,d=y-.5,u=a*c-d*s,v=a*s+d*c;return{x:w/2+u*scale,y:h*.60+v*scale*.54-z*scale*HEIGHT_SCALE,depth:v};};
   const path=(context:CanvasRenderingContext2D,points:Point[],close=false)=>{context.beginPath();points.forEach((q,i)=>i?context.lineTo(q.x,q.y):context.moveTo(q.x,q.y));if(close)context.closePath();};
   const stripeOpacity=ease((b-.74)/.26);
   if(p.barcodeDish!==p.dish&&(stripeOpacity<.01||!moving||settled))p.onBarcodeReady(p.dish);
   if(barcodeStage){barcodeStage.style.opacity=String(stripeOpacity);barcodeStage.style.setProperty('--band-reveal',String(.06+.94*ease((b-.60)/.40)));}
   el!.dataset.phase=settled?'settled':initial&&progress<.2?'gathering':'forming';el!.dataset.motion=moving?'on':'off';el!.dataset.progress=progress.toFixed(3);
   el!.dataset.sharedPresence=JSON.stringify(SIFR.particles.flatMap((q,i)=>sharedPartner[i]>i?[{label:q.label,alpha:Number(markerPresence(visual,i).toFixed(3))}]:[]));
   if(status.current)status.current.textContent=!moving?'STILL / EXACT PROFILE':settled?'PROFILE FORMED':initial&&progress<.2?'GATHERING':'FORMING';
   const spatialAlpha=1-ease(b);
   if(spatialAlpha>.001){
    ctx!.globalAlpha=spatialAlpha;
    const glow=ctx!.createRadialGradient(w*.5,h*.53,0,w*.5,h*.53,w*.6);glow.addColorStop(0,'#39524a35');glow.addColorStop(1,'#0b111200');ctx!.fillStyle=glow;ctx!.fillRect(0,0,w,h);
    for(let k=0;k<=10;k++){const v=k/10;ctx!.strokeStyle=k%5===0?'#819b8c42':'#819b8c1d';ctx!.lineWidth=.7;path(ctx!,[project(0,v),project(1,v)]);ctx!.stroke();path(ctx!,[project(v,0),project(v,1)]);ctx!.stroke();}
    ctx!.strokeStyle='#a3b59e5a';ctx!.setLineDash([2,5]);path(ctx!,[project(0,0),project(1,0),project(1,1),project(0,1)],true);ctx!.stroke();ctx!.setLineDash([]);
    ctx!.font='11px ui-monospace, monospace';ctx!.fillStyle='#99ac9f';const o=project(0,1),xe=project(1,1),ye=project(0,0);ctx!.fillText('0,0',ye.x-9,ye.y-12);ctx!.fillText('x = 1',Math.min(w-36,xe.x-16),Math.min(h-34,xe.y+20));ctx!.fillText('y = 1',Math.max(8,o.x-10),Math.min(h-34,o.y+20));ctx!.globalAlpha=1;
   }
   // Extract contours from the CURRENT interpolated field, then cache at rest.
   if(!cacheValid||!settled){
    cacheCtx.setTransform(dpr,0,0,dpr,0,0);cacheCtx.clearRect(0,0,w,h);const n=CONTOUR_GRID;
    for(let d=0;d<2;d++){
     if(d===1&&visual.compare<.001)continue;
     const f=fields[d];
     if(p.surface==='relief'&&surfaceLift>.001){
      const quads:{pts:Point[];col:number[];z:number;depth:number}[]=[];
      for(let j=0;j<n;j++)for(let i=0;i<n;i++){
       const k=VERTEX_OFFSET+j*(n+1)+i,ks=[k,k+1,k+n+2,k+n+1],z=ks.reduce((sum,k)=>sum+f.z[k],0)/4*surfaceLift;if(z<.012)continue;
       const pts=ks.map(k=>project(FIELD_NODES[k].x,FIELD_NODES[k].y,f.z[k]*surfaceLift)),light=Math.max(.4,Math.min(1.1,.72+((f.z[k+1]-f.z[k])-(f.z[k+n+1]-f.z[k]))*2));
       const strength=focused.length&&!p.isolate?.16+.84*f.share[k]:1,col=[f.r[k],f.g[k],f.b[k]].map((v,i)=>Math.round(mix(v,dishColors[d][i],visual.compare)*light*strength));quads.push({pts,col,z,depth:pts[0].depth});
      }
      quads.sort((a,b)=>a.depth-b.depth);
      for(const q of quads){path(cacheCtx,q.pts,true);cacheCtx.fillStyle='rgba('+q.col.join(',')+','+(d?.10:.50)*Math.min(1,q.z/.1)+')';cacheCtx.fill();cacheCtx.strokeStyle='rgba('+q.col.map(v=>Math.min(255,v+30)).join(',')+','+(d?.45:.16)*Math.min(1,q.z/.1)+')';cacheCtx.lineWidth=.65;cacheCtx.stroke();}
     }
     if(surfaceLift>.015)for(const level of [.15,.3,.5,.75,1,1.3,1.65,2]){
      cacheCtx.beginPath();
      for(let j=0;j<n;j++)for(let i=0;i<n;i++){
       const k=VERTEX_OFFSET+j*(n+1)+i,ks=[k,k+1,k+n+2,k+n+1],cross:Point[]=[];
       for(let e=0;e<4;e++){const ai=ks[e],bi=ks[(e+1)%4],az=f.z[ai]*surfaceLift,bz=f.z[bi]*surfaceLift;if((az<level)!==(bz<level)){const v=(level-az)/(bz-az),a=FIELD_NODES[ai],b=FIELD_NODES[bi];cross.push(project(mix(a.x,b.x,v),mix(a.y,b.y,v),level+.006));}}
       for(let e=0;e+1<cross.length;e+=2){cacheCtx.moveTo(cross[e].x,cross[e].y);cacheCtx.lineTo(cross[e+1].x,cross[e+1].y);}
      }
      cacheCtx.strokeStyle=focused.length&&!p.isolate?'#b9cbb12e':visual.compare>.5?SIFR.dishes[d].color+'80':'#d4e2c565';cacheCtx.lineWidth=.7;cacheCtx.globalAlpha=surfaceLift;if(d)cacheCtx.setLineDash([3,3]);cacheCtx.stroke();cacheCtx.setLineDash([]);cacheCtx.globalAlpha=1;
     }
    }
    cacheValid=settled;
   }
   ctx!.globalAlpha=spatialAlpha*(moving?.975+.025*Math.sin(seconds*.9):1);ctx!.drawImage(cache,0,0,w,h);ctx!.globalAlpha=1;
   for(let d=0;d<2;d++){
    const f=fields[d],dest=destFields[d];
    for(let k=0;k<CLOUD_COUNT;k++){
     const v=FIELD_NODES[k],offset=(d*CLOUD_COUNT+k)*2,owner=dest.owner[k]>=0?dest.owner[k]:f.owner[k],anchor=project(v.x,v.y,f.z[k]*surfaceLift+.05*Math.sin(Math.PI*b));
     const stripe=owner>=0?rects.get(SIFR.particles[owner].id):undefined;let x=anchor.x,y=anchor.y;
     if(stripe){x=mix(x,stripe.left+drift[k].sx*stripe.width,travel);y=mix(y,stripe.top+drift[k].sy*stripe.height,travel);}
     if(rectify){correction[offset]=displayed[offset]-x;correction[offset+1]=displayed[offset+1]-y;}
     if(!initial&&!settled){x+=correction[offset]*(1-t);y+=correction[offset+1]*(1-t);}
     displayed[offset]=x;displayed[offset+1]=y;if(f.ink[k]<.008||settled&&b===1)continue;
     const focus=focused.length&&!p.isolate?.1+.9*Math.min(1,f.share[k]*1.45):1,differenceDim=mix(1,.15+.85*Math.min(1,f.z[k]/Math.max(.001,f.ink[k])),visual.difference);
     const alpha=Math.min(.94,.24+f.ink[k]*.48)*Math.min(1,f.ink[k]/.065)*focus*differenceDim*mix(.18,1,Math.max(visual.relief,travel))*(1-stripeOpacity);
     const rest=moving?1.05:0,driftX=Math.sin(seconds*drift[k].x+v.phase)*rest,driftY=Math.cos(seconds*drift[k].y+v.phase)*rest,shimmer=moving?.91+.09*Math.sin(seconds*drift[k].light+v.phase):1;
     const co=[f.r[k],f.g[k],f.b[k]].map((value,i)=>mix(mix(value,dishColors[d][i],visual.compare),owner>=0?palette[owner][i]:value,travel)),size=(w<500?1.2:1.5)+Math.min(2,f.z[k])*.23;
     ctx!.fillStyle='rgba('+co.map(v=>Math.min(255,Math.round(v*1.16))).join(',')+','+(alpha*shimmer)+')';ctx!.fillRect(x+driftX-size/2,y+driftY-size/2,size,size);
    }
   }
   hits.current=[];const nextMarkers=new Map<number,Point>();
   for(let i=0;i<SIFR.particles.length;i++){
    let particle=p.modelParticles[i];const presence=markerPresence(visual,i);if(presence<.002)continue;
    const partner=sharedPartner[i],merged=partner>i?1-visual.compare:0;let x=particle.x,y=particle.y,index=i;
    if(merged){const total=visual.visibility[i]+visual.visibility[partner],weight=total?visual.visibility[partner]/total:0;x=mix(x,p.modelParticles[partner].x,weight*merged);y=mix(y,p.modelParticles[partner].y,weight*merged);if(target.amplitude[partner]>target.amplitude[i]||p.dish===p.modelParticles[partner].dish){particle=p.modelParticles[partner];index=partner;}}
    const d=particle.dish===SIFR.dishes[0].id?0:1,selected=focused.includes(particle.id),active=visual.amplitude[index];
    const fullHeight=(fields[0].z[MARKER_OFFSET+index]+fields[1].z[MARKER_OFFSET+index])*(partner>i?Math.min(1,visual.amplitude[i]+visual.amplitude[partner]):active),height=mix(fullHeight,fields[d].z[MARKER_OFFSET+index]*active,visual.compare);
    const q=project(x,y,(height+.065*presence)*(1-ease(b/.4))+.08*Math.sin(Math.PI*b)),ground=project(x,y),stripe=rects.get(particle.id);
    if(stripe){q.x=mix(q.x,stripe.left+stripe.width/2,travel);q.y=mix(q.y,stripe.top+stripe.height/2,travel);}
    if(rectify){const last=lastMarkers.get(i);markerCorrection.set(i,last?{x:last.x-q.x,y:last.y-q.y,depth:0}:{x:0,y:0,depth:0});}
    const fix=markerCorrection.get(i);if(fix&&!settled){q.x+=fix.x*(1-t);q.y+=fix.y*(1-t);}nextMarkers.set(i,{...q});
    const dimShared=isCommon(particle)?mix(1,.15,visual.difference):1,alpha=presence*dimShared*(focused.length&&!selected?.24:1)*(p.confidence?.3+particle.confidence*.7:1)*(1-stripeOpacity);if(alpha<.005)continue;
    const rest=moving&&!isCommon(particle)?1.1:0;q.x+=Math.sin(seconds*(.85+noise(i+20)*.5)+i)*rest;q.y+=Math.cos(seconds*(.82+noise(i+10)*.55)+i)*rest;
    const r=3.5+SIFR.particles[index].intensity*visual.prominence[index]*3,co=color(particle);ctx!.globalAlpha=alpha;
    ctx!.beginPath();ctx!.moveTo(q.x,q.y+r);ctx!.lineTo(ground.x,ground.y);ctx!.strokeStyle=co+'50';ctx!.lineWidth=.8;ctx!.stroke();
    const halo=ctx!.createRadialGradient(q.x,q.y,0,q.x,q.y,r*(selected?5:3));halo.addColorStop(0,co+(selected?'65':'38'));halo.addColorStop(1,co+'00');ctx!.fillStyle=halo;ctx!.fillRect(q.x-r*5,q.y-r*5,r*10,r*10);
    ctx!.beginPath();if(p.compare&&particle.dish==='laksa'){ctx!.moveTo(q.x,q.y-r-3);ctx!.lineTo(q.x+r+3,q.y);ctx!.lineTo(q.x,q.y+r+3);ctx!.lineTo(q.x-r-3,q.y);ctx!.closePath();}else ctx!.arc(q.x,q.y,r+2,0,Math.PI*2);
    ctx!.fillStyle='#101a17';ctx!.fill();ctx!.strokeStyle=co;ctx!.lineWidth=selected?2.2:1.7;ctx!.stroke();ctx!.beginPath();ctx!.arc(q.x,q.y,2.3,0,Math.PI*2);ctx!.fillStyle=co;ctx!.fill();
    if(selected){ctx!.beginPath();ctx!.arc(q.x,q.y,r+8,0,Math.PI*2);ctx!.strokeStyle='#fff0c6';ctx!.lineWidth=1.6;ctx!.stroke();}
    if(p.confidence){ctx!.beginPath();ctx!.arc(q.x,q.y,r+5,0,Math.PI*2*particle.confidence);ctx!.strokeStyle=co;ctx!.lineWidth=1;ctx!.stroke();}ctx!.globalAlpha=1;
    if(target.amplitude[index]&&!(p.compare&&p.mode==='difference'&&isCommon(particle))&&p.view!=='barcode')hits.current.push({p:particle,x:q.x,y:q.y});
   }
   lastMarkers=nextMarkers;rectify=false;hasFrame=true;
   const nextLabels=[key,rot,w,h,p.regions,p.isolate,settled].join(':');
   if(labelKey!==nextLabels){
    labelKey=nextLabels;const next:Label[]=[];
    if(p.regions&&!p.isolate&&p.view!=='barcode'&&settled){
     const active=p.modelParticles.filter((q,i)=>target.amplitude[i]&&!(p.compare&&p.mode==='difference'&&isCommon(q))),candidates=visibleRegions(active,p.compare).sort((a,b)=>b.members.reduce((z,q)=>z+q.intensity,0)-a.members.reduce((z,q)=>z+q.intensity,0)).slice(0,w<500?3:4);
     for(const region of candidates){
      const heights=SIFR.dishes.map(d=>field(p.modelParticles.filter((q,i)=>target.amplitude[i]&&q.dish===d.id),region.x,region.y));
      const heightAtAnchor=p.compare?(p.mode==='difference'?Math.abs(heights[0]-heights[1]):Math.max(...heights)):heights[0]+heights[1];
      const q=project(region.x,region.y,heightAtAnchor),width=Math.min(w-24,region.label.length*7.1+20),height=30;let best={left:8,top:50,penalty:Infinity};
      for(const [dx,dy] of [[-width-18,-18],[18,-18],[-width/2,-55],[-width/2,32],[-width-18,34],[18,34]]){
       const left=Math.max(8,Math.min(w-width-8,q.x+dx)),top=Math.max(54,Math.min(h-82,q.y+dy));
       const penalty=next.filter(l=>left<l.left+l.width+8&&left+width+8>l.left&&top<l.top+height+8&&top+height+8>l.top).length*10000+hits.current.filter(m=>m.x>left-8&&m.x<left+width+8&&m.y>top-8&&m.y<top+height+8).length*1000+Math.hypot(left+width/2-q.x,top+height/2-q.y);if(penalty<best.penalty)best={left,top,penalty};
      }
      next.push({id:region.id,text:region.label,left:best.left,top:best.top,width,particle:region.particle});
     }
    }setLabels(next);
   }
   draws++;el!.dataset.frame=String(draws);averageMs=averageMs*.9+(performance.now()-begin)*.1;if(draws%15===0)el!.dataset.frameMs=averageMs.toFixed(1);
   dirty=false;if(moving&&(!settled||b<1))wake();
  }
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;lastWall=0;if(visible){dirty=true;wake();}else{cancelAnimationFrame(frame);frame=0;}});observer.observe(el);
  const resize=new ResizeObserver(()=>{invalidate();wake();});resize.observe(el);
  const visibility=()=>{lastWall=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{dirty=true;wake();}};
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',visibility);wake();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',visibility);engine.current={wake:()=>{},invalidate:()=>{}};};
 },[]);
 return <><canvas ref={canvas} className="terrain-canvas" aria-hidden={props.view==='barcode'} style={{pointerEvents:props.view==='barcode'?'none':'auto'}} aria-label="Living sensory object. Tap a marker to focus; drag horizontally to turn the topography." onPointerDown={e=>{gesture.current={x:e.clientX,y:e.clientY,angle:angle.current,moved:false};}} onPointerMove={e=>{const g=gesture.current;if(!g)return;if(Math.abs(e.clientX-g.x)>7){g.moved=true;if(props.view==='topography'){angle.current=Math.max(-.55,Math.min(.55,g.angle+(e.clientX-g.x)*.003));engine.current.invalidate();engine.current.wake();}}}} onPointerUp={e=>{const g=gesture.current;gesture.current=null;if(!g||g.moved||Math.abs(e.clientY-g.y)>10)return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,nearest=[...hits.current].sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(nearest&&Math.hypot(nearest.x-x,nearest.y-y)<28)current.current.onSelect(nearest.p);}} onPointerCancel={()=>gesture.current=null} onPointerLeave={()=>gesture.current=null}/><span ref={status} className="formation-status" aria-hidden="true">GATHERING</span>{props.view!=='barcode'&&labels.map(label=><button key={label.id} className="region-label" style={{left:label.left,top:label.top,width:label.width}} onClick={()=>current.current.onSelect(label.particle)} aria-label={'Explore '+label.text+': '+label.particle.label}>{label.text}</button>)}</>;
}

import {SIFR,color,contribution,field,isCommon,DOMAIN,type Particle,type CompareMode} from './sifr';
import {noise} from './sifr-motion';

export const GRID = 80;
export const CONTOUR_GRID = 44;
export type Sample = {x:number;y:number;z:number;r:number;g:number;b:number;share:number;owner:string;phase:number;volatility:number};
export const rgb = (hex:string) => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
// Same sample lattice for every dish. The padded domain contains the Gaussian tails.
const min=DOMAIN.min,span=DOMAIN.max-DOMAIN.min;
const lattice = Array.from({length:(GRID+1)**2},(_,k)=>({x:min+((k%(GRID+1))+(noise(k+1)-.5)*.36)/GRID*span,y:min+(Math.floor(k/(GRID+1))+(noise(k+19)-.5)*.36)/GRID*span,phase:noise(k+31)*Math.PI*2}));

export function makeSurfaces(particles:Particle[],compare:boolean,mode:CompareMode,isolate:Particle|null,focusIds:string[]) {
  const groups = SIFR.dishes.map(dish=>({dish,ps:particles.filter(p=>p.dish===dish.id&&(mode!=='common'||!compare||isCommon(p)))}));
  return groups.map(g=>{
    const ps=g.ps, other=groups.find(q=>q!==g)!.ps;
    const sample=(x:number,y:number)=>isolate?(isolate.dish===g.dish.id?contribution(isolate,x,y):0):compare&&mode==='difference'?Math.max(0,field(ps,x,y)-field(other,x,y)):field(ps,x,y);
    const contributors=isolate?ps.filter(p=>p.id===isolate.id):ps;
    const colors=contributors.map(p=>rgb(color(p))), focused=contributors.map(p=>focusIds.includes(p.id));
    const cloud:Sample[]=lattice.map(v=>{
      let total=0,r=0,green=0,b=0,focus=0,vol=0,max=0,owner='';
      contributors.forEach((p,i)=>{const a=contribution(p,v.x,v.y);total+=a;r+=a*colors[i][0];green+=a*colors[i][1];b+=a*colors[i][2];vol+=a*p.volatility;if(focused[i])focus+=a;if(a>max){max=a;owner=p.id;}});
      return {...v,z:sample(v.x,v.y),r:total?r/total:130,g:total?green/total:150,b:total?b/total:145,share:total?focus/total:0,owner,volatility:total?vol/total:0};
    });
    const n=CONTOUR_GRID;
    const vertices=Array.from({length:(n+1)**2},(_,k)=>{const x=min+(k%(n+1))/n*span,y=min+Math.floor(k/(n+1))/n*span;const nearest=cloud[Math.min(GRID,Math.round((y-min)/span*GRID))*(GRID+1)+Math.min(GRID,Math.round((x-min)/span*GRID))];return{x,y,z:sample(x,y),c:[nearest.r,nearest.g,nearest.b],share:nearest.share};});
    return {...g,sample,cloud,vertices};
  });
}
export type Surface = ReturnType<typeof makeSurfaces>[number];

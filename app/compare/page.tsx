import type {Metadata} from 'next';
import CompareRecipes from './compare-recipes';

export const metadata:Metadata={title:'Compare recipes — Sifr',description:'Follow shared ingredients through two sourced recipe versions and their illustrative ingredient sketches.'};

export default async function ComparePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const query=await searchParams;
  return <CompareRecipes initialLeftId={typeof query.left==='string'?query.left:undefined} initialRightId={typeof query.right==='string'?query.right:undefined}/>;
}

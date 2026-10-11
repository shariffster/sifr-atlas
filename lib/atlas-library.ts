import type {AtlasFood} from './atlas-types';

export const ATLAS_TRAILS = [
  {id:'coconut',label:'Coconut',color:'#e4d7ad',match:'coconut'},
  {id:'chilli',label:'Chilli',color:'#ee8b71',match:'chili|chilli|cayenne|jalape|harissa|gochujang|sriracha'},
  {id:'rice',label:'Rice',color:'#c6cda5',match:'rice'},
  {id:'cumin',label:'Cumin',color:'#d9ae73',match:'cumin'},
  {id:'ginger',label:'Ginger',color:'#d5c08c',match:'ginger'},
  {id:'lemon',label:'Citrus',color:'#ded178',match:'lemon|lime|orange|yuzu'},
  {id:'tomato',label:'Tomato',color:'#d98a7a',match:'tomato|passata'},
  {id:'soy',label:'Soy',color:'#b1a2c7',match:'soy|soya|miso|tofu'},
] as const;
export type AtlasTrail = typeof ATLAS_TRAILS[number];

export function hasTrail(food:AtlasFood,trail:AtlasTrail) {
  const pattern=new RegExp(trail.match,'i');
  return food.ingredients.some(i=>pattern.test(i.name));
}

export function areaFrequency(foods:AtlasFood[],trail:AtlasTrail) {
  const groups=new Map<string,{area:string,total:number,matches:number}>();
  for(const food of foods){
    const group=groups.get(food.area)||{area:food.area,total:0,matches:0};
    group.total++;
    if(hasTrail(food,trail))group.matches++;
    groups.set(food.area,group);
  }
  return [...groups.values()].map(g=>({...g,share:g.total?g.matches/g.total:0}));
}

// Approximate display anchors for recipe-area labels. These are navigation
// anchors, not claims of a dish's origin, exclusive ownership or regional extent.
export const AREA_ANCHORS:Record<string,{country:string,iso:string,lon:number,lat:number}>={
  American:{country:'United States',iso:'USA',lon:-100,lat:39},
  Argentinian:{country:'Argentina',iso:'ARG',lon:-64,lat:-35},
  Australian:{country:'Australia',iso:'AUS',lon:134,lat:-25},
  Brazilian:{country:'Brazil',iso:'BRA',lon:-52,lat:-14},
  British:{country:'United Kingdom',iso:'GBR',lon:-2,lat:54},
  Canadian:{country:'Canada',iso:'CAN',lon:-106,lat:57},
  Chinese:{country:'China',iso:'CHN',lon:105,lat:35},
  Croatian:{country:'Croatia',iso:'HRV',lon:16,lat:45},
  Dutch:{country:'Netherlands',iso:'NLD',lon:5,lat:52},
  Egyptian:{country:'Egypt',iso:'EGY',lon:30,lat:27},
  Filipino:{country:'Philippines',iso:'PHL',lon:122,lat:12},
  French:{country:'France',iso:'FRA',lon:2.5,lat:46.5},
  Greek:{country:'Greece',iso:'GRC',lon:23,lat:39},
  Indian:{country:'India',iso:'IND',lon:79,lat:23},
  Indonesian:{country:'Indonesia',iso:'IDN',lon:118,lat:-3},
  Irish:{country:'Ireland',iso:'IRL',lon:-8,lat:53},
  Italian:{country:'Italy',iso:'ITA',lon:12,lat:43},
  Jamaican:{country:'Jamaica',iso:'JAM',lon:-77.3,lat:18.1},
  Japanese:{country:'Japan',iso:'JPN',lon:138,lat:37},
  Kenyan:{country:'Kenya',iso:'KEN',lon:38,lat:1},
  Malaysian:{country:'Malaysia',iso:'MYS',lon:103,lat:4},
  Mexican:{country:'Mexico',iso:'MEX',lon:-102,lat:24},
  Moroccan:{country:'Morocco',iso:'MAR',lon:-6,lat:32},
  Polish:{country:'Poland',iso:'POL',lon:19,lat:52},
  Portuguese:{country:'Portugal',iso:'PRT',lon:-8,lat:40},
  Russian:{country:'Russia',iso:'RUS',lon:92,lat:59},
  SaudiArabian:{country:'Saudi Arabia',iso:'SAU',lon:45,lat:24},
  Singaporean:{country:'Singapore',iso:'SGP',lon:103.8,lat:1.35},
  Spanish:{country:'Spain',iso:'ESP',lon:-4,lat:40},
  Thai:{country:'Thailand',iso:'THA',lon:101,lat:16},
  Tunisian:{country:'Tunisia',iso:'TUN',lon:10,lat:34},
  Turkish:{country:'Türkiye',iso:'TUR',lon:35,lat:39},
  Ukrainian:{country:'Ukraine',iso:'UKR',lon:31,lat:49},
  Uruguayan:{country:'Uruguay',iso:'URY',lon:-56,lat:-33},
  Venezuelan:{country:'Venezuela',iso:'VEN',lon:-66,lat:7},
  Vietnamese:{country:'Vietnam',iso:'VNM',lon:106,lat:16},
};

export function areaAnchor(area:string) {
  return AREA_ANCHORS[area.replace(/\s/g,'')]||Object.values(AREA_ANCHORS).find(a=>a.country.toLowerCase()===area.toLowerCase());
}

export const mapPoint=(lon:number,lat:number)=>({x:(lon+180)/360*1000,y:(85-lat)/145*470});

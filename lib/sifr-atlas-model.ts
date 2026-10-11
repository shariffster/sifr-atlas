import type { AtlasFood } from './atlas-types';

// Author-designed reading aids, not measured sensory descriptors. Coordinates are
// fixed across recipes; source amounts never become weights in this prototype.
const palette = {
  umami:'#85b8db',fatty:'#d4a265',creamy:'#eddbb0',spicy_heat:'#ef705e',citrus:'#ddd269',
  green:'#91b87a',sulfur:'#b9c574',marine:'#6fa4cc',fermented:'#a39ac8',floral:'#d0a3bb',
  herbal:'#78b6a4',roasted:'#bd8a55',sweet:'#cd8794',pungent:'#dc9276',fresh:'#89c6c7',
  starchy:'#eddbb0',earthy:'#bd8a55',saline:'#85b8db',neutral:'#a9b4ad',unmapped:'#8b9992',
} as const;
export type AtlasDescriptor = keyof typeof palette;
const anchors:Record<AtlasDescriptor,[number,number]> = {
  umami:[.19,.36],fatty:[.35,.70],creamy:[.22,.82],spicy_heat:[.79,.76],citrus:[.79,.19],
  green:[.62,.18],sulfur:[.59,.79],marine:[.17,.18],fermented:[.36,.31],floral:[.83,.39],
  herbal:[.56,.34],roasted:[.39,.55],sweet:[.61,.54],pungent:[.74,.58],fresh:[.47,.13],
  starchy:[.14,.66],earthy:[.28,.53],saline:[.36,.12],neutral:[.13,.86],unmapped:[.96,.5],
};
type FamilyRule={family:string;descriptor:AtlasDescriptor;test:RegExp};
// Specific compound ingredient names precede broad words (fish sauce before fish,
// coconut milk before milk, bell pepper before pepper). Unmatched names stay unknown.
export const INGREDIENT_FAMILIES:FamilyRule[] = [
  {family:'fish sauce',descriptor:'fermented',test:/\b(?:fish sauce|nam pla|nuoc mam)\b/},
  {family:'soy sauce',descriptor:'fermented',test:/\b(?:soy sauce|soya sauce|tamari|kecap)\b/},
  {family:'fermented pastes',descriptor:'fermented',test:/\b(?:miso|gochujang|doenjang|doubanjiang|shrimp paste|belacan|fermented bean)\b/},
  {family:'coconut',descriptor:'creamy',test:/\bcoconut\b/},
  {family:'citrus',descriptor:'citrus',test:/\b(?:lemon|lime|orange|yuzu|grapefruit|calamansi|clementine|mandarin)\b/},
  {family:'tamarind',descriptor:'citrus',test:/\btamarind\b/},
  {family:'vinegar',descriptor:'citrus',test:/\b(?:vinegar|verjuice)\b/},
  {family:'chilli',descriptor:'spicy_heat',test:/\b(?:chilli|chili|cayenne|jalapeno|habanero|sriracha|tabasco|scotch bonnet|chipotle|sambal|hot sauce|gochugaru|harissa)\b/},
  {family:'paprika',descriptor:'spicy_heat',test:/\bpaprika\b/},
  {family:'bell pepper',descriptor:'green',test:/\b(?:(?:bell|green|red|yellow|orange) pepper|capsicum|pimento)\b/},
  {family:'peppercorn',descriptor:'pungent',test:/\b(?:pepper|peppercorn|sichuan pepper)\b/},
  {family:'garlic',descriptor:'sulfur',test:/\bgarlic\b/},
  {family:'onion',descriptor:'sulfur',test:/\b(?:onion|shallot)\b/},
  {family:'leek and chive',descriptor:'sulfur',test:/\b(?:leek|chive)\b/},
  {family:'ginger and galangal',descriptor:'pungent',test:/\b(?:ginger|galangal)\b/},
  {family:'mustard and horseradish',descriptor:'pungent',test:/\b(?:mustard|horseradish|wasabi)\b/},
  {family:'cumin',descriptor:'earthy',test:/\bcumin\b/},
  {family:'coriander seed',descriptor:'herbal',test:/\b(?:ground coriander|coriander seed)\b/},
  {family:'coriander leaf',descriptor:'herbal',test:/\b(?:coriander|cilantro)\b/},
  {family:'leaf herbs',descriptor:'herbal',test:/\b(?:basil|mint|parsley|dill|chervil|tarragon|oregano|thyme|rosemary|sage|marjoram|bay leaf|bay leaves)\b/},
  {family:'lemongrass and pandan',descriptor:'herbal',test:/\b(?:lemongrass|pandan|curry leaf|curry leaves|kaffir leaf|lime leaf|lime leaves)\b/},
  {family:'cardamom',descriptor:'floral',test:/\bcardamom\b/},
  {family:'sweet spices',descriptor:'floral',test:/\b(?:cinnamon|clove|nutmeg|allspice|star anise|fennel|mace)\b/},
  {family:'turmeric',descriptor:'earthy',test:/\bturmeric\b/},
  {family:'spice blends',descriptor:'herbal',test:/\b(?:curry powder|garam masala|ras el hanout|mixed spice|five spice|zaatar|baharat|seasoning|spice mix)\b/},
  {family:'saffron and vanilla',descriptor:'floral',test:/\b(?:saffron|vanilla|rose water|orange blossom)\b/},
  {family:'tomato',descriptor:'umami',test:/\b(?:tomato|passata|ketchup)\b/},
  {family:'mushroom',descriptor:'umami',test:/\b(?:mushroom|shiitake|porcini|oyster mushroom|truffle)\b/},
  {family:'seaweed',descriptor:'marine',test:/\b(?:seaweed|nori|kelp|kombu|wakame)\b/},
  {family:'shellfish',descriptor:'marine',test:/\b(?:prawn|shrimp|crab|lobster|mussel|clam|oyster|scallop|cockle)\b/},
  {family:'fish',descriptor:'marine',test:/\b(?:fish|salmon|tuna|cod|haddock|anchovy|sardine|mackerel|trout|tilapia|swordfish|hake|halibut|seabass|sea bass)\b/},
  {family:'squid and octopus',descriptor:'marine',test:/\b(?:squid|calamari|octopus|cuttlefish)\b/},
  {family:'stock and broth',descriptor:'umami',test:/\b(?:stock|broth|bouillon|gravy|dashi)\b/},
  {family:'poultry',descriptor:'umami',test:/\b(?:chicken|turkey|duck|quail|goose)\b/},
  {family:'beef',descriptor:'umami',test:/\b(?:beef|veal|steak|oxtail)\b/},
  {family:'pork',descriptor:'umami',test:/\b(?:pork|bacon|ham|pancetta|chorizo|sausage|prosciutto|lardon)\b/},
  {family:'lamb and game',descriptor:'umami',test:/\b(?:lamb|mutton|goat|venison|rabbit)\b/},
  {family:'egg',descriptor:'fatty',test:/\begg\b/},
  {family:'cheese',descriptor:'fermented',test:/\b(?:cheese|parmesan|cheddar|mozzarella|feta|ricotta|paneer|gouda|gruyere|pecorino|mascarpone|halloumi)\b/},
  {family:'yoghurt',descriptor:'fermented',test:/\b(?:yoghurt|yogurt|kefir|buttermilk)\b/},
  {family:'cream',descriptor:'creamy',test:/\b(?:cream|creme fraiche)\b/},
  {family:'milk',descriptor:'creamy',test:/\bmilk\b/},
  {family:'butter and ghee',descriptor:'fatty',test:/\b(?:butter|ghee|margarine|lard|shortening|suet)\b/},
  {family:'oil',descriptor:'fatty',test:/\b(?:oil|tahini)\b/},
  {family:'peanut',descriptor:'roasted',test:/\b(?:peanut|groundnut)\b/},
  {family:'nuts',descriptor:'roasted',test:/\b(?:almond|walnut|cashew|pistachio|hazelnut|pecan|pine nut|chestnut|macadamia)\b/},
  {family:'seeds',descriptor:'roasted',test:/\b(?:sesame|sunflower seed|pumpkin seed|poppy seed|flaxseed)\b/},
  {family:'tofu',descriptor:'neutral',test:/\b(?:tofu|bean curd)\b/},
  {family:'pulses',descriptor:'starchy',test:/\b(?:bean|lentil|chickpea|split pea|dal|dhal)\b/},
  {family:'rice',descriptor:'starchy',test:/\brice\b/},
  {family:'noodles and pasta',descriptor:'starchy',test:/\b(?:noodle|pasta|spaghetti|macaroni|penne|fettuccine|linguine|lasagne|vermicelli|udon|soba|orzo)\b/},
  {family:'flour and starch',descriptor:'starchy',test:/\b(?:flour|cornstarch|corn starch|cornflour|starch|semolina|polenta|cornmeal)\b/},
  {family:'bread and pastry',descriptor:'starchy',test:/\b(?:bread|breadcrumb|panko|tortilla|pita|pitta|pastry|filo|phyllo|brioche|bun|baguette)\b/},
  {family:'grains',descriptor:'starchy',test:/\b(?:oat|barley|quinoa|couscous|bulgur|buckwheat|millet|wheat)\b/},
  {family:'potato and cassava',descriptor:'starchy',test:/\b(?:potato|cassava|tapioca|yam|taro|plantain)\b/},
  {family:'root vegetables',descriptor:'sweet',test:/\b(?:carrot|beet|beetroot|parsnip|turnip|swede)\b/},
  {family:'squash and corn',descriptor:'sweet',test:/\b(?:pumpkin|squash|sweetcorn|sweet corn|corn)\b/},
  {family:'brassicas',descriptor:'green',test:/\b(?:cabbage|broccoli|cauliflower|brussels sprout|bok choy|pak choi|kale)\b/},
  {family:'leafy vegetables',descriptor:'green',test:/\b(?:spinach|lettuce|chard|rocket|arugula|watercress|collard)\b/},
  {family:'fresh vegetables',descriptor:'fresh',test:/\b(?:cucumber|courgette|zucchini|radish|aubergine|eggplant|asparagus|okra|pea|green bean)\b/},
  {family:'celery and fennel',descriptor:'herbal',test:/\b(?:celery|fennel bulb)\b/},
  {family:'fruit',descriptor:'sweet',test:/\b(?:apple|pear|banana|mango|pineapple|peach|apricot|plum|cherry|grape|fig|date|raisin|sultana|prune|strawberry|raspberry|blueberry|blackberry|cranberry|avocado)\b/},
  {family:'sugar and syrup',descriptor:'sweet',test:/\b(?:sugar|honey|syrup|molasses|treacle|jaggery|jam|marmalade)\b/},
  {family:'cocoa and chocolate',descriptor:'roasted',test:/\b(?:cocoa|cacao|chocolate)\b/},
  {family:'coffee',descriptor:'roasted',test:/\b(?:coffee|espresso)\b/},
  {family:'tea',descriptor:'floral',test:/\b(?:tea|matcha)\b/},
  {family:'wine and beer',descriptor:'fermented',test:/\b(?:wine|beer|ale|stout|cider|sherry|sake|mirin|brandy|rum|bourbon)\b/},
  {family:'pickled ingredients',descriptor:'fermented',test:/\b(?:pickle|gherkin|caper|olive|sauerkraut|kimchi)\b/},
  {family:'salt',descriptor:'saline',test:/\bsalt\b/},
  {family:'water and leavening',descriptor:'neutral',test:/\b(?:water|yeast|baking powder|baking soda|bicarbonate)\b/},
];

const singular:Record<string,string>={onions:'onion',shallots:'shallot',leeks:'leek',chives:'chive',scallions:'scallion',chillies:'chilli',chilies:'chilli',chilis:'chilli',peppers:'pepper',peppercorns:'peppercorn',tomatoes:'tomato',potatoes:'potato',eggs:'egg',cloves:'clove',mushrooms:'mushroom',prawns:'prawn',shrimps:'shrimp',mussels:'mussel',clams:'clam',scallops:'scallop',oysters:'oyster',anchovies:'anchovy',sardines:'sardine',carrots:'carrot',beans:'bean',peas:'pea',lentils:'lentil',chickpeas:'chickpea',noodles:'noodle',breadcrumbs:'breadcrumb',oats:'oat',almonds:'almond',walnuts:'walnut',cashews:'cashew',pistachios:'pistachio',peanuts:'peanut',raisins:'raisin',sultanas:'sultana',dates:'date',apples:'apple',pears:'pear',lemons:'lemon',limes:'lime',oranges:'orange',cucumbers:'cucumber',courgettes:'courgette',aubergines:'aubergine',sausages:'sausage',lardons:'lardon',fillets:'fillet',cherries:'cherry',strawberries:'strawberry',raspberries:'raspberry',blueberries:'blueberry',blackberries:'blackberry',cranberries:'cranberry',olives:'olive',capers:'caper',gherkins:'gherkin',prunes:'prune'};
export function normalizeIngredient(name:string):string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/&/g,' and ').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\b(?:chopped|diced|minced|sliced)\b/g,' ')
    .split(/\s+/).filter(Boolean).map(word=>singular[word]??word).join(' ')
    .replace(/\bscallion\b/g,'spring onion').replace(/\bgarlic clove\b/g,'garlic')
    .replace(/\bcilantro\b/g,'coriander leaves').replace(/\bfresh coriander\b/g,'coriander leaves')
    .replace(/\bchili\b/g,'chilli').replace(/\byogurt\b/g,'yoghurt').replace(/\bzucchini\b/g,'courgette')
    .replace(/\beggplant\b/g,'aubergine').replace(/\bconfectioners sugar\b/g,'icing sugar').trim();
}
function hash(text:string){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0)/4294967295;}
export type AtlasParticle={id:string;label:string;ingredient:string;x:number;y:number;intensity:number;color:string;descriptor:AtlasDescriptor;mapped:boolean;family:string};
export type AtlasProfileModel={foodId:string;foodName:string;particles:AtlasParticle[];unmappedCount:number;ingredientCount:number;methodLabel:string;hasOverrides:boolean};
export function buildAtlasProfile(food:AtlasFood,overrides:Record<string,number>={}):AtlasProfileModel {
  const seen=new Set<string>();
  const particles=food.ingredients.flatMap(({name})=>{
    const ingredient=normalizeIngredient(name);if(!ingredient||seen.has(ingredient))return[];seen.add(ingredient);
    const rule=INGREDIENT_FAMILIES.find(rule=>rule.test.test(ingredient));
    const descriptor=rule?.descriptor??'unmapped',family=rule?.family??'unmapped',anchor=anchors[descriptor];
    const id=`ingredient:${ingredient}`,supplied=overrides[id]??overrides[ingredient]??1;
    const intensity=Number.isFinite(supplied)?Math.max(0,Math.min(2,supplied)):1;
    const x=rule?Math.max(.055,Math.min(.89,anchor[0]+(hash(family+'x')-.5)*.036+(hash(ingredient+'x')-.5)*.052)):.96;
    const y=rule?Math.max(.055,Math.min(.92,anchor[1]+(hash(family+'y')-.5)*.036+(hash(ingredient+'y')-.5)*.052)):.10+hash(ingredient)*.78;
    return[{id,label:name.trim(),ingredient,x,y,intensity,color:palette[descriptor],descriptor,mapped:!!rule,family}];
  });
  const unmappedCount=particles.filter(p=>!p.mapped).length;
  return{foodId:food.id,foodName:food.name,particles,unmappedCount,ingredientCount:particles.length,
    methodLabel:'Ingredient-derived sketch',
    hasOverrides:particles.some(p=>p.intensity!==1)};
}
export function sharedIngredientScore(a:AtlasFood,b:AtlasFood):number {
  const left=new Set(a.ingredients.map(p=>normalizeIngredient(p.name)).filter(Boolean));
  const right=new Set(b.ingredients.map(p=>normalizeIngredient(p.name)).filter(Boolean));
  const union=new Set([...left,...right]);if(!union.size)return 0;
  return [...left].filter(name=>right.has(name)).length/union.size;
}
export const ATLAS_SIGMA=.074;
export function atlasContribution(p:AtlasParticle,x:number,y:number){return p.mapped?p.intensity*Math.exp(-((x-p.x)**2+(y-p.y)**2)/(2*ATLAS_SIGMA**2)):0;}
export function atlasField(particles:AtlasParticle[],x:number,y:number){return particles.reduce((sum,p)=>sum+atlasContribution(p,x,y),0);}
export function atlasBarcode<T extends AtlasParticle>(particles:T[]){return[...particles].sort((a,b)=>a.x-b.x||a.y-b.y||a.id.localeCompare(b.id));}

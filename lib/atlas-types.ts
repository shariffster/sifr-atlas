export type AtlasFood = {
  id: string;
  name: string;
  area: string;
  category: string;
  ingredients: {name: string; amount: string}[];
  sourceUrl: string;
  originalSourceUrl: string | null;
};

export type AtlasDataset = {
  meta: {provider: string; retrievedAt: string; sourceUrl: string; scopeNote: string};
  foods: AtlasFood[];
};

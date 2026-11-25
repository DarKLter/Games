export interface RecipeDef {
  dish: string;
  name: string;
  need: string[];
}

export const INGREDIENTS: string[] = [
  '🍞', '🥩', '🧀', '🍅', '🥬',
  '🥓', '🥚', '🍗', '🌽', '🍚',
  '🐟', '🍤', '🍄', '🌶️', '🍰',
  '🍫', '🥑', '🧅', '🍓', '🍯'
];

export const RECIPE_BOOK: RecipeDef[] = [
  { dish: '🍔', name: 'Classic Burger', need: ['🍞', '🥩', '🧀'] },
  { dish: '🥓', name: 'Bacon Melt', need: ['🍞', '🥩', '🧀', '🥓'] },
  { dish: '🍕', name: 'Margherita', need: ['🍞', '🍅', '🧀'] },
  { dish: '🍄', name: 'Shroom Pizza', need: ['🍞', '🍅', '🧀', '🍄'] },
  { dish: '🌮', name: 'Street Taco', need: ['🌽', '🥩', '🍅'] },
  { dish: '🌶️', name: 'Spicy Taco', need: ['🌽', '🍗', '🌶️', '🧀'] },
  { dish: '🍣', name: 'Salmon Sushi', need: ['🍚', '🐟'] },
  { dish: '🍤', name: 'Tempura Roll', need: ['🍚', '🍤', '🥬'] },
  { dish: '🥗', name: 'Garden Salad', need: ['🥬', '🍅', '🌽', '🧀'] },
  { dish: '🍳', name: 'Breakfast', need: ['🍞', '🥚', '🥓'] },
  { dish: '🍗', name: 'Spicy Bowl', need: ['🍚', '🍗', '🌶️'] },
  { dish: '🎂', name: 'Choco Cake', need: ['🍞', '🍰', '🍫'] },
  { dish: '🥑', name: 'Avo Toast', need: ['🍞', '🥑', '🥚'] },
  { dish: '🌯', name: 'Guac Wrap', need: ['🌽', '🥑', '🧅', '🍅'] },
  { dish: '🍛', name: 'Katsu Curry', need: ['🍚', '🍗', '🧅', '🍄'] },
  { dish: '🍓', name: 'Berry Tart', need: ['🍞', '🍰', '🍓', '🍯'] },
  { dish: '🥞', name: 'Honey Stack', need: ['🍞', '🥚', '🍯'] },
  { dish: '🍱', name: 'Deluxe Bento', need: ['🍚', '🐟', '🍤', '🥚'] },
  { dish: '🧀', name: 'French Dip', need: ['🍞', '🥩', '🧅', '🧀'] },
  { dish: '🥟', name: 'Chili Gyoza', need: ['🌽', '🍤', '🧅', '🌶️'] }
];

export interface RectButton {
  idx: number;
  ing: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function matchRecipe(plate: string[], recipes: RecipeDef[] = RECIPE_BOOK): RecipeDef | null {
  if (plate.length === 0) return null;
  const sortedPlate = [...plate].sort().join(',');
  return recipes.find((r) => [...r.need].sort().join(',') === sortedPlate) || null;
}

export function computeIngredientButtons(
  width: number,
  height: number,
  ingStartY: number,
  items: string[] = INGREDIENTS
): RectButton[] {
  const isCompactLandscape = width > height * 1.35 && height < 520;
  const cols = isCompactLandscape ? 10 : 5;
  const rows = Math.ceil(items.length / cols);
  const gap = width < 380 ? 5 : isCompactLandscape ? 6 : 7;
  const maxBoardW = isCompactLandscape ? Math.min(680, width - 24) : Math.min(400, width - 16);
  const btnW = Math.floor((maxBoardW - gap * (cols - 1)) / cols);
  const availH = Math.max(88, height - ingStartY - 10);
  const btnH = Math.max(30, Math.min(52, Math.floor((availH - gap * (rows - 1)) / rows)));
  const totalW = cols * btnW + (cols - 1) * gap;
  const startX = (width - totalW) / 2;

  return items.map((ing, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    return {
      idx,
      ing,
      x: startX + c * (btnW + gap),
      y: ingStartY + r * (btnH + gap),
      w: btnW,
      h: btnH
    };
  });
}

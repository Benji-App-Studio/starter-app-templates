/** Nutrition per serving. Grams are rounded; calories are typical values for the serving named. */
export type Food = {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * A small built-in list for logging without typing numbers. Version two can
 * replace it with a database or a photo scan (see `scan.ts`).
 */
export const foods: Food[] = [
  { id: 'egg', name: 'Egg, boiled or fried', serving: '1 large', calories: 78, protein: 6, carbs: 1, fat: 5 },
  { id: 'oatmeal', name: 'Oatmeal, cooked', serving: '1 cup', calories: 160, protein: 6, carbs: 27, fat: 3 },
  { id: 'greek-yogurt', name: 'Greek yogurt, plain', serving: '170 g pot', calories: 100, protein: 17, carbs: 6, fat: 1 },
  { id: 'banana', name: 'Banana', serving: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { id: 'apple', name: 'Apple', serving: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { id: 'orange', name: 'Orange', serving: '1 medium', calories: 62, protein: 1, carbs: 15, fat: 0 },
  { id: 'berries', name: 'Mixed berries', serving: '1 cup', calories: 70, protein: 1, carbs: 17, fat: 0 },
  { id: 'toast', name: 'Toast, whole wheat', serving: '1 slice', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { id: 'bagel', name: 'Bagel, plain', serving: '1 medium', calories: 280, protein: 11, carbs: 56, fat: 2 },
  { id: 'croissant', name: 'Croissant', serving: '1 medium', calories: 230, protein: 5, carbs: 26, fat: 12 },
  { id: 'peanut-butter', name: 'Peanut butter', serving: '1 tbsp', calories: 95, protein: 4, carbs: 3, fat: 8 },
  { id: 'butter', name: 'Butter', serving: '1 tbsp', calories: 100, protein: 0, carbs: 0, fat: 11 },
  { id: 'avocado', name: 'Avocado', serving: '1/2 fruit', calories: 120, protein: 1, carbs: 6, fat: 11 },
  { id: 'milk', name: 'Milk, 2%', serving: '1 cup', calories: 120, protein: 8, carbs: 12, fat: 5 },
  { id: 'latte', name: 'Latte', serving: '12 oz', calories: 150, protein: 8, carbs: 13, fat: 6 },
  { id: 'coffee', name: 'Coffee, black', serving: '1 cup', calories: 2, protein: 0, carbs: 0, fat: 0 },
  { id: 'orange-juice', name: 'Orange juice', serving: '1 cup', calories: 110, protein: 2, carbs: 26, fat: 0 },
  { id: 'chicken-breast', name: 'Chicken breast, grilled', serving: '100 g', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { id: 'salmon', name: 'Salmon, baked', serving: '100 g', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 'tuna', name: 'Tuna, canned in water', serving: '1 can', calories: 120, protein: 26, carbs: 0, fat: 1 },
  { id: 'beef', name: 'Ground beef, cooked', serving: '100 g', calories: 250, protein: 26, carbs: 0, fat: 15 },
  { id: 'steak', name: 'Steak, sirloin', serving: '150 g', calories: 300, protein: 40, carbs: 0, fat: 15 },
  { id: 'tofu', name: 'Tofu, firm', serving: '100 g', calories: 145, protein: 16, carbs: 3, fat: 9 },
  { id: 'rice', name: 'White rice, cooked', serving: '1 cup', calories: 205, protein: 4, carbs: 45, fat: 0 },
  { id: 'brown-rice', name: 'Brown rice, cooked', serving: '1 cup', calories: 215, protein: 5, carbs: 45, fat: 2 },
  { id: 'pasta', name: 'Pasta, cooked', serving: '1 cup', calories: 220, protein: 8, carbs: 43, fat: 1 },
  { id: 'potato', name: 'Potato, baked', serving: '1 medium', calories: 160, protein: 4, carbs: 37, fat: 0 },
  { id: 'fries', name: 'French fries', serving: 'medium portion', calories: 365, protein: 4, carbs: 48, fat: 17 },
  { id: 'sweet-potato', name: 'Sweet potato, baked', serving: '1 medium', calories: 105, protein: 2, carbs: 24, fat: 0 },
  { id: 'quinoa', name: 'Quinoa, cooked', serving: '1 cup', calories: 220, protein: 8, carbs: 39, fat: 4 },
  { id: 'beans', name: 'Black beans', serving: '1 cup', calories: 225, protein: 15, carbs: 41, fat: 1 },
  { id: 'lentils', name: 'Lentils, cooked', serving: '1 cup', calories: 230, protein: 18, carbs: 40, fat: 1 },
  { id: 'salad', name: 'Green salad, no dressing', serving: '2 cups', calories: 20, protein: 1, carbs: 4, fat: 0 },
  { id: 'caesar', name: 'Caesar salad with chicken', serving: '1 bowl', calories: 470, protein: 35, carbs: 12, fat: 31 },
  { id: 'broccoli', name: 'Broccoli, steamed', serving: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 1 },
  { id: 'carrots', name: 'Carrots', serving: '1 cup', calories: 50, protein: 1, carbs: 12, fat: 0 },
  { id: 'olive-oil', name: 'Olive oil', serving: '1 tbsp', calories: 120, protein: 0, carbs: 0, fat: 14 },
  { id: 'cheese', name: 'Cheddar cheese', serving: '30 g', calories: 120, protein: 7, carbs: 0, fat: 10 },
  { id: 'hummus', name: 'Hummus', serving: '2 tbsp', calories: 70, protein: 2, carbs: 6, fat: 5 },
  { id: 'almonds', name: 'Almonds', serving: 'small handful (28 g)', calories: 165, protein: 6, carbs: 6, fat: 14 },
  { id: 'protein-bar', name: 'Protein bar', serving: '1 bar', calories: 210, protein: 20, carbs: 22, fat: 7 },
  { id: 'protein-shake', name: 'Whey protein shake', serving: '1 scoop with water', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { id: 'sandwich', name: 'Turkey sandwich', serving: '1 sandwich', calories: 350, protein: 25, carbs: 40, fat: 10 },
  { id: 'burger', name: 'Cheeseburger', serving: '1 burger', calories: 540, protein: 30, carbs: 40, fat: 28 },
  { id: 'pizza', name: 'Pizza, cheese', serving: '1 slice', calories: 285, protein: 12, carbs: 36, fat: 10 },
  { id: 'burrito', name: 'Chicken burrito', serving: '1 burrito', calories: 650, protein: 35, carbs: 70, fat: 24 },
  { id: 'sushi', name: 'Sushi roll', serving: '8 pieces', calories: 300, protein: 10, carbs: 50, fat: 6 },
  { id: 'ramen', name: 'Ramen', serving: '1 bowl', calories: 480, protein: 20, carbs: 65, fat: 15 },
  { id: 'chocolate', name: 'Dark chocolate', serving: '2 squares (20 g)', calories: 115, protein: 1, carbs: 9, fat: 8 },
  { id: 'cookie', name: 'Chocolate chip cookie', serving: '1 cookie', calories: 150, protein: 2, carbs: 20, fat: 7 },
  { id: 'ice-cream', name: 'Ice cream', serving: '1/2 cup', calories: 140, protein: 2, carbs: 17, fat: 7 },
  { id: 'chips', name: 'Potato chips', serving: 'small bag (28 g)', calories: 150, protein: 2, carbs: 15, fat: 10 },
  { id: 'beer', name: 'Beer', serving: '12 oz', calories: 150, protein: 2, carbs: 13, fat: 0 },
  { id: 'wine', name: 'Wine', serving: '5 oz glass', calories: 125, protein: 0, carbs: 4, fat: 0 },
  { id: 'soda', name: 'Soda', serving: '12 oz can', calories: 140, protein: 0, carbs: 39, fat: 0 },
];

/** Case-insensitive match on any word of the name; an empty query lists the whole set. */
export function searchFoods(query: string, limit: number): Food[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return foods.slice(0, limit);
  }
  const startsWith = foods.filter((food) => food.name.toLowerCase().startsWith(needle));
  const contains = foods.filter(
    (food) => !startsWith.includes(food) && food.name.toLowerCase().includes(needle),
  );
  return [...startsWith, ...contains].slice(0, limit);
}

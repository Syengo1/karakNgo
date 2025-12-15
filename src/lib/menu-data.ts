export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string; // We will use placeholders for now
  tags?: string[]; // e.g., ['Best Seller', 'Spicy']
}

export const MENU_CATEGORIES = [
  "Matcha", "Iced Coffee", "Hot Coffee", "Mojitos", "Sandos", "Sweets"
] as const;

export const MENU_ITEMS: Product[] = [
  // --- MATCHA (The Stars) ---
  {
    id: "m-1",
    name: "Iced Vanilla Matcha Latte",
    description: "The OG: Ceremonial Grade Matcha, Milk & Vanilla. The one that started it all.",
    price: 650,
    category: "Matcha",
    tags: ["Best Seller"]
  },
  {
    id: "m-2",
    name: "Matcha Max",
    description: "Our bestselling Iced Vanilla Matcha - leveled up with an extra kick.",
    price: 750,
    category: "Matcha"
  },
  {
    id: "m-3",
    name: "Iced Strawberry Milk Matcha",
    price: 680,
    category: "Matcha",
    tags: ["Aesthetic"]
  },
  {
    id: "m-4",
    name: "Coconut Cloud Matcha",
    description: "Refreshing coconut water base topped with delicate ceremonial matcha foam.",
    price: 690,
    category: "Matcha"
  },

  // --- ICED COFFEE ---
  {
    id: "ic-1",
    name: "The Original Iced Karak",
    price: 650,
    category: "Iced Coffee",
    tags: ["Signature"]
  },
  {
    id: "ic-2",
    name: "Iced Spanish Latte",
    price: 550,
    category: "Iced Coffee"
  },
  {
    id: "ic-3",
    name: "Iced Brown Sugar Shaken Espresso",
    price: 500,
    category: "Iced Coffee",
    tags: ["Must Try"]
  },

  // --- SANDOS (Food) ---
  {
    id: "f-1",
    name: "Shawarma Sliders",
    description: "Three marinated shawarma chicken sliders, house-made garlic & K&G special sauce.",
    price: 1250,
    category: "Sandos",
    tags: ["Spicy or Mild"]
  },
  {
    id: "f-2",
    name: "K&G Chicken Sando",
    description: "Signature chicken on Freshly Baked Rolls.",
    price: 820,
    category: "Sandos"
  },
  {
    id: "f-3",
    name: "Tiraleche",
    description: "Karak & Go's Signature Tiramisu & Tres Leche combination.",
    price: 650,
    category: "Sweets"
  }
];

// ... existing code ...

export const MODIFIERS = {
  milks: [
    { id: 'milk-oat', name: 'Oat Milk', price: 120, type: 'milk' },
    { id: 'milk-soy', name: 'Soy Milk', price: 120, type: 'milk' },
    { id: 'milk-almond', name: 'Almond Milk', price: 120, type: 'milk' },
    { id: 'milk-coconut', name: 'Coconut Milk', price: 120, type: 'milk' },
  ],
  toppings: [
    { id: 'top-straw', name: 'Strawberry Cold Foam', price: 150, type: 'topping' },
    { id: 'top-salt', name: 'Salted Vanilla Cold Foam', price: 150, type: 'topping' },
  ],
  extras: [
    { id: 'ex-shot', name: 'Extra Shot Espresso', price: 100, type: 'shot' },
    { id: 'ex-matcha', name: 'Extra Matcha', price: 100, type: 'shot' },
    { id: 'ex-syrup', name: 'Extra Syrup', price: 80, type: 'syrup' },
  ]
} as const;

export const STICKER_PHRASES = [
  "Emotional Support Beverage",
  "Just a girl",
  "Fuel for the plot",
  "Nairobi Baddie",
  "Focus Pocus",
  "Chaos & Caffeine"
];
/**
 * Local Food Database - Common cuisines and dishes with nutrition data
 * Used for instant recognition without API calls
 * Falls back to API for unknown foods
 */

export interface FoodItem {
  name: string;
  aliases: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
  cuisine: string;
  confidence: number;
  suggestions: string[];
}

export const FOOD_DATABASE: FoodItem[] = [
  // 🇺🇸 American
  {
    name: 'Cheeseburger',
    aliases: ['burger', 'hamburger', 'cheese burger', 'beef burger', 'american burger'],
    calories: 550,
    protein: 30,
    carbs: 40,
    fat: 32,
    portion_size: 'Medium burger (200g)',
    cuisine: 'American',
    confidence: 0.92,
    suggestions: ['Opt for lean beef patty', 'Add lettuce and tomato for nutrients', 'Try whole grain bun'],
  },
  {
    name: 'Grilled Steak',
    aliases: ['steak', 'beef steak', 'ribeye', 'sirloin', 't-bone', 'filet mignon', 'new york strip'],
    calories: 679,
    protein: 62,
    carbs: 0,
    fat: 48,
    portion_size: 'Large steak (300g)',
    cuisine: 'American',
    confidence: 0.94,
    suggestions: ['Great protein source!', 'Pair with vegetables', 'Limit to 2-3 times per week'],
  },
  {
    name: 'BBQ Ribs',
    aliases: ['ribs', 'bbq ribs', 'pork ribs', 'barbecue ribs', 'spare ribs', 'baby back ribs'],
    calories: 750,
    protein: 45,
    carbs: 25,
    fat: 52,
    portion_size: 'Half rack (350g)',
    cuisine: 'American',
    confidence: 0.91,
    suggestions: ['High in protein', 'Watch the sauce sugar content', 'Balance with coleslaw'],
  },
  {
    name: 'Mac and Cheese',
    aliases: ['mac & cheese', 'macaroni and cheese', 'mac n cheese', 'macaroni cheese'],
    calories: 450,
    protein: 18,
    carbs: 52,
    fat: 22,
    portion_size: 'Medium bowl (280g)',
    cuisine: 'American',
    confidence: 0.93,
    suggestions: ['Add broccoli for fiber', 'Try whole wheat pasta', 'Use low-fat cheese'],
  },
  {
    name: 'Hot Dog',
    aliases: ['hotdog', 'frankfurter', 'wiener', 'sausage in bun'],
    calories: 290,
    protein: 11,
    carbs: 24,
    fat: 17,
    portion_size: 'One hot dog (100g)',
    cuisine: 'American',
    confidence: 0.95,
    suggestions: ['Choose turkey or chicken dogs', 'Limit processed meats', 'Add sauerkraut'],
  },
  {
    name: 'Fried Chicken',
    aliases: ['chicken wings', 'chicken tenders', 'chicken strips', 'crispy chicken', 'southern fried chicken'],
    calories: 480,
    protein: 35,
    carbs: 18,
    fat: 30,
    portion_size: '3 pieces (200g)',
    cuisine: 'American',
    confidence: 0.92,
    suggestions: ['Try baked version for less fat', 'Remove skin to reduce calories', 'Pair with salad'],
  },

  // 🇮🇹 Italian
  {
    name: 'Margherita Pizza',
    aliases: ['pizza', 'cheese pizza', 'italian pizza', 'pepperoni pizza', 'pizza slice'],
    calories: 266,
    protein: 11,
    carbs: 33,
    fat: 10,
    portion_size: 'One slice (107g)',
    cuisine: 'Italian',
    confidence: 0.94,
    suggestions: ['Add vegetable toppings', 'Choose thin crust', 'Limit to 2-3 slices'],
  },
  {
    name: 'Spaghetti Bolognese',
    aliases: ['pasta', 'spaghetti', 'bolognese', 'pasta with meat sauce', 'italian pasta'],
    calories: 520,
    protein: 24,
    carbs: 65,
    fat: 18,
    portion_size: 'Large plate (350g)',
    cuisine: 'Italian',
    confidence: 0.93,
    suggestions: ['Use whole wheat pasta', 'Add more vegetables', 'Control portion size'],
  },
  {
    name: 'Risotto',
    aliases: ['mushroom risotto', 'seafood risotto', 'italian rice', 'arborio rice'],
    calories: 380,
    protein: 12,
    carbs: 58,
    fat: 14,
    portion_size: 'Medium bowl (280g)',
    cuisine: 'Italian',
    confidence: 0.90,
    suggestions: ['Rich in carbs for energy', 'Add vegetables', 'Watch butter content'],
  },
  {
    name: 'Lasagna',
    aliases: ['lasagne', 'meat lasagna', 'italian lasagna', 'baked pasta'],
    calories: 580,
    protein: 28,
    carbs: 42,
    fat: 32,
    portion_size: 'Large piece (350g)',
    cuisine: 'Italian',
    confidence: 0.94,
    suggestions: ['High in protein and calcium', 'Try vegetable lasagna', 'Balance with salad'],
  },
  {
    name: 'Fettuccine Alfredo',
    aliases: ['alfredo pasta', 'creamy pasta', 'white sauce pasta'],
    calories: 620,
    protein: 18,
    carbs: 55,
    fat: 38,
    portion_size: 'Large plate (320g)',
    cuisine: 'Italian',
    confidence: 0.91,
    suggestions: ['High in saturated fat', 'Ask for lighter sauce', 'Add grilled chicken'],
  },

  // 🇲🇽 Mexican
  {
    name: 'Beef Tacos',
    aliases: ['tacos', 'taco', 'street tacos', 'mexican tacos', 'chicken tacos', 'fish tacos'],
    calories: 340,
    protein: 18,
    carbs: 28,
    fat: 18,
    portion_size: '2 tacos (180g)',
    cuisine: 'Mexican',
    confidence: 0.93,
    suggestions: ['Use corn tortillas', 'Add fresh salsa', 'Include beans for fiber'],
  },
  {
    name: 'Burrito',
    aliases: ['beef burrito', 'chicken burrito', 'bean burrito', 'mexican burrito', 'breakfast burrito'],
    calories: 580,
    protein: 28,
    carbs: 65,
    fat: 22,
    portion_size: 'Large burrito (350g)',
    cuisine: 'Mexican',
    confidence: 0.94,
    suggestions: ['Skip the sour cream', 'Add more vegetables', 'Try burrito bowl instead'],
  },
  {
    name: 'Enchiladas',
    aliases: ['enchilada', 'chicken enchiladas', 'beef enchiladas', 'cheese enchiladas'],
    calories: 420,
    protein: 22,
    carbs: 38,
    fat: 20,
    portion_size: '2 enchiladas (280g)',
    cuisine: 'Mexican',
    confidence: 0.92,
    suggestions: ['Choose verde sauce', 'Add black beans', 'Reduce cheese'],
  },
  {
    name: 'Nachos',
    aliases: ['nachos with cheese', 'loaded nachos', 'mexican nachos', 'tortilla chips'],
    calories: 480,
    protein: 15,
    carbs: 45,
    fat: 28,
    portion_size: 'Medium plate (200g)',
    cuisine: 'Mexican',
    confidence: 0.91,
    suggestions: ['Share as appetizer', 'Add beans and veggies', 'Limit cheese and sour cream'],
  },
  {
    name: 'Quesadilla',
    aliases: ['cheese quesadilla', 'chicken quesadilla', 'mexican quesadilla'],
    calories: 490,
    protein: 24,
    carbs: 38,
    fat: 26,
    portion_size: 'Large quesadilla (250g)',
    cuisine: 'Mexican',
    confidence: 0.93,
    suggestions: ['Use whole wheat tortilla', 'Add grilled vegetables', 'Choose lean protein'],
  },
  {
    name: 'Guacamole',
    aliases: ['avocado dip', 'guac', 'mexican guacamole'],
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    portion_size: 'Small bowl (100g)',
    cuisine: 'Mexican',
    confidence: 0.96,
    suggestions: ['Healthy fats from avocado', 'Great with veggies', 'Rich in potassium'],
  },

  // 🇨🇳 Chinese
  {
    name: 'Fried Rice',
    aliases: ['chinese fried rice', 'egg fried rice', 'vegetable fried rice', 'yang chow fried rice'],
    calories: 420,
    protein: 12,
    carbs: 58,
    fat: 16,
    portion_size: 'Large bowl (300g)',
    cuisine: 'Chinese',
    confidence: 0.94,
    suggestions: ['Ask for less oil', 'Add more vegetables', 'Choose brown rice if available'],
  },
  {
    name: 'Chow Mein',
    aliases: ['noodles', 'chinese noodles', 'lo mein', 'stir fry noodles', 'egg noodles'],
    calories: 380,
    protein: 14,
    carbs: 48,
    fat: 15,
    portion_size: 'Large plate (280g)',
    cuisine: 'Chinese',
    confidence: 0.93,
    suggestions: ['Request less sauce', 'Add extra vegetables', 'Choose steamed over fried'],
  },
  {
    name: 'Dumplings',
    aliases: ['chinese dumplings', 'potstickers', 'gyoza', 'dim sum', 'wontons', 'jiaozi'],
    calories: 280,
    protein: 14,
    carbs: 32,
    fat: 12,
    portion_size: '6 dumplings (150g)',
    cuisine: 'Chinese',
    confidence: 0.92,
    suggestions: ['Steamed is healthier than fried', 'Good protein source', 'Watch sodium in dipping sauce'],
  },
  {
    name: 'Kung Pao Chicken',
    aliases: ['stir fry', 'chicken stir fry', 'kung pao', 'chinese chicken', 'szechuan chicken'],
    calories: 450,
    protein: 32,
    carbs: 25,
    fat: 26,
    portion_size: 'Large serving (300g)',
    cuisine: 'Chinese',
    confidence: 0.91,
    suggestions: ['High in protein', 'Ask for less oil', 'Pair with steamed rice'],
  },
  {
    name: 'Sweet and Sour Pork',
    aliases: ['sweet sour pork', 'sweet and sour chicken', 'chinese pork'],
    calories: 480,
    protein: 22,
    carbs: 45,
    fat: 24,
    portion_size: 'Large serving (280g)',
    cuisine: 'Chinese',
    confidence: 0.90,
    suggestions: ['High in sugar', 'Balance with vegetables', 'Try steamed version'],
  },
  {
    name: 'Spring Rolls',
    aliases: ['egg rolls', 'chinese rolls', 'fried spring rolls', 'vegetable rolls'],
    calories: 220,
    protein: 6,
    carbs: 28,
    fat: 10,
    portion_size: '2 rolls (120g)',
    cuisine: 'Chinese',
    confidence: 0.94,
    suggestions: ['Fresh rolls are healthier', 'Great appetizer', 'Dip in light sauce'],
  },

  // 🇯🇵 Japanese
  {
    name: 'Sushi Roll',
    aliases: ['sushi', 'maki', 'california roll', 'salmon roll', 'tuna roll', 'dragon roll', 'sashimi'],
    calories: 350,
    protein: 18,
    carbs: 45,
    fat: 12,
    portion_size: '8 pieces (220g)',
    cuisine: 'Japanese',
    confidence: 0.95,
    suggestions: ['Rich in omega-3', 'Watch soy sauce sodium', 'Choose sashimi for fewer carbs'],
  },
  {
    name: 'Ramen',
    aliases: ['japanese ramen', 'noodle soup', 'tonkotsu ramen', 'miso ramen', 'shoyu ramen'],
    calories: 520,
    protein: 25,
    carbs: 58,
    fat: 22,
    portion_size: 'Large bowl (500g)',
    cuisine: 'Japanese',
    confidence: 0.94,
    suggestions: ['High in sodium', 'Add extra vegetables', 'Choose lighter broth'],
  },
  {
    name: 'Tempura',
    aliases: ['shrimp tempura', 'vegetable tempura', 'japanese fried', 'tempura prawns'],
    calories: 380,
    protein: 15,
    carbs: 35,
    fat: 22,
    portion_size: 'Mixed plate (180g)',
    cuisine: 'Japanese',
    confidence: 0.92,
    suggestions: ['Fried but light batter', 'Pair with miso soup', 'Eat in moderation'],
  },
  {
    name: 'Bento Box',
    aliases: ['bento', 'japanese lunch box', 'japanese bento', 'lunch set'],
    calories: 680,
    protein: 35,
    carbs: 75,
    fat: 25,
    portion_size: 'Complete box (450g)',
    cuisine: 'Japanese',
    confidence: 0.90,
    suggestions: ['Balanced meal', 'Good variety of nutrients', 'Watch rice portion'],
  },
  {
    name: 'Teriyaki Chicken',
    aliases: ['teriyaki', 'chicken teriyaki', 'japanese chicken'],
    calories: 420,
    protein: 38,
    carbs: 28,
    fat: 18,
    portion_size: 'Large serving (280g)',
    cuisine: 'Japanese',
    confidence: 0.93,
    suggestions: ['Good protein source', 'Watch sauce sugar', 'Pair with steamed vegetables'],
  },
  {
    name: 'Miso Soup',
    aliases: ['miso', 'japanese soup', 'tofu soup'],
    calories: 84,
    protein: 6,
    carbs: 8,
    fat: 3,
    portion_size: 'Bowl (250ml)',
    cuisine: 'Japanese',
    confidence: 0.96,
    suggestions: ['Low calorie starter', 'Rich in probiotics', 'Watch sodium content'],
  },

  // 🇮🇳 Indian
  {
    name: 'Chicken Curry',
    aliases: ['curry', 'indian curry', 'tikka masala', 'butter chicken', 'chicken tikka', 'korma'],
    calories: 480,
    protein: 32,
    carbs: 22,
    fat: 30,
    portion_size: 'Large serving (320g)',
    cuisine: 'Indian',
    confidence: 0.93,
    suggestions: ['Rich in spices with health benefits', 'Choose tomato-based curry', 'Watch cream content'],
  },
  {
    name: 'Biryani',
    aliases: ['chicken biryani', 'lamb biryani', 'vegetable biryani', 'indian rice', 'hyderabadi biryani'],
    calories: 550,
    protein: 28,
    carbs: 68,
    fat: 20,
    portion_size: 'Large plate (400g)',
    cuisine: 'Indian',
    confidence: 0.94,
    suggestions: ['Complete meal with protein and carbs', 'Pair with raita', 'Control portion size'],
  },
  {
    name: 'Naan Bread',
    aliases: ['naan', 'indian bread', 'garlic naan', 'butter naan', 'roti', 'chapati'],
    calories: 260,
    protein: 8,
    carbs: 45,
    fat: 6,
    portion_size: 'One piece (90g)',
    cuisine: 'Indian',
    confidence: 0.95,
    suggestions: ['Choose tandoori roti for less fat', 'Limit to 1-2 pieces', 'Skip the butter'],
  },
  {
    name: 'Samosas',
    aliases: ['samosa', 'indian samosa', 'vegetable samosa', 'potato samosa'],
    calories: 310,
    protein: 6,
    carbs: 32,
    fat: 18,
    portion_size: '2 pieces (120g)',
    cuisine: 'Indian',
    confidence: 0.94,
    suggestions: ['Try baked version', 'Good vegetarian option', 'Pair with mint chutney'],
  },
  {
    name: 'Dal',
    aliases: ['daal', 'lentil curry', 'dal tadka', 'yellow dal', 'indian lentils'],
    calories: 220,
    protein: 14,
    carbs: 32,
    fat: 6,
    portion_size: 'Medium bowl (250g)',
    cuisine: 'Indian',
    confidence: 0.92,
    suggestions: ['Excellent plant protein', 'High in fiber', 'Heart healthy'],
  },
  {
    name: 'Palak Paneer',
    aliases: ['paneer', 'saag paneer', 'spinach paneer', 'indian cheese'],
    calories: 380,
    protein: 18,
    carbs: 12,
    fat: 28,
    portion_size: 'Medium serving (250g)',
    cuisine: 'Indian',
    confidence: 0.91,
    suggestions: ['Rich in calcium and iron', 'Vegetarian protein', 'Good with brown rice'],
  },

  // 🇹🇭 Thai
  {
    name: 'Pad Thai',
    aliases: ['thai noodles', 'pad thai noodles', 'thai stir fry noodles'],
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 18,
    portion_size: 'Large plate (350g)',
    cuisine: 'Thai',
    confidence: 0.95,
    suggestions: ['Ask for less sugar', 'Add extra vegetables', 'Choose tofu for plant protein'],
  },
  {
    name: 'Green Curry',
    aliases: ['thai curry', 'thai green curry', 'red curry', 'massaman curry', 'panang curry'],
    calories: 420,
    protein: 25,
    carbs: 18,
    fat: 30,
    portion_size: 'Large serving (350g)',
    cuisine: 'Thai',
    confidence: 0.93,
    suggestions: ['Rich in spices', 'Choose chicken or tofu', 'Watch coconut milk content'],
  },
  {
    name: 'Tom Yum Soup',
    aliases: ['tom yum', 'thai soup', 'hot and sour soup', 'tom kha'],
    calories: 180,
    protein: 15,
    carbs: 12,
    fat: 8,
    portion_size: 'Large bowl (400ml)',
    cuisine: 'Thai',
    confidence: 0.94,
    suggestions: ['Low calorie option', 'Anti-inflammatory spices', 'Great starter'],
  },
  {
    name: 'Thai Fried Rice',
    aliases: ['khao pad', 'pineapple fried rice', 'basil fried rice'],
    calories: 480,
    protein: 16,
    carbs: 62,
    fat: 18,
    portion_size: 'Large plate (350g)',
    cuisine: 'Thai',
    confidence: 0.92,
    suggestions: ['Ask for less oil', 'Add extra protein', 'Balance with salad'],
  },

  // 🇻🇳 Vietnamese
  {
    name: 'Pho',
    aliases: ['vietnamese pho', 'beef pho', 'pho bo', 'chicken pho', 'pho ga', 'vietnamese noodle soup'],
    calories: 380,
    protein: 28,
    carbs: 45,
    fat: 10,
    portion_size: 'Large bowl (600ml)',
    cuisine: 'Vietnamese',
    confidence: 0.95,
    suggestions: ['Low fat option', 'Add fresh herbs', 'Rich in protein'],
  },
  {
    name: 'Banh Mi',
    aliases: ['vietnamese sandwich', 'banh mi sandwich', 'vietnamese baguette'],
    calories: 420,
    protein: 22,
    carbs: 48,
    fat: 16,
    portion_size: 'One sandwich (280g)',
    cuisine: 'Vietnamese',
    confidence: 0.94,
    suggestions: ['Fresh vegetables inside', 'Balanced meal', 'Choose grilled meat'],
  },
  {
    name: 'Fresh Spring Rolls',
    aliases: ['vietnamese spring rolls', 'summer rolls', 'goi cuon', 'rice paper rolls'],
    calories: 180,
    protein: 12,
    carbs: 24,
    fat: 4,
    portion_size: '2 rolls (140g)',
    cuisine: 'Vietnamese',
    confidence: 0.94,
    suggestions: ['Very healthy option', 'Fresh vegetables', 'Low calorie'],
  },
  {
    name: 'Bun Cha',
    aliases: ['vietnamese pork', 'grilled pork noodles', 'bun thit nuong'],
    calories: 520,
    protein: 32,
    carbs: 55,
    fat: 18,
    portion_size: 'Large bowl (400g)',
    cuisine: 'Vietnamese',
    confidence: 0.91,
    suggestions: ['Balanced meal', 'Lots of fresh herbs', 'Watch fish sauce sodium'],
  },

  // 🇪🇸 Spanish
  {
    name: 'Paella',
    aliases: ['spanish paella', 'seafood paella', 'chicken paella', 'valencian paella'],
    calories: 520,
    protein: 28,
    carbs: 58,
    fat: 20,
    portion_size: 'Large serving (380g)',
    cuisine: 'Spanish',
    confidence: 0.93,
    suggestions: ['Complete meal', 'Rich in seafood omega-3', 'Control portion size'],
  },
  {
    name: 'Tapas',
    aliases: ['spanish tapas', 'patatas bravas', 'spanish appetizers', 'small plates'],
    calories: 350,
    protein: 12,
    carbs: 35,
    fat: 18,
    portion_size: 'Mixed plate (200g)',
    cuisine: 'Spanish',
    confidence: 0.88,
    suggestions: ['Share with others', 'Choose grilled options', 'Great for variety'],
  },
  {
    name: 'Churros',
    aliases: ['spanish churros', 'churros with chocolate'],
    calories: 280,
    protein: 4,
    carbs: 38,
    fat: 14,
    portion_size: '3 pieces (80g)',
    cuisine: 'Spanish',
    confidence: 0.95,
    suggestions: ['Dessert treat', 'High in sugar', 'Share or save for special occasions'],
  },

  // 🇱🇧 Middle Eastern
  {
    name: 'Falafel',
    aliases: ['falafel wrap', 'falafel pita', 'chickpea falafel'],
    calories: 340,
    protein: 14,
    carbs: 42,
    fat: 15,
    portion_size: 'Wrap with 4 falafels (250g)',
    cuisine: 'Middle Eastern',
    confidence: 0.94,
    suggestions: ['Plant-based protein', 'High in fiber', 'Choose baked over fried'],
  },
  {
    name: 'Hummus',
    aliases: ['hummus dip', 'chickpea dip', 'lebanese hummus'],
    calories: 180,
    protein: 8,
    carbs: 18,
    fat: 10,
    portion_size: 'Small bowl (100g)',
    cuisine: 'Middle Eastern',
    confidence: 0.96,
    suggestions: ['Healthy fats and protein', 'Great with veggies', 'Heart healthy'],
  },
  {
    name: 'Shawarma',
    aliases: ['chicken shawarma', 'beef shawarma', 'lamb shawarma', 'shawarma wrap', 'doner', 'gyro'],
    calories: 520,
    protein: 35,
    carbs: 42,
    fat: 24,
    portion_size: 'Large wrap (320g)',
    cuisine: 'Middle Eastern',
    confidence: 0.93,
    suggestions: ['High protein meal', 'Choose chicken for less fat', 'Add extra vegetables'],
  },
  {
    name: 'Kebab',
    aliases: ['shish kebab', 'kofte', 'kofta', 'grilled meat', 'lamb kebab', 'chicken kebab'],
    calories: 450,
    protein: 38,
    carbs: 8,
    fat: 30,
    portion_size: 'Large skewer (200g)',
    cuisine: 'Middle Eastern',
    confidence: 0.92,
    suggestions: ['High in protein', 'Grilled is healthy', 'Pair with salad'],
  },
  {
    name: 'Tabbouleh',
    aliases: ['tabouli', 'parsley salad', 'lebanese salad', 'bulgur salad'],
    calories: 120,
    protein: 4,
    carbs: 18,
    fat: 5,
    portion_size: 'Medium bowl (150g)',
    cuisine: 'Middle Eastern',
    confidence: 0.93,
    suggestions: ['Very healthy option', 'High in fiber', 'Fresh and nutritious'],
  },

  // 🇰🇷 Korean
  {
    name: 'Bibimbap',
    aliases: ['korean bibimbap', 'mixed rice bowl', 'dolsot bibimbap', 'korean rice bowl'],
    calories: 520,
    protein: 25,
    carbs: 68,
    fat: 18,
    portion_size: 'Large bowl (450g)',
    cuisine: 'Korean',
    confidence: 0.94,
    suggestions: ['Balanced meal with vegetables', 'Add extra vegetables', 'Go easy on gochujang'],
  },
  {
    name: 'Korean BBQ',
    aliases: ['korean bbq', 'bulgogi', 'galbi', 'korean grilled meat', 'samgyupsal', 'pork belly'],
    calories: 580,
    protein: 45,
    carbs: 15,
    fat: 38,
    portion_size: 'Large serving (300g)',
    cuisine: 'Korean',
    confidence: 0.93,
    suggestions: ['High protein', 'Wrap in lettuce', 'Balance with banchan'],
  },
  {
    name: 'Kimchi',
    aliases: ['korean kimchi', 'fermented cabbage', 'kimchi side dish'],
    calories: 40,
    protein: 2,
    carbs: 6,
    fat: 1,
    portion_size: 'Small bowl (100g)',
    cuisine: 'Korean',
    confidence: 0.97,
    suggestions: ['Probiotic superfood', 'Very low calorie', 'Great for gut health'],
  },
  {
    name: 'Japchae',
    aliases: ['korean noodles', 'glass noodles', 'sweet potato noodles'],
    calories: 380,
    protein: 8,
    carbs: 52,
    fat: 16,
    portion_size: 'Large plate (280g)',
    cuisine: 'Korean',
    confidence: 0.91,
    suggestions: ['Gluten-free noodles', 'Add more vegetables', 'Watch sesame oil'],
  },
  {
    name: 'Korean Fried Chicken',
    aliases: ['kfc korean', 'korean chicken', 'yangnyeom chicken', 'crispy korean chicken'],
    calories: 520,
    protein: 32,
    carbs: 28,
    fat: 32,
    portion_size: '4 pieces (240g)',
    cuisine: 'Korean',
    confidence: 0.92,
    suggestions: ['Double fried for crispiness', 'Share as appetizer', 'Balance with pickled radish'],
  },

  // 🇫🇷 French
  {
    name: 'Croissant',
    aliases: ['french croissant', 'butter croissant', 'chocolate croissant', 'pain au chocolat'],
    calories: 280,
    protein: 5,
    carbs: 32,
    fat: 15,
    portion_size: 'One piece (60g)',
    cuisine: 'French',
    confidence: 0.96,
    suggestions: ['Breakfast treat', 'High in butter', 'Enjoy occasionally'],
  },
  {
    name: 'Crepes',
    aliases: ['french crepes', 'crepe', 'sweet crepe', 'savory crepe', 'galette'],
    calories: 350,
    protein: 10,
    carbs: 45,
    fat: 15,
    portion_size: 'One crepe with filling (180g)',
    cuisine: 'French',
    confidence: 0.94,
    suggestions: ['Choose fruit fillings', 'Savory options available', 'Light and versatile'],
  },
  {
    name: 'Soufflé',
    aliases: ['french souffle', 'cheese souffle', 'chocolate souffle'],
    calories: 320,
    protein: 12,
    carbs: 28,
    fat: 18,
    portion_size: 'One serving (150g)',
    cuisine: 'French',
    confidence: 0.90,
    suggestions: ['Light and airy', 'Protein from eggs', 'Special occasion dish'],
  },
  {
    name: 'French Onion Soup',
    aliases: ['onion soup', 'soupe a loignon'],
    calories: 280,
    protein: 12,
    carbs: 22,
    fat: 16,
    portion_size: 'Bowl (350ml)',
    cuisine: 'French',
    confidence: 0.93,
    suggestions: ['Warming comfort food', 'Watch cheese and bread', 'Rich in flavor'],
  },
  {
    name: 'Quiche',
    aliases: ['quiche lorraine', 'french quiche', 'egg pie', 'savory tart'],
    calories: 380,
    protein: 14,
    carbs: 25,
    fat: 26,
    portion_size: 'One slice (150g)',
    cuisine: 'French',
    confidence: 0.92,
    suggestions: ['Good protein source', 'Add vegetables', 'Works for any meal'],
  },

  // Common Generic Foods
  {
    name: 'Grilled Chicken Salad',
    aliases: ['chicken salad', 'garden salad with chicken', 'healthy salad', 'caesar salad'],
    calories: 350,
    protein: 35,
    carbs: 12,
    fat: 18,
    portion_size: 'Large bowl (300g)',
    cuisine: 'General',
    confidence: 0.94,
    suggestions: ['Great for weight loss', 'Watch dressing calories', 'Add variety of vegetables'],
  },
  {
    name: 'Oatmeal',
    aliases: ['porridge', 'oats', 'breakfast oatmeal', 'overnight oats'],
    calories: 280,
    protein: 10,
    carbs: 48,
    fat: 6,
    portion_size: 'Medium bowl (250g)',
    cuisine: 'General',
    confidence: 0.95,
    suggestions: ['Heart healthy', 'Add fruits and nuts', 'Great slow-release energy'],
  },
  {
    name: 'Grilled Salmon',
    aliases: ['salmon', 'baked salmon', 'salmon fillet', 'fish'],
    calories: 420,
    protein: 46,
    carbs: 0,
    fat: 25,
    portion_size: 'Large fillet (200g)',
    cuisine: 'General',
    confidence: 0.95,
    suggestions: ['Rich in omega-3', 'Excellent protein', 'Heart healthy'],
  },
  {
    name: 'Avocado Toast',
    aliases: ['avo toast', 'avocado on toast', 'smashed avocado'],
    calories: 320,
    protein: 8,
    carbs: 28,
    fat: 22,
    portion_size: '2 slices (180g)',
    cuisine: 'General',
    confidence: 0.94,
    suggestions: ['Healthy fats', 'Add egg for protein', 'Choose whole grain bread'],
  },
  {
    name: 'Smoothie Bowl',
    aliases: ['acai bowl', 'fruit bowl', 'breakfast bowl'],
    calories: 380,
    protein: 8,
    carbs: 65,
    fat: 12,
    portion_size: 'Medium bowl (350g)',
    cuisine: 'General',
    confidence: 0.91,
    suggestions: ['Watch added sugars', 'Add protein powder', 'Great for breakfast'],
  },
  {
    name: 'Greek Yogurt',
    aliases: ['yogurt', 'yoghurt', 'plain yogurt', 'fruit yogurt'],
    calories: 150,
    protein: 15,
    carbs: 12,
    fat: 5,
    portion_size: 'Medium cup (200g)',
    cuisine: 'General',
    confidence: 0.96,
    suggestions: ['High in protein', 'Choose plain and add fruit', 'Probiotic benefits'],
  },
  {
    name: 'Protein Shake',
    aliases: ['protein smoothie', 'whey shake', 'post workout shake'],
    calories: 280,
    protein: 35,
    carbs: 18,
    fat: 6,
    portion_size: 'Large glass (400ml)',
    cuisine: 'General',
    confidence: 0.93,
    suggestions: ['Great for muscle recovery', 'Add fruit for flavor', 'Time with workouts'],
  },
];

/**
 * Search for a food in the local database
 * Returns the best match or null if not found
 */
export function searchLocalFood(query: string): FoodItem | null {
  const searchTerm = query.toLowerCase().trim();
  
  // First, try exact name match
  let match = FOOD_DATABASE.find(food => 
    food.name.toLowerCase() === searchTerm
  );
  if (match) return match;
  
  // Then, try alias match
  match = FOOD_DATABASE.find(food => 
    food.aliases.some(alias => alias.toLowerCase() === searchTerm)
  );
  if (match) return match;
  
  // Then, try partial match in name
  match = FOOD_DATABASE.find(food => 
    food.name.toLowerCase().includes(searchTerm) || 
    searchTerm.includes(food.name.toLowerCase())
  );
  if (match) return match;
  
  // Finally, try partial match in aliases
  match = FOOD_DATABASE.find(food => 
    food.aliases.some(alias => 
      alias.toLowerCase().includes(searchTerm) || 
      searchTerm.includes(alias.toLowerCase())
    )
  );
  
  return match || null;
}

/**
 * Get a random food from the database based on image colors/patterns (mock)
 * In a real app, this would use image classification
 */
export function getRandomFoodByType(imageHint?: string): FoodItem {
  // If we have an image hint (from failed API response), try to match
  if (imageHint) {
    const hint = imageHint.toLowerCase();
    const match = FOOD_DATABASE.find(food => 
      food.name.toLowerCase().includes(hint) ||
      food.aliases.some(a => a.toLowerCase().includes(hint))
    );
    if (match) return match;
  }
  
  // Return a random food
  const foods = FOOD_DATABASE;
  return foods[Math.floor(Math.random() * foods.length)];
}

/**
 * Smart food detection based on common visual patterns
 * This maps visual characteristics to likely foods
 */
export function detectFoodFromVisualHints(hints: {
  hasBun?: boolean;
  hasNoodles?: boolean;
  hasRice?: boolean;
  hasMeat?: boolean;
  hasVegetables?: boolean;
  hasCheese?: boolean;
  hasSauce?: boolean;
  isSoup?: boolean;
  isWrapped?: boolean;
  primaryColors?: string[];
}): FoodItem {
  const {
    hasBun, hasNoodles, hasRice, hasMeat, hasVegetables,
    hasCheese, hasSauce, isSoup, isWrapped, primaryColors = []
  } = hints;

  // Burger detection
  if (hasBun && hasMeat) {
    return FOOD_DATABASE.find(f => f.name === 'Cheeseburger') || FOOD_DATABASE[0];
  }

  // Sandwich/wrap detection
  if (isWrapped || (hasBun && !hasMeat)) {
    return FOOD_DATABASE.find(f => f.name === 'Burrito' || f.name === 'Shawarma') || FOOD_DATABASE[0];
  }

  // Soup detection
  if (isSoup) {
    const soups = FOOD_DATABASE.filter(f => 
      f.name.includes('Soup') || f.name.includes('Pho') || f.name.includes('Ramen')
    );
    return soups[Math.floor(Math.random() * soups.length)] || FOOD_DATABASE[0];
  }

  // Noodle detection
  if (hasNoodles) {
    const noodles = FOOD_DATABASE.filter(f => 
      f.name.includes('Noodle') || f.name.includes('Pasta') || 
      f.name.includes('Ramen') || f.name.includes('Pad Thai')
    );
    return noodles[Math.floor(Math.random() * noodles.length)] || FOOD_DATABASE[0];
  }

  // Rice detection
  if (hasRice) {
    const riceDishes = FOOD_DATABASE.filter(f => 
      f.name.includes('Rice') || f.name.includes('Biryani') || 
      f.name.includes('Bibimbap') || f.name.includes('Sushi')
    );
    return riceDishes[Math.floor(Math.random() * riceDishes.length)] || FOOD_DATABASE[0];
  }

  // Default: return random
  return FOOD_DATABASE[Math.floor(Math.random() * FOOD_DATABASE.length)];
}

/**
 * List of common food keywords for text-based matching
 */
export const FOOD_KEYWORDS: Record<string, string[]> = {
  'burger': ['Cheeseburger'],
  'hamburger': ['Cheeseburger'],
  'pizza': ['Margherita Pizza'],
  'pasta': ['Spaghetti Bolognese'],
  'spaghetti': ['Spaghetti Bolognese'],
  'sushi': ['Sushi Roll'],
  'ramen': ['Ramen'],
  'taco': ['Beef Tacos'],
  'burrito': ['Burrito'],
  'curry': ['Chicken Curry', 'Green Curry'],
  'salad': ['Grilled Chicken Salad'],
  'steak': ['Grilled Steak'],
  'chicken': ['Fried Chicken', 'Teriyaki Chicken'],
  'rice': ['Fried Rice', 'Biryani'],
  'noodle': ['Chow Mein', 'Pad Thai'],
  'soup': ['Pho', 'Ramen', 'Tom Yum Soup'],
  'sandwich': ['Banh Mi'],
  'wrap': ['Shawarma', 'Burrito'],
  'fries': ['Hot Dog'], // Often served with fries
  'kebab': ['Kebab', 'Shawarma'],
  'dumpling': ['Dumplings'],
  'spring roll': ['Spring Rolls', 'Fresh Spring Rolls'],
};

/**
 * Find food by keyword
 */
export function findFoodByKeyword(keyword: string): FoodItem | null {
  const searchKey = keyword.toLowerCase().trim();
  
  // Check keyword mapping first
  for (const [key, foodNames] of Object.entries(FOOD_KEYWORDS)) {
    if (searchKey.includes(key)) {
      const foodName = foodNames[0];
      const match = FOOD_DATABASE.find(f => f.name === foodName);
      if (match) return match;
    }
  }
  
  // Fallback to alias search
  return FOOD_DATABASE.find(food => 
    food.aliases.some(alias => 
      alias.toLowerCase().includes(searchKey) || 
      searchKey.includes(alias.toLowerCase())
    )
  ) || null;
}

export default FOOD_DATABASE;

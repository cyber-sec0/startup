// src/components/recipe/IngredientInput.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Common pantry and cooking ingredients for autocomplete suggestions
const COMMON_INGREDIENTS = [
  // Produce
  'Garlic', 'Onion', 'Red Onion', 'Green Onion', 'Shallot', 'Leek',
  'Tomato', 'Cherry Tomatoes', 'Roma Tomatoes', 'Sun-Dried Tomatoes',
  'Bell Pepper', 'Red Bell Pepper', 'Green Bell Pepper', 'Yellow Bell Pepper',
  'Jalapeño', 'Serrano Pepper', 'Habanero Pepper', 'Poblano Pepper',
  'Broccoli', 'Cauliflower', 'Brussels Sprouts', 'Cabbage', 'Red Cabbage',
  'Spinach', 'Kale', 'Arugula', 'Romaine Lettuce', 'Iceberg Lettuce',
  'Celery', 'Carrot', 'Parsnip', 'Turnip', 'Radish', 'Beet',
  'Zucchini', 'Yellow Squash', 'Butternut Squash', 'Acorn Squash',
  'Eggplant', 'Artichoke', 'Asparagus', 'Green Beans', 'Snap Peas',
  'Peas', 'Corn', 'Sweet Potato', 'Russet Potato', 'Yukon Gold Potato',
  'Red Potato', 'Fingerling Potato',
  'Mushroom', 'Cremini Mushroom', 'Portobello Mushroom', 'Shiitake Mushroom',
  'Oyster Mushroom', 'Button Mushroom', 'Porcini Mushroom',
  'Avocado', 'Cucumber', 'Fennel', 'Bok Choy', 'Napa Cabbage',
  // Fruits
  'Lemon', 'Lime', 'Orange', 'Grapefruit', 'Lemon Juice', 'Lime Juice',
  'Apple', 'Pear', 'Peach', 'Plum', 'Mango', 'Pineapple', 'Papaya',
  'Banana', 'Strawberry', 'Blueberry', 'Raspberry', 'Blackberry',
  'Cranberry', 'Grape', 'Pomegranate', 'Watermelon', 'Cantaloupe',
  'Kiwi', 'Fig', 'Date', 'Apricot', 'Cherry', 'Coconut',
  // Herbs (fresh & dried)
  'Fresh Basil', 'Dried Basil', 'Fresh Parsley', 'Dried Parsley',
  'Fresh Cilantro', 'Fresh Thyme', 'Dried Thyme', 'Fresh Rosemary', 'Dried Rosemary',
  'Fresh Oregano', 'Dried Oregano', 'Fresh Mint', 'Dried Mint',
  'Fresh Dill', 'Dried Dill', 'Fresh Sage', 'Dried Sage',
  'Fresh Tarragon', 'Bay Leaf', 'Chives', 'Lemongrass',
  // Spices
  'Salt', 'Black Pepper', 'White Pepper', 'Red Pepper Flakes',
  'Cumin', 'Ground Cumin', 'Cumin Seeds', 'Coriander', 'Ground Coriander',
  'Paprika', 'Smoked Paprika', 'Sweet Paprika', 'Cayenne Pepper',
  'Chili Powder', 'Chili Flakes', 'Turmeric', 'Garam Masala', 'Curry Powder',
  'Cinnamon', 'Ground Cinnamon', 'Cinnamon Stick', 'Nutmeg', 'Ground Nutmeg',
  'Allspice', 'Cloves', 'Ground Cloves', 'Cardamom', 'Ground Cardamom',
  'Star Anise', 'Fennel Seeds', 'Caraway Seeds', 'Mustard Seeds',
  'Mustard Powder', 'Garlic Powder', 'Onion Powder', 'Celery Salt',
  'Italian Seasoning', 'Herbs de Provence', 'Poultry Seasoning',
  'Old Bay Seasoning', 'Cajun Seasoning', 'Za\'atar', 'Sumac',
  'Ras el Hanout', 'Five Spice Powder', 'Saffron', 'Vanilla',
  // Proteins - Meat
  'Chicken Breast', 'Chicken Thigh', 'Chicken Drumstick', 'Whole Chicken',
  'Ground Chicken', 'Ground Turkey', 'Turkey Breast',
  'Beef Chuck', 'Beef Brisket', 'Ground Beef', 'Beef Short Ribs',
  'Ribeye Steak', 'Sirloin Steak', 'Flank Steak', 'Skirt Steak',
  'Pork Shoulder', 'Pork Tenderloin', 'Pork Chop', 'Ground Pork',
  'Bacon', 'Pancetta', 'Prosciutto', 'Ham', 'Sausage', 'Italian Sausage',
  'Chorizo', 'Andouille Sausage', 'Lamb Chop', 'Ground Lamb', 'Lamb Shank',
  'Veal', 'Duck Breast', 'Duck Leg',
  // Proteins - Seafood
  'Salmon', 'Tuna', 'Cod', 'Halibut', 'Sea Bass', 'Tilapia', 'Mahi Mahi',
  'Trout', 'Sardines', 'Anchovies', 'Swordfish',
  'Shrimp', 'Scallop', 'Lobster', 'Crab', 'Clam', 'Mussel', 'Oyster',
  'Squid', 'Octopus',
  // Proteins - Plant & Egg
  'Egg', 'Egg Yolk', 'Egg White', 'Tofu', 'Firm Tofu', 'Silken Tofu',
  'Tempeh', 'Edamame', 'Lentils', 'Red Lentils', 'Green Lentils',
  'Black Beans', 'Kidney Beans', 'Pinto Beans', 'Cannellini Beans',
  'Chickpeas', 'Navy Beans', 'Great Northern Beans', 'Fava Beans',
  // Dairy
  'Butter', 'Unsalted Butter', 'Salted Butter', 'Clarified Butter', 'Ghee',
  'Whole Milk', 'Skim Milk', 'Half-and-Half', 'Heavy Cream', 'Light Cream',
  'Sour Cream', 'Crème Fraîche', 'Buttermilk', 'Evaporated Milk', 'Condensed Milk',
  'Cheddar Cheese', 'Mozzarella', 'Fresh Mozzarella', 'Parmesan', 'Pecorino Romano',
  'Gruyère', 'Swiss Cheese', 'Provolone', 'Brie', 'Camembert',
  'Goat Cheese', 'Feta Cheese', 'Ricotta', 'Cream Cheese', 'Mascarpone',
  'Cottage Cheese', 'Blue Cheese', 'Gorgonzola', 'Manchego',
  'Plain Yogurt', 'Greek Yogurt',
  // Grains & Pasta
  'All-Purpose Flour', 'Bread Flour', 'Whole Wheat Flour', 'Almond Flour',
  'Cornstarch', 'Cornmeal', 'Polenta', 'Rice Flour', 'Oat Flour',
  'White Rice', 'Brown Rice', 'Jasmine Rice', 'Basmati Rice', 'Arborio Rice',
  'Wild Rice', 'Sushi Rice',
  'Spaghetti', 'Fettuccine', 'Linguine', 'Penne', 'Rigatoni', 'Fusilli',
  'Farfalle', 'Orecchiette', 'Lasagna Noodles', 'Ravioli', 'Tortellini',
  'Angel Hair Pasta', 'Orzo', 'Couscous', 'Quinoa', 'Farro', 'Barley',
  'Bulgur', 'Millet', 'Oats', 'Rolled Oats', 'Steel Cut Oats',
  'Bread', 'Sourdough Bread', 'Baguette', 'Brioche', 'Panko Breadcrumbs',
  'Breadcrumbs', 'Crackers', 'Tortilla', 'Pita Bread',
  // Oils, Vinegars & Condiments
  'Olive Oil', 'Extra Virgin Olive Oil', 'Vegetable Oil', 'Canola Oil',
  'Coconut Oil', 'Sesame Oil', 'Avocado Oil', 'Sunflower Oil',
  'Balsamic Vinegar', 'Red Wine Vinegar', 'White Wine Vinegar',
  'Apple Cider Vinegar', 'Rice Vinegar', 'Sherry Vinegar',
  'Soy Sauce', 'Tamari', 'Fish Sauce', 'Oyster Sauce', 'Hoisin Sauce',
  'Worcestershire Sauce', 'Hot Sauce', 'Sriracha', 'Tabasco',
  'Ketchup', 'Mustard', 'Dijon Mustard', 'Whole Grain Mustard', 'Mayonnaise',
  'Tahini', 'Miso Paste', 'White Miso', 'Red Miso',
  'Tomato Paste', 'Tomato Sauce', 'Crushed Tomatoes', 'Diced Tomatoes',
  'Coconut Milk', 'Coconut Cream',
  // Sweeteners
  'Granulated Sugar', 'Brown Sugar', 'Powdered Sugar', 'Raw Sugar', 'Turbinado Sugar',
  'Honey', 'Maple Syrup', 'Agave Nectar', 'Molasses', 'Corn Syrup',
  'Stevia', 'Monk Fruit Sweetener',
  // Baking
  'Baking Soda', 'Baking Powder', 'Active Dry Yeast', 'Instant Yeast',
  'Vanilla Extract', 'Almond Extract', 'Cocoa Powder', 'Dark Chocolate',
  'Semi-Sweet Chocolate', 'Milk Chocolate', 'White Chocolate',
  'Chocolate Chips', 'Unsweetened Chocolate',
  'Cream of Tartar', 'Gelatin', 'Agar-Agar', 'Pectin',
  // Nuts & Seeds
  'Almonds', 'Walnuts', 'Pecans', 'Cashews', 'Pistachios', 'Hazelnuts',
  'Macadamia Nuts', 'Pine Nuts', 'Peanuts', 'Brazil Nuts',
  'Sesame Seeds', 'Sunflower Seeds', 'Pumpkin Seeds', 'Chia Seeds',
  'Flaxseed', 'Hemp Seeds', 'Poppy Seeds',
  'Peanut Butter', 'Almond Butter', 'Cashew Butter', 'Sunflower Butter',
  // Stocks & Liquids
  'Chicken Stock', 'Beef Stock', 'Vegetable Stock', 'Fish Stock',
  'Chicken Broth', 'Beef Broth', 'Vegetable Broth',
  'Red Wine', 'White Wine', 'Beer', 'Sake', 'Mirin',
  'Water', 'Sparkling Water',
  // Canned & Jarred
  'Canned Chickpeas', 'Canned Black Beans', 'Canned Kidney Beans',
  'Canned Corn', 'Canned Artichoke Hearts', 'Canned Coconut Milk',
  'Capers', 'Olives', 'Kalamata Olives', 'Green Olives', 'Roasted Red Peppers',
  'Pickles', 'Jalapeños in Brine', 'Chipotle Peppers in Adobo',
  'Anchovy Paste', 'Tomato Purée',
  // Asian pantry
  'Rice Noodles', 'Glass Noodles', 'Ramen Noodles', 'Udon Noodles', 'Soba Noodles',
  'Ginger', 'Fresh Ginger', 'Ground Ginger', 'Galangal',
  'Lemongrass', 'Kaffir Lime Leaves', 'Thai Basil', 'Shiso',
  'Dashi', 'Bonito Flakes', 'Nori', 'Kombu', 'Wakame',
  'Gochujang', 'Doenjang', 'Sambal Oelek', 'Curry Paste', 'Red Curry Paste',
  'Green Curry Paste', 'Yellow Curry Paste',
  'Toasted Sesame Oil', 'Chili Oil', 'XO Sauce',
  // Misc
  'Salt and Pepper', 'Cooking Spray', 'Parchment Paper',
];

const IngredientInput = ({
  ingredient,
  onChange,
  onRemove,
  availableIngredients = []
}) => {
  const [inputValues, setInputValues] = useState({
    name: ingredient.name || '',
    quantity: ingredient.quantity || '',
    unit: ingredient.unit || ''
  });

  // Merge backend-fetched ingredients with the built-in list, deduplicated
  const mergedIngredientNames = React.useMemo(() => {
    const backendNames = availableIngredients.map(ing => ing.name);
    const combined = [...new Set([...COMMON_INGREDIENTS, ...backendNames])];
    return combined.sort((a, b) => a.localeCompare(b));
  }, [availableIngredients]);

  useEffect(() => {
    onChange({
      ...ingredient,
      name: inputValues.name,
      quantity: inputValues.quantity,
      unit: inputValues.unit
    });
  }, [inputValues]);

  const handleChange = (field, value) => {
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <TextField
        size="small"
        label="Amount"
        value={inputValues.quantity}
        onChange={(e) => handleChange('quantity', e.target.value)}
        sx={{ width: '20%', mr: 1 }}
        type="number"
        inputProps={{ min: 0, step: 0.25 }}
      />

      <TextField
        size="small"
        label="Unit"
        value={inputValues.unit}
        onChange={(e) => handleChange('unit', e.target.value)}
        sx={{ width: '20%', mr: 1 }}
        placeholder="cups, tbsp, g"
      />

      <Autocomplete
        freeSolo
        size="small"
        options={mergedIngredientNames}
        value={inputValues.name}
        onChange={(_, newValue) => handleChange('name', newValue || '')}
        onInputChange={(_, newValue) => handleChange('name', newValue)}
        filterOptions={(options, state) => {
          if (!state.inputValue) return options.slice(0, 50);
          const input = state.inputValue.toLowerCase();
          return options.filter(o => o.toLowerCase().includes(input)).slice(0, 50);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Ingredient"
            placeholder="Start typing..."
          />
        )}
        sx={{ flexGrow: 1 }}
      />

      <IconButton
        color="error"
        onClick={onRemove}
        sx={{ ml: 1 }}
        aria-label="remove ingredient"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default IngredientInput;

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Autocomplete, 
  IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const IngredientInput = ({ 
  ingredient, 
  onChange, 
  onRemove, 
  availableIngredients = [],
  readOnly = false
}) => {
  const [inputValues, setInputValues] = useState({
    name: ingredient.name || '',
    quantity: ingredient.quantity || '',
    unit: ingredient.unit || ''
  });

  useEffect(() => {
    onChange({
      ...ingredient,
      name: inputValues.name,
      quantity: inputValues.quantity,
      unit: inputValues.unit
    });
  }, [inputValues]);

  const unitOptions = [
    'tsp', 'tbsp', 'cup', 'oz', 'fl oz', 'pt', 'qt', 'gal',
    'ml', 'l', 'g', 'kg', 'lb',
    'clove', 'slice', 'piece', 'pinch', 'dash', 'can', 'jar', 'package'
  ];

  const handleChange = (field, value) => {
    if (readOnly) return;
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {/* Quantity input */}
      <TextField
        size="small"
        label="Amount"
        value={inputValues.quantity}
        onChange={(e) => handleChange('quantity', e.target.value)}
        sx={{ width: '20%', mr: 1 }}
        type="number"
        inputProps={{ min: 1, step: 1.00 }}
        disabled={readOnly}
      />
      
      {/* Unit selector */}
      <TextField
        select
        size="small"
        label="Unit"
        value={inputValues.unit}
        onChange={(e) => handleChange('unit', e.target.value)}
        sx={{ width: '20%', mr: 1 }}
        disabled={readOnly}
        SelectProps={{ native: true }}
      >
        <option value="">Select</option>
        {unitOptions.map((unit) => (
          <option key={unit} value={unit}>{unit}</option>
        ))}
      </TextField>
      
      {/* Ingredient name with autocomplete */}
      <Autocomplete
        freeSolo
        size="small"
        options={availableIngredients.map(ing => ing.name)}
        value={inputValues.name}
        onChange={(_, newValue) => handleChange('name', newValue)}
        onInputChange={(_, newValue) => handleChange('name', newValue)}
        disabled={readOnly}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Ingredient" 
            placeholder="Start typing..."
            disabled={readOnly}
          />
        )}
        sx={{ flexGrow: 1 }}
      />
      
      {!readOnly && (
        <IconButton 
          color="error" 
          onClick={onRemove} 
          sx={{ ml: 1 }}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default IngredientInput;

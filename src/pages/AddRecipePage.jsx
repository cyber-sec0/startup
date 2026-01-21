import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  CircularProgress,
  Alert,
  Snackbar,
  Box 
} from '@mui/material';
import RecipeForm from '../components/recipe/RecipeForm';
import { createBlankRecipe } from '../models/Recipe';

function AddRecipePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // MOCK: Save to localStorage
      await new Promise(resolve => setTimeout(resolve, 800)); // Sim delay

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) throw new Error('You must be logged in');

      // 1. Handle Ingredients (add new ones to 'ingredients' store)
      const storedIngredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
      const recipeIngredients = [];

      formData.ingredients.forEach(formIng => {
        // If it has an ID, use it. If not, check if it exists in store by name.
        // If not, create new.
        let ingId = formIng.id;
        
        if (!ingId) {
             const existing = storedIngredients.find(si => si.name.toLowerCase() === formIng.name.toLowerCase());
             if (existing) {
                 ingId = existing.ingredientId;
             } else {
                 ingId = Date.now() + Math.floor(Math.random() * 1000);
                 storedIngredients.push({
                     ingredientId: ingId,
                     name: formIng.name,
                     measurement: formIng.unit
                 });
             }
        }
        
        recipeIngredients.push({
            ingredientId: ingId,
            name: formIng.name,
            quantity: formIng.quantity,
            measurement: formIng.unit
        });
      });
      
      localStorage.setItem('ingredients', JSON.stringify(storedIngredients));

      // 2. Create Recipe
      const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const newRecipe = {
          recipeId: Date.now(),
          title: formData.title,
          instructions: formData.instructions.join('\n'),
          notes: formData.notes,
          ingredients: recipeIngredients,
          author: currentUser.email,
          createdAt: new Date().toISOString()
      };

      recipes.push(newRecipe);
      localStorage.setItem('recipes', JSON.stringify(recipes));

      setSuccess(true);
      setTimeout(() => navigate(`/dash`), 500);
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/dash');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Recipe
      </Typography>

      <RecipeForm 
        recipe={createBlankRecipe()} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        isSubmitting={loading}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => navigate('/dash')}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Recipe created successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddRecipePage;
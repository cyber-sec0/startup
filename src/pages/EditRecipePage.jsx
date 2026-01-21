import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import RecipeForm from '../components/recipe/RecipeForm';

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ saving: false, error: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // MOCK: Fetch from localStorage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        const recipeData = recipes.find(r => r.recipeId === parseInt(id));

        if (!recipeData) throw new Error('Recipe not found');

        // Transform ingredients to expected format
        const formattedIngredients = (recipeData.ingredients || []).map(ing => ({
          id: ing.ingredientId,
          name: ing.name,
          quantity: ing.quantity.toString(),
          unit: ing.measurement
        }));

        setRecipe({
          id: parseInt(id),
          title: recipeData.title,
          ingredients: formattedIngredients,
          instructions: typeof recipeData.instructions === 'string' 
            ? recipeData.instructions.split(/\r?\n/).filter(Boolean) 
            : recipeData.instructions || [''],
          notes: recipeData.notes || ""
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaveStatus({ saving: true, error: null });

    try {
      // MOCK: Update localStorage
      await new Promise(resolve => setTimeout(resolve, 800));

      const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const recipeIndex = recipes.findIndex(r => r.recipeId === parseInt(id));
      
      if (recipeIndex === -1) throw new Error('Recipe not found');

      // 1. Process ingredients (simplified for mock: update store if new names)
      const storedIngredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
      const recipeIngredients = [];

      formData.ingredients.forEach(formIng => {
        let ingId = formIng.id;
        // Check if ingredient exists, if not create
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

      // 2. Update Recipe object
      recipes[recipeIndex] = {
          ...recipes[recipeIndex],
          title: formData.title,
          instructions: formData.instructions.join('\n'),
          notes: formData.notes,
          ingredients: recipeIngredients
      };
      
      localStorage.setItem('recipes', JSON.stringify(recipes));

      navigate(`/recipe/${id}`);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus({ saving: false, error: error.message });
    }
  };

  const handleCancel = () => navigate('/dash');

  if (loading) return <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Recipe
      </Typography>
      {saveStatus.error && <Alert severity="error" sx={{ mb: 3 }}>{saveStatus.error}</Alert>}
      {recipe && <RecipeForm recipe={recipe} onSubmit={handleSubmit} onCancel={handleCancel} />}
    </Container>
  );
}

export default EditRecipePage;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, CircularProgress, Container, Typography } from '@mui/material';
import RecipeForm from '../components/recipe/RecipeForm';

async function fetchSharedRecipeData(id) {
  try {
    const response = await fetch(`/api/shared-recipes/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Shared recipe not found');
      }

      throw new Error('Unable to load shared recipe right now');
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Unable to load shared recipe right now');
    }

    return await response.json();
  } catch (_error) {
    throw new Error('Unable to load shared recipe right now');
  }
}

function SharedRecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedRecipe = async () => {
      try {
        const recipeData = await fetchSharedRecipeData(id);
        const formattedIngredients = (recipeData.ingredients || []).map((ing) => ({
          id: ing.ingredientId,
          name: ing.name,
          quantity: ing.quantity?.toString() || '',
          unit: ing.measurement || ''
        }));

        setRecipe({
          id: parseInt(id, 10),
          title: recipeData.title,
          ingredients: formattedIngredients,
          instructions: typeof recipeData.instructions === 'string'
            ? recipeData.instructions.split(/\r?\n/).filter(Boolean)
            : recipeData.instructions || [''],
          notes: recipeData.notes || ''
        });
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRecipe();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shared Recipe Preview
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        This page is view-only.
      </Typography>
      {recipe && (
        <RecipeForm
          recipe={recipe}
          onSubmit={() => {}}
          onCancel={() => {}}
          readOnly
          fetchIngredients={false}
        />
      )}
    </Container>
  );
}

export default SharedRecipePage;

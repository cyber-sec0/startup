// src/pages/RecipePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert } from '@mui/material';
import RecipeActionBar from '../components/recipe/RecipeActionBar';
import RecipeDetails from '../components/recipe/RecipeDetails';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';

function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        // MOCK: Fetch from localStorage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        const data = recipes.find(r => r.recipeId === parseInt(id));

        if (!data) throw new Error('Recipe not found');
        
        setRecipe({
          id: parseInt(id),
          title: data.title,
          ingredients: data.ingredients,
          // Handle instructions possibly being an array or string
          instructions: Array.isArray(data.instructions) 
            ? data.instructions 
            : data.instructions.split('\n'),
          notes: data.notes
        });
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit-recipe/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // MOCK: Delete from localStorage
      const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const updatedRecipes = recipes.filter(r => r.recipeId !== parseInt(id));
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
      
      navigate('/dash'); // Redirect to the homepage/dashboard after successful deletion
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete recipe');
    }
    setDeleteDialogOpen(false);
  };
  

  const goBack = () => {
    navigate('/dash');
  };

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
      <RecipeActionBar 
        onBack={goBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {recipe && <RecipeDetails recipe={recipe} />}
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title={recipe?.title || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </Container>
  );
}

export default RecipePage;
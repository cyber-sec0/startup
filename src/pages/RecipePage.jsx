//src/pages/RecipePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Snackbar } from '@mui/material';
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
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const response = await fetch(`/api/recipes/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Recipe not found');
        }

        const data = await response.json();

        setRecipe({
          id: parseInt(id),
          title: data.title,
          ingredients: data.ingredients,
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared-recipe/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe?.title || 'Shared recipe',
          text: 'Open this recipe in shared view',
          url: shareUrl
        });
        setShareMessage('Share sheet opened.');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Share link copied to clipboard.');
    } catch (shareError) {
      console.error('Share error:', shareError);
      setShareMessage(`Share link: ${shareUrl}`);
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      navigate('/dash');
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
        onShare={handleShare}
      />

      {recipe && <RecipeDetails recipe={recipe} />}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title={recipe?.title || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={Boolean(shareMessage)}
        autoHideDuration={3000}
        onClose={() => setShareMessage('')}
        message={shareMessage}
      />
    </Container>
  );
}

export default RecipePage;

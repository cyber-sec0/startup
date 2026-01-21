import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RecipeGrid from '../components/dashboard/RecipeGrid';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';
import SearchBar from '../components/dashboard/SearchBar';
import PaginationControls from '../components/dashboard/PaginationControls';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [paginatedRecipes, setPaginatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // =========================================================================
  // WEBSOCKET MOCK: Simulate real-time notifications
  // =========================================================================
  useEffect(() => {
    // Only subscribe to "socket" updates if authenticated
    if (!isAuthenticated) return;

    // Use setInterval to mock receiving WebSocket messages
    const socketInterval = setInterval(() => {
      // 30% chance to receive a message every 8 seconds to make it feel "live" but not annoying
      if (Math.random() < 0.3) {
        const mockUsers = ['ChefMario', 'GordonR', 'JuliaC', 'HomeCook123'];
        const mockActions = [
          'just added a new "Lasagna" recipe!',
          'just added a new "brigadeiro" recipe!',
          'just added a new "Chocolate Cake" recipe!',
          'just added a new "Brazilian brigadeiro" recipe!'
        ];
        
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomAction = mockActions[Math.floor(Math.random() * mockActions.length)];
        
        setNotification({
          open: true,
          message: `🔔 ${randomUser} ${randomAction}`,
          severity: 'info'
        });
      }
    }, 8000);

    return () => clearInterval(socketInterval);
  }, [isAuthenticated]);
  // =========================================================================

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        // MOCK: Fetch from localStorage
        await new Promise(resolve => setTimeout(resolve, 600)); 

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return; // Should be handled by auth check above
        
        const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        // Filter for user
        const userRecipes = allRecipes.filter(r => r.author === currentUser.email || !r.author);

        const formattedRecipes = userRecipes.map(recipe => ({
          id: recipe.recipeId,
          title: recipe.title,
          notes: recipe.notes,
          createdAt: recipe.createdAt
        }));

        setRecipes(formattedRecipes);
        setFilteredRecipes(formattedRecipes);
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: error.message || 'Failed to load recipes',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRecipes();
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Filter recipes based on the search term
  useEffect(() => {
    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

  // Update paginated recipes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRecipes(filteredRecipes.slice(startIndex, endIndex));
  }, [filteredRecipes, currentPage, itemsPerPage]);

  // Handler functions
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleEdit = (recipeId) => {
    navigate(`/edit-recipe/${recipeId}`);
  };

  const handleDelete = (id) => {
    const recipe = recipes.find(r => r.id === id);
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      // MOCK: Delete from localStorage
      const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const updatedStore = allRecipes.filter(r => r.recipeId !== recipeToDelete.id);
      localStorage.setItem('recipes', JSON.stringify(updatedStore));

      // Remove the deleted recipe from the state
      const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeToDelete.id);
      setRecipes(updatedRecipes);

      setNotification({
        open: true,
        message: `Recipe "${recipeToDelete.title}" deleted successfully`,
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to delete recipe',
        severity: 'error',
      });
    }

    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Recipes
      </Typography>
      
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      <Box sx={{ mt: 3 }}>
        <RecipeGrid 
          recipes={paginatedRecipes} 
          loading={loading}
          onView={handleViewRecipe}
          onEdit={handleEdit}
          onDelete={handleDelete} 
        />
      </Box>
      
      <PaginationControls
        totalItems={filteredRecipes.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title={recipeToDelete?.title || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DashboardPage;
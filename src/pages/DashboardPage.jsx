import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RecipeGrid from '../components/dashboard/RecipeGrid';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';
import SearchBar from '../components/dashboard/SearchBar';
import PaginationControls from '../components/dashboard/PaginationControls';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  // --- State Management ---
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [paginatedRecipes, setPaginatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  
  // Quote State (Third Party API Requirement)
  const [quote, setQuote] = useState({ text: 'Loading inspiration...', author: '' });

  // Notification State
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // --- 1. Authentication Check ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // --- 2. Third Party API Call (Get Quote) ---
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        setQuote({ text: data.content, author: data.author });
      } catch (error) {
        setQuote({ text: 'Cooking is like love. It should be entered into with abandon or not at all.', author: 'Harriet Van Horne' });
      }
    };

    fetchQuote();
  }, []);

  // --- 3. WebSocket Mock (Simulate Live Notifications) ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const socketInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const mockUsers = ['ChefMario', 'GordonR', 'JuliaC', 'HomeCook123'];
        const mockActions = [
          'just added a new "Lasagna" recipe!',
          'just added a new "Brigadeiro" recipe!',
          'just added a new "Chocolate Cake" recipe!',
          'is reviewing your "Pasta" recipe!'
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

  // --- 4. Fetch Recipes (Mock Data) ---
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600)); 

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // Fallback for mock environment if context isn't fully set
        const userEmail = currentUser ? currentUser.email : 'test@example.com'; 
        
        const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        
        // Filter logic: show recipes created by this user OR public recipes
        const userRecipes = allRecipes.filter(r => r.author === userEmail || !r.author);

        const formattedRecipes = userRecipes.map(recipe => ({
          id: recipe.recipeId,
          title: recipe.title,
          description: recipe.description || recipe.notes, // Handle different field names
          image: recipe.image,
          prepTime: recipe.prepTime,
          createdAt: recipe.createdAt
        }));

        setRecipes(formattedRecipes);
        setFilteredRecipes(formattedRecipes);
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: 'Failed to load recipes',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRecipes();
    }
  }, [isAuthenticated, isLoading]);

  // --- 5. Filtering & Pagination ---
  useEffect(() => {
    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchTerm, recipes]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRecipes(filteredRecipes.slice(startIndex, endIndex));
  }, [filteredRecipes, currentPage, itemsPerPage]);

  // --- Handlers ---
  const handleSearchChange = (value) => setSearchTerm(value);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (value) => setItemsPerPage(value);
  const handleViewRecipe = (id) => navigate(`/recipe/${id}`);
  const handleEdit = (id) => navigate(`/edit-recipe/${id}`);

  const handleDelete = (id) => {
    const recipe = recipes.find(r => r.id === id);
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      // MOCK: Update LocalStorage
      const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const updatedStore = allRecipes.filter(r => r.recipeId !== recipeToDelete.id);
      localStorage.setItem('recipes', JSON.stringify(updatedStore));

      // Update State
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
        message: 'Failed to delete recipe',
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
      {/* Title & Add Button Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Recipes
        </Typography>
      </Box>

      {/* Quote Section (Third Party API) */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'action.hover', borderLeft: '4px solid #ed6c02' }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
          "{quote.text}"
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
          — {quote.author}
        </Typography>
      </Paper>
      
      {/* Search Bar */}
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      {/* Recipe Grid */}
      <Box sx={{ mt: 3 }}>
        <RecipeGrid 
          recipes={paginatedRecipes} 
          loading={loading}
          onView={handleViewRecipe}
          onEdit={handleEdit}
          onDelete={handleDelete} 
        />
      </Box>
      
      {/* Pagination */}
      <PaginationControls
        totalItems={filteredRecipes.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      
      {/* Dialogs & Alerts */}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DashboardPage;
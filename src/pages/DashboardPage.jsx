import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Typography, Box, Snackbar, Alert, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RecipeGrid from '../components/dashboard/RecipeGrid';
import DeleteConfirmationDialog from '../components/common/DeleteConfirmationDialog';
import SearchBar from '../components/dashboard/SearchBar';
import PaginationControls from '../components/dashboard/PaginationControls';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

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
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const hasFetchedRecipes = useRef(false);
  const hasFetchedQuote = useRef(false);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'recipeCreated') {
      setNotification({
        open: true,
        message: `🔔 ${data.userName} just added a new "${data.recipeName}" recipe!`,
        severity: 'info'
      });
    } else if (data.type === 'recipeUpdated') {
      setNotification({
        open: true,
        message: `🔔 ${data.userName} just updated "${data.recipeName}"!`,
        severity: 'info'
      });
    } else if (data.type === 'recipeDeleted') {
      setNotification({
        open: true,
        message: `🔔 ${data.userName} deleted "${data.recipeName}"`,
        severity: 'warning'
      });
    }
  }, []);

  // Initialize WebSocket connection
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated || hasFetchedQuote.current) return;
    
    const fetchQuote = async () => {
      hasFetchedQuote.current = true;
      setQuoteLoading(true);
      try {
        const response = await fetch('https://api.quotable.kurokeita.dev/api/quotes/random');
        if (response.ok) {
          const data = await response.json();
          setQuote({ text: data.quote.content, author: data.quote.author.name });
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      } finally {
        setQuoteLoading(false);
      }
    };

    fetchQuote();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || hasFetchedRecipes.current) return;

    const fetchRecipes = async () => {
      hasFetchedRecipes.current = true;
      try {
        setLoading(true);
        const response = await fetch('/api/recipes', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch recipes');
        const data = await response.json();
        const formattedRecipes = data.map(recipe => ({ id: recipe.recipeId, title: recipe.title, notes: recipe.notes, createdAt: recipe.createdAt }));
        setRecipes(formattedRecipes);
        setFilteredRecipes(formattedRecipes);
      } catch (error) {
        console.error('Error:', error);
        setNotification({ open: true, message: error.message || 'Failed to load recipes', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [isAuthenticated]);

  useEffect(() => {
    const filtered = recipes.filter(recipe => recipe.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredRecipes(filtered);
    setCurrentPage(1);
  }, [searchTerm, recipes]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRecipes(filteredRecipes.slice(startIndex, endIndex));
  }, [filteredRecipes, currentPage, itemsPerPage]);

  const handleSearchChange = (value) => setSearchTerm(value);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (value) => { setItemsPerPage(value); setCurrentPage(1); };
  const handleViewRecipe = (recipeId) => navigate(`/recipe/${recipeId}`);
  const handleEdit = (recipeId) => navigate(`/edit-recipe/${recipeId}`);
  const handleDelete = (id) => { const recipe = recipes.find(r => r.id === id); setRecipeToDelete(recipe); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      const response = await fetch(`/api/recipes/${recipeToDelete.id}`, { method: 'DELETE', credentials: 'include' });
      if (!response.ok) throw new Error('Failed to delete recipe');
      const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeToDelete.id);
      setRecipes(updatedRecipes);
      setNotification({ open: true, message: `Recipe "${recipeToDelete.title}" deleted successfully`, severity: 'success' });
    } catch (error) {
      setNotification({ open: true, message: error.message || 'Failed to delete recipe', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          My Recipes
        </Typography>
        {isConnected && (
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'success.main',
              mr: 1,
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="caption" color="text.secondary">
              Live
            </Typography>
          </Box>
        )}
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        {quoteLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: 'white' }} size={24} /></Box>
        ) : quote.text ? (
          <>
            <Typography variant="h6" sx={{ fontStyle: 'italic', mb: 1 }}>"{quote.text}"</Typography>
            <Typography variant="body2" sx={{ textAlign: 'right', opacity: 0.9 }}>— {quote.author}</Typography>
          </>
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>Loading inspirational quote...</Typography>
        )}
      </Paper>
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <Box sx={{ mt: 3 }}><RecipeGrid recipes={paginatedRecipes} loading={loading} onView={handleViewRecipe} onEdit={handleEdit} onDelete={handleDelete} /></Box>
      <PaginationControls totalItems={filteredRecipes.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} onItemsPerPageChange={handleItemsPerPageChange} />
      <DeleteConfirmationDialog open={deleteDialogOpen} title={recipeToDelete?.title || ''} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete} />
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Container>
  );
}

export default DashboardPage;
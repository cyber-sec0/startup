import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashBoardContainer from '../components/dashboard/DashBoardContainer';
import RecipeGrid from '../components/dashboard/RecipeGrid';
import PaginationControls from '../components/dashboard/PaginationControls';
import SearchBar from '../components/dashboard/SearchBar';

// Initial mock data to populate if localStorage is empty
const DEMO_RECIPES = [
  { id: 1, title: 'Mock Spaghetti', description: 'Delicious fake pasta', image: '', prepTime: '20 mins' },
  { id: 2, title: 'Virtual Tacos', description: 'Bits and bytes of flavor', image: '', prepTime: '15 mins' }
];

const DashboardPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(''); // For mocking WebSocket
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Mock Fetching Data from LocalStorage
    const fetchRecipes = () => {
      const storedRecipes = localStorage.getItem('recipes');
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      } else {
        // Seed data if empty
        localStorage.setItem('recipes', JSON.stringify(DEMO_RECIPES));
        setRecipes(DEMO_RECIPES);
      }
      setLoading(false);
    };

    fetchRecipes();

    // 2. Mock WebSocket (setInterval Requirement)
    // Simulates a "New Recipe Added" notification coming from a server
    const intervalId = setInterval(() => {
      const randomMsg = Math.random() > 0.7 ? "👨‍🍳 User 'ChefBot' just added a new recipe!" : "";
      if (randomMsg) {
        setNotification(randomMsg);
        setTimeout(() => setNotification(''), 3000); // Hide after 3s
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashBoardContainer>
      {notification && (
        <div className="alert alert-info fixed-top text-center" style={{ top: '60px', zIndex: 1000 }}>
          {notification}
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/add-recipe')}>
          + Add Recipe
        </button>
      </div>

      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <RecipeGrid recipes={filteredRecipes} />
      )}

      <PaginationControls />
    </DashBoardContainer>
  );
};

export default DashboardPage;
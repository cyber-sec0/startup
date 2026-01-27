const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('trust proxy', true);

//In-memory data stores
let users = [];
let recipes = [];
let ingredients = [];

//Helper functions
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

async function createUser(email, password, userName) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email: email,
    userName: userName,
    password: passwordHash,
    token: uuidv4(),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
}

async function findUser(email) {
  return users.find((u) => u.email === email);
}

async function findUserByToken(token) {
  return users.find((u) => u.token === token);
}

//Router for service endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);

//Auth Endpoints
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password, userName } = req.body;
  
  if (!email || !password || !userName) {
    return res.status(400).send({ msg: 'Missing required information' });
  }

  if (await findUser(email)) {
    return res.status(409).send({ msg: 'Existing user' });
  }

  const user = await createUser(email, password, userName);
  setAuthCookie(res, user.token);
  
  res.send({
    id: user.id,
    email: user.email,
    userName: user.userName
  });
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser(email);
  
  if (user && await bcrypt.compare(password, user.password)) {
    setAuthCookie(res, user.token);
    res.send({ 
      id: user.id,
      email: user.email,
      userName: user.userName
    });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

apiRouter.get('/user/:email', async (req, res) => {
  const user = await findUser(req.params.email);
  if (user) {
    const token = req.cookies['token'];
    res.send({ 
      email: user.email,
      userName: user.userName,
      authenticated: token === user.token 
    });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

//Secure API Router (requires authentication)
const secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  const authToken = req.cookies['token'];
  const user = await findUserByToken(authToken);
  if (user) {
    req.user = user; //Attach user to request
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

//User Profile Endpoints
secureApiRouter.get('/profile', async (req, res) => {
  const user = req.user;
  const userRecipes = recipes.filter(r => r.author === user.email);
  
  res.send({
    userName: user.userName,
    email: user.email,
    createdAt: user.createdAt,
    recipeCount: userRecipes.length
  });
});

secureApiRouter.put('/profile', async (req, res) => {
  const { userName, email } = req.body;
  const user = req.user;
  
  //Check if new email already exists (only if email is being changed)
  if (email && email !== user.email && await findUser(email)) {
    return res.status(409).send({ msg: 'Email already in use' });
  }
  
  //Update username if provided
  if (userName) {
    user.userName = userName;
  }
  
  //Update email if provided
  if (email) {
    user.email = email;
  }
  
  res.send({
    userName: user.userName,
    email: user.email
  });
});

secureApiRouter.put('/profile/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;
  
  if (!await bcrypt.compare(currentPassword, user.password)) {
    return res.status(401).send({ msg: 'Incorrect current password' });
  }
  
  user.password = await bcrypt.hash(newPassword, 10);
  res.send({ msg: 'Password updated successfully' });
});

//Recipe Endpoints
secureApiRouter.get('/recipes', (req, res) => {
  const userRecipes = recipes.filter(r => r.author === req.user.email);
  res.send(userRecipes);
});

secureApiRouter.get('/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.recipeId === parseInt(req.params.id) && r.author === req.user.email);
  if (recipe) {
    res.send(recipe);
  } else {
    res.status(404).send({ msg: 'Recipe not found' });
  }
});

secureApiRouter.post('/recipes', (req, res) => {
  const { title, instructions, notes, ingredients } = req.body;
  
  //Process ingredients (add new ones to ingredients store)
  const recipeIngredients = [];
  
  ingredients.forEach(ing => {
    let ingId = ing.ingredientId;
    
    if (!ingId) {
      const existing = ingredients.find(si => si.name.toLowerCase() === ing.name.toLowerCase());
      if (existing) {
        ingId = existing.ingredientId;
      } else {
        ingId = Date.now() + Math.floor(Math.random() * 1000);
        ingredients.push({
          ingredientId: ingId,
          name: ing.name,
          measurement: ing.unit
        });
      }
    }
    
    recipeIngredients.push({
      ingredientId: ingId,
      name: ing.name,
      quantity: ing.quantity,
      measurement: ing.unit
    });
  });
  
  const recipe = {
    recipeId: Date.now(),
    title,
    instructions,
    notes,
    ingredients: recipeIngredients,
    author: req.user.email,
    createdAt: new Date().toISOString()
  };
  
  recipes.push(recipe);
  res.send(recipe);
});

secureApiRouter.put('/recipes/:id', (req, res) => {
  const recipeId = parseInt(req.params.id);
  const recipeIndex = recipes.findIndex(r => r.recipeId === recipeId && r.author === req.user.email);
  
  if (recipeIndex === -1) {
    return res.status(404).send({ msg: 'Recipe not found' });
  }
  
  const { title, instructions, notes, ingredients: newIngredients } = req.body;
  
  //Process ingredients
  const recipeIngredients = [];
  
  newIngredients.forEach(ing => {
    let ingId = ing.ingredientId || ing.id;
    
    if (!ingId) {
      const existing = ingredients.find(si => si.name.toLowerCase() === ing.name.toLowerCase());
      if (existing) {
        ingId = existing.ingredientId;
      } else {
        ingId = Date.now() + Math.floor(Math.random() * 1000);
        ingredients.push({
          ingredientId: ingId,
          name: ing.name,
          measurement: ing.unit
        });
      }
    }
    
    recipeIngredients.push({
      ingredientId: ingId,
      name: ing.name,
      quantity: ing.quantity,
      measurement: ing.unit
    });
  });
  
  recipes[recipeIndex] = {
    ...recipes[recipeIndex],
    title,
    instructions,
    notes,
    ingredients: recipeIngredients
  };
  
  res.send(recipes[recipeIndex]);
});

secureApiRouter.delete('/recipes/:id', (req, res) => {
  const recipeId = parseInt(req.params.id);
  const recipeIndex = recipes.findIndex(r => r.recipeId === recipeId && r.author === req.user.email);
  
  if (recipeIndex === -1) {
    return res.status(404).send({ msg: 'Recipe not found' });
  }
  
  recipes.splice(recipeIndex, 1);
  res.status(204).end();
});

//Ingredients Endpoints
secureApiRouter.get('/ingredients', (req, res) => {
  res.send(ingredients);
});

//Default error handler
app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

//Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
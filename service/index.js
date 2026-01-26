const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the frontend static content hosting
app.use(express.static('public'));

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
var apiRouter = express.Router();
app.use('/api', apiRouter);

// --- In-Memory Data Store (Replaces LocalStorage for now) ---
let users = []; 
let recipes = [];

// --- Auth Endpoints ---

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    // Set the cookie
    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    });
  }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});

// GetUser returns information about a user
apiRouter.get('/user/:email', async (req, res) => {
  const user = await findUser(req.params.email);
  if (user) {
    const token = req.cookies['token'];
    res.send({ email: user.email, authenticated: token === user.token });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  authToken = req.cookies['token'];
  const user = await findUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// --- Application Endpoints (Protected) ---

// Get Recipes
secureApiRouter.get('/recipes', (req, res) => {
  res.send(recipes);
});

// Save Recipe
secureApiRouter.post('/recipe', (req, res) => {
  const recipe = { ...req.body, id: Date.now() };
  recipes.push(recipe);
  res.send(recipe);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type:(err.name), message:err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// --- Helper Functions ---

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

async function createUser(email, password) {
  // Hash the password before we insert it into the database
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: email,
    password: passwordHash,
    token: require('uuid').v4(),
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
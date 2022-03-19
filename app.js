/**
 * Top-level script to initialize and configure web application object.
 */

const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const LocalStrategy = require('passport-local');
const passport = require('passport');
const session = require('express-session');

const adminRouter = require('./lib/admin/router');
const database = require('./lib/database');
const middleware = require('./lib/middleware');
const settings = require('./config');
const setupRouter = require('./lib/setup/router');

const app = express();

// Enable cookies-based sessions.
app.use(session({
  secret: settings.secretKey,
  resave: false,
  saveUninitialized: false,
}));

// Configure Passport.
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  database.getUserByUsername,
));
app.use(passport.authenticate('session'));
passport.serializeUser((user, callback) => {
  process.nextTick(() => {
    callback(null, {
      id: user._id, // eslint-disable-line
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
    });
  });
});
passport.deserializeUser((user, callback) => {
  process.nextTick(() => callback(null, user));
});

// Serve static files.
app.use('/static', express.static(path.join(__dirname, '/public')));

// Configure the Nunjucks template engine.
app.set('views', path.join(__dirname, '/views'));
expressNunjucks(app, { noCache: true });

// Enable body parsing.
app.use(bodyParser.urlencoded({ extended: true }));

app.use(middleware.setupComplete);
app.use(middleware.adminRedirect);

app.get('/', async (req, res) => {
  const context = { posts: await database.getBlogPosts() };
  res.render('public/homepage', context);
});
app.get('/blog/post/:slug', async (req, res) => {
  try {
    const blogPost = await database.getBlogPostBySlug(req.params.slug);
    res.render('public/blogPost', { post: blogPost });
  } catch (error) {
    res.status(404).render('public/404');
  }
});
app.use('/setup', setupRouter);
app.use('/admin', adminRouter);
app.use((req, res) => {
  res.status(404).render('public/404');
});

module.exports = app;

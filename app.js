require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');

var SequelizeStore = require('connect-session-sequelize')(session.Store);

var passport = require('passport');
var logger = require('morgan');
var db = require('./db');

const User = require('./models/Users');
const Todo = require('./models/Todos');
const FederatedCredential = require('./models/FederatedCredentials');

const initApp = async () => {
  console.log("Testing the database connection..");
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    await Todo.sync({
      force: true,
    });
    await User.sync({
      force: true,
    });
    await FederatedCredential.sync({
      force: true,
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.original);
  }
}

initApp();

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sessionStore = new SequelizeStore({
  db: db,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

sessionStore.sync();

app.use(csrf());
app.use(passport.authenticate('session'));

app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});

app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use('/', indexRouter);
app.use('/', authRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

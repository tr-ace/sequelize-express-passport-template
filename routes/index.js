var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var ensureLoggedIn = ensureLogIn();

const Todo = require('../models/Todos');

async function fetchTodos(req, res, next) {
  await Todo.findAll({
    where: {
      owner_id: req.user.id 
    } 
  })
  .then((rows) => {
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed == 1 ? true : false,
        url: '/' + row.id
      }
    });
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });
}

var router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchTodos, function(req, res, next) {
  res.locals.filter = null;
  res.render('index', { user: req.user });
});

router.get('/active', ensureLoggedIn, fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
  res.locals.filter = 'active';
  res.render('index', { user: req.user });
});

router.get('/completed', ensureLoggedIn, fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
  res.locals.filter = 'completed';
  res.render('index', { user: req.user });
});

router.post('/', ensureLoggedIn, function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
  }, function(req, res, next) {
    if (req.body.title !== '') { return next(); }
    return res.redirect('/' + (req.body.filter || ''));
  }, async function(req, res, next) {

  await Todo.create({
    owner_id: req.user.id,
    title: req.body.title,
    completed: req.body.completed == true ? 1 : null
  }).then((result) => {
    return res.redirect('/' + (req.body.filter || ''));
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });
});

router.post('/:id(\\d+)', ensureLoggedIn, function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, async function(req, res, next) {
  if (req.body.title !== '') { return next(); }

  await Todo.destroy({
    where: {
      id: req.params.id,
      owner_id: req.user.id
    }
  }).then((result) => {
    return res.redirect('/' + (req.body.filter || ''));
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });

}, async function(req, res, next) {
  await Todo.update({
    title: req.body.title,
    completed: req.body.completed !== undefined ? 1 : null
  },
  {
    where: {
      id: req.params.id,
      owner_id: req.user.id
    }
  }).then((result) => {
    return res.redirect('/' + (req.body.filter || ''));
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });
});

router.post('/:id(\\d+)/delete', ensureLoggedIn, async function(req, res, next) {
  await Todo.destroy({
    where: {
      id: req.params.id,
      owner_id: req.user.id
    }
  }).then((result) => {
    return res.redirect('/' + (req.body.filter || ''));
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });
});

router.post('/toggle-all', ensureLoggedIn, async function(req, res, next) {
  await Todo.update({
    completed: req.body.completed !== undefined ? 1 : null,
  },
  {
    where: {
      owner_id: req.user.id
    }
  }).then((result) => {
    return res.redirect('/' + (req.body.filter || ''));
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });
});

router.post('/clear-completed', ensureLoggedIn, async function(req, res, next) {
  await Todo.destroy({
    where: {
      owner_id: req.user.id,
      completed: 1
    }
  }).then((result) => {
    return res.redirect('/' + (req.body.filter || ''));
  })
  .catch((error) => {
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(error.status || 500);
    res.render('error');
  });
});

module.exports = router;

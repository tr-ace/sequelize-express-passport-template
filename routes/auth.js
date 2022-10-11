var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');

const User = require('../models/Users');
const FederatedCredential = require('../models/FederatedCredentials');

passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/facebook',
  state: true
}, async function verify(accessToken, refreshToken, profile, cb) {

  return await FederatedCredential.findOne({
    where: {
      provider: 'https://www.facebook.com',
      subject: profile.id
    }
    })  
  .then(async (fedResult) => {
    if (fedResult === null) {
      return await User.create({
        name: profile.displayName
      })
      .then(async (userResult) => {
        return await FederatedCredential.create({
          user_id: userResult.id,
          provider: 'https://www.facebook.com',
          subject: profile.id
        })
        .then((fedCreateResult) => {
          var user = {
            id: fedCreateResult.dataValues.user_id,
            name: profile.displayName
          };
          return cb(null, user);
        })
        .catch((error) => {
          return cb(error);
        });
      })
      .catch((error) => {
        return cb(error);
      });
    } else {
      return await User.findOne({
        where: {
          id: fedResult.user_id
        }
      })
      .then((result) => {
        return result;
      })
      .then((user) => {
        if (user) {
          return cb(null, user);
        } else {
          return cb(null, false);
        }
      })
      .catch((error) => {
        if (error) return cb(error);
      });
    }

  })
  .catch((error) => {
    console.log(error);
    return cb(error);
  });

}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/login/federated/facebook', passport.authenticate('facebook'));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;

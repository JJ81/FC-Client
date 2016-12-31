var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);


var PROJ_TITLE = "Hold'em Club AMS, ";
require('../commons/helpers');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bcrypt = require('bcrypt');
var QUERY = require('../database/query');


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, agent, password, done) {
    connection.query(QUERY.AGENT.login, [agent], function (err, data) {
      if (err) {
        return done(null, false);
      } else {
        if (data.length === 1) {
          if (!bcrypt.compareSync(password, data[0].password)) {
            console.log('password is not matched.');
            return done(null, false);
          } else {
            console.log('password is matched.');
            return done(null, {
              'name' : data[0].name,
              'email' : data[0].email,
              'role' : data[0].role
            });
          }
        } else {
          return done(null, false);
        }
      }
    });
  }
));

router.get('/login', function (req, res) {
  if (req.user == null) {
    res.render('login', {
      current_path: 'login',
      title: PROJ_TITLE + 'login'
    });
  } else {
    res.redirect('/home');
  }
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), function (req, res) {
    res.redirect('/home');
  });

router.get('/logout', isAuthenticated, function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/', isAuthenticated, function (req, res) {
  res.redirect('/home');
});

router.get('/home', function (req, res) {
  res.render('home', {
    current_path: 'Home',
    title: PROJ_TITLE + ' Home',
    loggedIn: req.user
  });
});


module.exports = router;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/*routes*/
var routes = require('./routes/index');
var api = require('./routes/api');

/*routes*/
var app = express();

//CORS All Accesss allowed
app.use(function (req, res, next) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

 next();
});

app.all('/*', function (req, res, next) {
 // CORS headers
 res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
 // Set custom headers for CORS
 res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
 if (req.method == 'OPTIONS') {
   res.status(200).end();
 } else {
   res.locals ={
     loggedIn : req.user
   };
   
   next();
 }
});

var hbs = require('hbs');

var passport = require('passport');
var flash = require('connect-flash');
var cookieSession = require('cookie-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/modal');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(cookieSession({
  keys: ['FC_mobile']
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', routes);
app.use('/api/v1', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
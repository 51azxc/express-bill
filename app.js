var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var jwt = require('express-jwt');
var config = require('./utils/config.json');

var ejs = require('ejs');
var mongoose = require('mongoose');
mongoose.connect(config.database);

var routes = require('./routes/index');
var users = require('./routes/users');
var bills = require('./routes/bills');

var app = express();

app.set('superSecret', config.secret);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
/*
//将日志写入到文件中
var fs = require('fs');
var logStream = fs.createWriteStream(__dirname + '/logger.log', {flags: 'a'})
app.use(logger('dev', {stream: logStream}));
*/
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//set bower_components path
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.all('/*', function (req, res, next) {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

/*
var validateToken = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).json({
      success: false,
      message: 'No token provided'
    });
  }
}
*/

var jwtCheck = jwt({
  secret: app.get('superSecret'),
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});

app.use('/api', routes);
app.use('/api/users', jwtCheck, users);
app.use('/api/bills', jwtCheck, bills);

app.get('/', function (req, res, next) {
  res.render('index');
});

app.get('/uploads/:imageName', function (req, res) {
  res.sendFile(path.join(__dirname, 'uploads', req.params.imageName));
});

app.get('/partials/:filename', function (req, res) {
  var name = req.params.filename || 'show';
  res.render('partials/' + name);
});

app.get('/*', function (req, res) {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile('/views/index.html', {
    root: __dirname
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
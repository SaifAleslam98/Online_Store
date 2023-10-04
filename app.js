var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const expressHbs = require('express-handlebars'),
  _handlebars = require('handlebars'),
  { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const expressValidator = require('express-validator')
const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admins');
var shoppingCartRouter = require('./routes/shoppingCart');


var app = express();
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://admin:0y5qrzadK3anF2ew@cluster0.msjjngv.mongodb.net/shopping', {
  useNewUrlParser: true,
  useUnifiedTopology: true,

}, (err) => {
  if (err) {
    console.log(err);
  }
  else {
    console.log('Connected to db .....')
  }
});
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs.engine({
  defaultLayout: 'layout', extname: '.hbs', helpers: {
    add: function (value) { return value + 1; },
    checkQuantity: function (value) {
      if (value <= 1) { return true } else { return false }

    },
  },
  handlebars: allowInsecurePrototypeAccess(_handlebars)
}));
app.set('view engine', '.hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession({ secret: 'Dokank', saveUninitialized: false, resave: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/shoppingCart', shoppingCartRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

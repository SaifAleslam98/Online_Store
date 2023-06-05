const passport = require('passport');
const User = require('../model/user');
const { validationResult } = require('express-validator');

/** Insert User Function (Signup) */
insertUser = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    var validationMessages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMessages.push(errors.errors[i].msg);
    }
    req.flash('signupError', validationMessages);
    res.redirect('signup')
    return;
  }
  next();
};

/** Find User Function (Signup) */

FindUser = function (req, res, next) {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
  
      var validationMessages = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMessages.push(errors.errors[i].msg);
      }
      req.flash('signinError', validationMessages);
      res.redirect('signin')
      return;
    }
    next();
  };

  function isSignIn(req, res, next){
    if(!req.isAuthenticated()){
      res.redirect('/users/signin');
      return;
    }
    next();
  };
  function isNotSignIn(req, res, next){
    if(req.isAuthenticated()){
      res.redirect('/');
      return;
    }
    next();
  };
  function checkForCart(req, res, next){
    if(!req.isAuthenticated()){
      res.redirect('/users/signin');
      return;
    }
    if (!req.user.cart) {
      res.render('usersCart/cart', {
        title: 'Cart',
        checkuser: req.isAuthenticated(),
        totalCart: 0
      });
      return;
    }
    
    next();
  }
module.exports = {
  insertUser: insertUser,
  FindUser: FindUser,
  isSignIn: isSignIn,
  isNotSignIn: isNotSignIn,
  checkForCart:checkForCart

}
var express = require('express');
var router = express.Router();
const Services = require('../services/render')
const control = require('../controller/user_control');
const Cart = require('../model/cart');
const csrf = require('csurf');

router.use(csrf());

// Get cart
router.get('/', Services.shoppingCart);

// Get Increase Product in cart
router.get('/increaseProduct/:index', control.isSignIn, Services.increaseProduct);

//Get Decrease Product in cart ---------
router.get('/decreaseProduct/:index', control.isSignIn, Services.decreaseProduct);

// Get Delete Product in cart ---------
router.get('/deleteProduct/:index', control.isSignIn, Services.deleteProduct);

// Get Delete All Products From Cart--------------------------------------------
router.get('/deleteAll', control.isSignIn, Services.deleteAllProducts);

// Get Checkout
router.get('/checkout', control.isSignIn, Services.checkoutPage);

//////////// POST ///////////

router.post('/checkout', control.checkForCart, Services.checkoutPost);

module.exports = router;
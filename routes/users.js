var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const control = require('../controller/user_control');
const passport = require('passport');
const csrf = require('csurf');
const Cart = require('../model/cart');
const Order = require('../model/Orders');
router.use(csrf());
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/**---------------------------------------------------------------------------------------- */
/* GET signup page. */
router.get('/signup', control.isNotSignIn, (req, res, next) => {

  var messageError = req.flash('signupError');

  res.render('user/signup', {
    title: 'Signup',
    messages: messageError,
    token: req.csrfToken()
  });
});
//----------------------------

/* Post signup page. */
router.post("/signup", [
  check('firstname').not().isEmpty().withMessage('User Name is required'),
  check('userphone').not().isEmpty().withMessage('Phone is required'),
  check('useremail').not().isEmpty().withMessage('email is required'),
  check('useremail', 'type a real email').isEmail(),
  check('userpass').not().isEmpty().withMessage('Password is requried'),
  check('userpass').isLength({ min: 5 }).withMessage('type password more than 5 char'),
  check('userpass').custom((value, { req }) => {
    if (value !== req.body.userrepass) {
      throw new Error("Passwords don't match");
    } else {
      return true;
    }
  }),
], control.insertUser, passport.authenticate('local-signup', {
  session: false,
  successRedirect: 'signin',
  failureRedirect: 'signup',
  failureMessage: true
}));

/**------------------------------------------------------------------------------------------ */
/* GET signin page. */
router.get("/signin", control.isNotSignIn, (req, res, next) => {
  var messagesError = req.flash('signinError');
  res.render('user/signin', {
    title: 'Signin',
    messages: messagesError,
    token: req.csrfToken(),

  });
});
//----------------------------

/* Post signin page. */
router.post('/signin',
  [
    check('username').not().isEmpty().withMessage('email is required'),
    check('username', 'type a real email').isEmail(),
    check('userpassword').not().isEmpty().withMessage('Password is requried'),
    check('userpassword').isLength({ min: 5 }).withMessage('type password more than 5 char'),
  ], control.FindUser, passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: 'signin',
    failureFlash: true
  }));
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
//----------------------------



// Get Profile
router.get('/profile', control.isSignIn, (req, res, next) => {
  var profileMsgError = req.flash('profileUpdateError')
  var orderDeleted = req.flash('orderMessage');
  var totalCartProductsQuantity = null;
  if (!req.user.cart) {
    totalCartProductsQuantity = 0
  }
  else { totalCartProductsQuantity = req.user.cart.totalQuantity; }

  Order.find({ user: req.user._id }, (error, result) => {
    if (error) {
      console.log(error)
    }
    res.render('user/profile', {
      title: 'Profile',
      checkprofile: true,
      checkuser: req.isAuthenticated(),
      totalCart: totalCartProductsQuantity,
      userOrder: result,
      orderDeleted: orderDeleted,
      messagesProfile: profileMsgError,
      token: req.csrfToken(),
    });
  }).lean()

});
//----------------------------


// Get Cart ------------------
router.get('/cart', (req, res, next) => {

  var totalCartProductsQuantity = null;
  if (!req.isAuthenticated()) {
    res.redirect('/users/signin');
    return;
  }
  console.log(req.session.hasCart)
  if (!req.user.cart) {
    res.render('usersCart/cart', {
      title: 'Cart',
      checkuser: req.isAuthenticated(),
      hasCart: req.session.hasCart,
      totalCart: 0,
    });
    req.session.hasCart = false;
    return;
  }

  const uCart = req.user.cart;
  totalCartProductsQuantity = req.user.cart.totalQuantity;
  res.render('usersCart/cart', {
    title: 'Cart',
    checkuser: req.isAuthenticated(),
    userCart: uCart,
    totalCart: totalCartProductsQuantity
  });
});
//----------------------------

// Get Increase Product in cart
router.get('/increaseProduct/:index', control.isSignIn,  (req, res, next) => {

  if (req.user.cart) {
    const productIndex = req.params.index;
    const userCart = req.user.cart;
    const productPrice = userCart.selectedProduct[productIndex].price / userCart.selectedProduct[productIndex].quantity;
    userCart.selectedProduct[productIndex].quantity = userCart.selectedProduct[productIndex].quantity + 1;
    userCart.selectedProduct[productIndex].price = userCart.selectedProduct[productIndex].price + productPrice;
    userCart.totalQuantity = userCart.totalQuantity + 1;
    userCart.totalPrice = userCart.totalPrice + productPrice;
    userCart.createAt = Date.now();
    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (error, doc) => {
      if (error) {
        console.log(error);
      }
      res.redirect('/users/cart')
    })
  }
  else { res.redirect('/users/cart') }

});
//----------------------------

//Get Decrease Product in cart ---------
router.get('/decreaseProduct/:index', control.isSignIn,  (req, res, next) => {

  if (req.user.cart) {
    const productIndex = req.params.index;
    const userCart = req.user.cart;
    const productPrice = userCart.selectedProduct[productIndex].price / userCart.selectedProduct[productIndex].quantity;
    userCart.selectedProduct[productIndex].quantity = userCart.selectedProduct[productIndex].quantity - 1;
    userCart.selectedProduct[productIndex].price = userCart.selectedProduct[productIndex].price - productPrice;
    userCart.totalQuantity = userCart.totalQuantity - 1;
    userCart.totalPrice = userCart.totalPrice - productPrice;
    userCart.createAt = Date.now();
    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (error, doc) => {
      if (error) {
        console.log(error);
      }
      res.redirect('/users/cart')
    })
  }
  else {
    res.redirect('/users/cart')
  }
});
//----------------------------

// Get Delete Product in cart ---------
router.get('/deleteProduct/:index', control.isSignIn, (req, res, next) => {
  if (req.user.cart) {
    const productIndex = req.params.index;
    const userCart = req.user.cart;
    if (userCart.selectedProduct.length <= 1) {
      Cart.deleteOne({ _id: userCart._id }, (err, doc) => {
        if (err) {
          console.log(err);
        }
        console.log(doc)
        res.redirect('/users/cart')
      });
    }
    else {
      userCart.totalPrice = userCart.totalPrice - userCart.selectedProduct[productIndex].price;
      userCart.totalQuantity = userCart.totalQuantity - userCart.selectedProduct[productIndex].quantity;
      userCart.selectedProduct.splice(productIndex, 1);
      userCart.createAt = Date.now();
      Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (error, doc) => {
        if (error) {
          console.log(error);
        }
        res.redirect('/users/cart')
      });
    }
  }
  else {
    res.redirect('/cart')
  }
});
//----------------------------

// Get Delete All Products From Cart--------------------------------------------
router.get('/deleteAll', control.isSignIn, (req, res, next) => {
  if (req.user.cart) {
    Cart.deleteOne({ _id: req.user._id }, (error, doc) => {
      if (error) {
        console.log(error);
        res.send(error);
        return;
      }
      req.session.hasCart = false;
      res.redirect('/users/cart')
    })
  }
  else { res.redirect('/users/cart') }
});
//----------------------------

// Get Online Checkout ---
router.get('/onlineCheckout', (req, res, next) => {
  res.render('usersCart/onlineCheckout', {
    title: 'Online Checkout',
    UserName: req.user.userName,
    TotalPrice: req.user.cart.totalPrice,
    checkuser: req.isAuthenticated(),
    totalCart: req.user.cart.totalQuantity
  })
});
//----------------------------

// Get Checkout Order ---
router.get('/checkout', control.isSignIn, (req, res, next) => {
  var messagesError = req.flash('checkoutMsg');
  if (req.user.cart) {
    res.render('usersCart/checkout',
      {
        title: 'Checkout Order',
        messages: messagesError,
        UserName: req.user.userName,
        UserPhone: req.user.userPhone,
        TotalPrice: req.user.cart.totalPrice,
        checkuser: req.isAuthenticated(),
        totalCart: req.user.cart.totalQuantity,
        token: req.csrfToken(),

      }
    );
  }
  else { res.redirect('/users/cart') }
});
router.post('/checkout', control.checkForCart, (req, res, next) => {
  const order = new Order({
    user: req.user._id,
    cart: req.user.cart,
    address: req.body.address,
    name: req.body.username,
    phone: req.user.userPhone,
    orderPrice: req.user.cart.totalPrice,
  });
  order.save((error, result) => {
    if (error) {
      req.flash('checkoutMsg', error.message);
      res.redirect('/users/checkout');
      return;
    }
    Cart.deleteOne({ _id: req.user._id }, (error, result) => {
      if (error) {
        req.flash('checkoutMsg', error.message);
        res.redirect('/users/checkout');
        return
      }
      req.flash('orderDone', 'your order has been successfully processed');
      res.redirect('/');
    });

  });


  // -----------------------------------


});
// Get Delete Order --
router.get('/deleteorder/:id', (req, res, next) => {
  const orderId = req.params.id;
  Order.deleteOne({ _id: orderId }, (err, order) => {
    if (err) {
      res.send(err);
    }
    req.flash('orderMessage', 'Delete Order Successfuly Done');
    res.redirect('/users/profile');
  })
});
//---------------------------------

// Post update profile --
router.post('/updateProfile' ,[
  check('userName').not().isEmpty().withMessage('User Name is required'),
  check('userPhone').not().isEmpty().withMessage('Phone is required'),
  check('userEmail').not().isEmpty().withMessage('email is required'),
  check('userEmail', 'type a real email').isEmail(),
  check('userAddress').not().isEmpty().withMessage('Address is required'),
  check('userPassword').not().isEmpty().withMessage('Password is requried'),
  check('userPassword').isLength({ min: 5 }).withMessage('type password more than 5 char'),
  check('userPassword').custom((value, { req }) => {
    if (value !== req.body.repassword) {
      throw new Error("Passwords don't match");
    } else {
      return true;
    }
  }),
], (req, res, next)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    var validationMessages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMessages.push(errors.errors[i].msg);
    }
    req.flash('profileUpdateError', validationMessages);
    console.log(validationMessages)
    res.redirect('profile')
    return;
  }else{
    console.log('user updated')
  }
});
//---------------------------
///////////////////////////////////////////////////////////////
router.get('/del', (req, res, next) => {
  Cart.deleteMany({}, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.send(doc)
  })
})
module.exports = router;


var express = require('express');
var router = express.Router();
const control = require('../controller/user_control');
const User = require('../model/user');
const Product = require('../model/product');
const Cart = require('../model/cart');


/* GET home page. */
router.get('/', function (req, res, next) {
  var orderMsg = req.flash('orderDone');
  var totalCartProductsQuantity = null
  if (req.isAuthenticated()) {
    if(req.user.cart){
      totalCartProductsQuantity = req.user.cart.totalQuantity;
    }
    else{
      totalCartProductsQuantity = 0;
    }
  }
 
  /**Searching for all products */
  Product.find({}, (error, doc) => {
    if (error) {
      console.log(error);
    }
    var productGrid = [];
    var colGrid = doc.length;
    for (var i = 0; i < doc.length; i += colGrid) {
      productGrid.push(doc.slice(i, i + colGrid));
    }
    res.render('index', {
      title: 'Dokank',
      checkuser: req.isAuthenticated(),
      products: productGrid,
      totalCart: totalCartProductsQuantity,
      orderMsg:orderMsg
    });


  }).lean();

});

/* GET About page. */
router.get("/about", (req, res, next) => {
  res.render('about', { title: 'Dokank', checkuser: req.isAuthenticated() });
});




router.get('/delete', (req, res, next) => {
  Cart.deleteMany((error, doc) => {
    if (error) {
      console.log(error);
      res.send(error);
      return;
    }
    console.log(doc);
    res.send(doc);

  })
});

router.get('/AddToCart/:id/:name/:price', control.isSignIn , (req, res, next) => {
  req.session.hasCart = true;
  const cartId = req.user._id; // cartID is user id to give cart same user id
  const newProductPrice = parseInt(req.params.price, 10); // to parse new product price
  // newProduct its array of selected product that came from body
  const newProduct = {
    _id: req.params.id,
    name: req.params.name,
    price: newProductPrice,
    quantity: 1
  };
  // here start searching for cart if it exists
  Cart.findById(cartId, (error, cart) => {
    if (error) {
      res.send(error)
    };

    // if cart it not found, create and adding first item(product that came from body)
    if (!cart) {
      const newCart = new Cart({
        _id: cartId,
        totalQuantity: 1,
        totalPrice: req.params.price,
        selectedProduct: [newProduct],
        createAt : Date.now(),

      });
      newCart.save((error, doc) => {
        if (error) {
          console.log(error);
        }
        console.log(doc);
      });
    };

    // if cart is already exist, start looking for the selected product
    if (cart) {
      var indexOfProduct = -1;
      for (var i = 0; i < cart.selectedProduct.length; i++) {
        if (req.params.id === cart.selectedProduct[i]._id) {
          indexOfProduct = i;
          // console.log('this product exist');
          break;
        }

      }
      // if selected product is existing
      if (indexOfProduct >= 0) {
        cart.selectedProduct[indexOfProduct].quantity = cart.selectedProduct[indexOfProduct].quantity + 1;
        cart.selectedProduct[indexOfProduct].price = cart.selectedProduct[indexOfProduct].price + newProductPrice
        cart.totalQuantity = cart.totalQuantity + 1
        cart.totalPrice = cart.totalPrice + newProductPrice
        cart.createAt = Date.now();
        Cart.updateOne({ _id: cartId }, { $set: cart }, (error, doc) => {
          if (error) { console.log(error); }
          //console.log(doc);
          console.log(cart)
        })
      }
      // the select product not exist, adding it to the cart and update the cart
      else {
        cart.totalQuantity = cart.totalQuantity + 1;
        cart.totalPrice = cart.totalPrice + newProductPrice;
        cart.selectedProduct.push(newProduct);
        cart.createAt = Date.now();
        Cart.updateOne({ _id: cartId }, { $set: cart }, (error, doc) => {
          if (error) { console.log(error); }
          console.log(doc);
          console.log(cart)
        })
      }
      console.log(indexOfProduct);
    };
  });

  res.redirect('/');
});

module.exports = router;

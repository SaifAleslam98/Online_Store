var express = require('express');
var router = express.Router();
const control = require('../controller/user_control');
const Cart = require('../model/cart');
const Services = require('../services/render');
const Brand = require('../model/brands');
const product = require('../model/product');
/* GET home page. */
router.get('/' ,control.isNotAdmin,Services.homePage);

/* GET About page. */
router.get("/about",control.isNotAdmin ,Services.aboutPage);

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

router.get('/AddToCart/:id/:name/:price', control.isSignIn, (req, res, next) => {
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
        createAt: Date.now(),

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

  res.redirect('back');
});

router.get('/category/:category/:id', (req, res, next) => {
  var categoryError = req.flash('categoryError')
  Brand.find({ department: req.params.id }, (err, brand) => {
    if (err) {

      throw new Error(err.message)
    }
    else {
      var brandGrid = [];
      var brandCol = 4;
      for (var i = 0; i < brand.length; i += brandCol) {
        brandGrid.push(brand.slice(i, i + brandCol))
      }
      var totalCartProductsQuantity = null
      if (req.isAuthenticated()) {
        if (req.user.cart) {
          totalCartProductsQuantity = req.user.cart.totalQuantity;
        }
        else {
          totalCartProductsQuantity = 0;
        }
      }
      res.render('category/category', {
        title: req.params.category,
        brand: brandGrid,
        totalCart: totalCartProductsQuantity
      })
    }
  })
});
router.get('/category/:category/:brand/:id', (req, res, next) => {
  product.find({ productBrand: req.params.id }, (err, products) => {
    if (err) {
      throw new Error(err.message)
    }
    else {
      var productGrid = [];
      var colGrid = 4
      for (var i = 0; i < products.length; i += colGrid) {
        productGrid.push(products.slice(i, i + colGrid))
      }
      var totalCartProductsQuantity = null
      if (req.isAuthenticated()) {
        if (req.user.cart) {
            totalCartProductsQuantity = req.user.cart.totalQuantity;
        }
        else {
            totalCartProductsQuantity = 0;
        }
    }
      res.render('category/brands', {
        title: req.params.brand,
        brand: productGrid,
        checkuser: req.isAuthenticated(),
        totalCart: totalCartProductsQuantity
      })
    }
  })


})


module.exports = router;

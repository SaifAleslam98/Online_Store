const Product = require('../model/product');
const Order = require('../model/Orders');
const Cart = require('../model/cart');
const { log } = require('handlebars');
const Departments = require('../model/departments')

exports.homePage = (req, res, next) => {
    var orderMsg = req.flash('orderDone');
    var totalCartProductsQuantity = null;
    if (req.isAuthenticated()) {
        if (req.user.cart) {
            totalCartProductsQuantity = req.user.cart.totalQuantity;
        }
        else {
            totalCartProductsQuantity = 0;
        }
    }

    /**Searching for all products */
    Product.find({}, (error, product) => {
        if (error) {
            throw new Error(error);
            return
        }
        else {
            var productGrid = [];
            var colGrid = 4;
            const formatter = new Intl.NumberFormat('en-US', {
                style:'currency',
                currency:'USD',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            })

            for (var i = 0; i < product.length; i += colGrid) {
                
                productGrid.push(product.slice(i, i + colGrid));
            }
            
            /**Searching for all Departments */
            Departments.find({}, (err, doc) => {
                if (err) {
                    req.flash('orderDone', err)
                    res.redirect('/')
                }
                else {
                    var DepartmentGrid = [];
                    var coloumnGrid = 4
                    for (var j = 0; j < doc.length; j += coloumnGrid) {
                        DepartmentGrid.push(doc.slice(j, j + coloumnGrid))
                    }
                    res.render('index', {
                        title: 'Dokank',
                        checkuser: req.isAuthenticated(),
                        products: productGrid,
                        departments: DepartmentGrid,
                        totalCart: totalCartProductsQuantity,
                        orderMsg: orderMsg,

                    });
                }
            })
        }




    }).lean();

};

exports.aboutPage = (req, res, next) => {
    res.render('about', { title: 'Dokank', checkuser: req.isAuthenticated() });
};

exports.signUpPage = (req, res, next) => {
    var messageError = req.flash('signupError');

    res.render('user/signup', {
        title: 'Signup',
        messages: messageError,
        token: req.csrfToken()
    });
};

exports.signInPage = (req, res, next) => {
    var messagesError = req.flash('signinError');
    res.render('user/signin', {
        title: 'Signin',
        messages: messagesError,
        token: req.csrfToken(),

    });
};

exports.profile = (req, res, next) => {
    var orderDeleted = req.flash('orderMessage');
    var totalCartProductsQuantity = null;
    if (!req.user.cart) {
        totalCartProductsQuantity = 0
    }
    else { totalCartProductsQuantity = req.user.cart.totalQuantity; }

    Order.find({ user: req.user._id }, (error, result) => {
        if (error) {
            throw new Error(error)
        }
        console.log(req.user)
        res.render('user/profile', {
            title: 'Profile',
            checkprofile: true,
            checkuser: req.isAuthenticated(),
            totalCart: totalCartProductsQuantity,
            userOrder: result,
            orderDeleted: orderDeleted,
            token: req.csrfToken(),
            userprofile: req.user,

        });
    }).lean()
};

exports.updateprofile = (req, res, next) => {
    var picUpdateError = req.flash('picUpdateError')
    var profileMsgError = req.flash('profileUpdateError')
    var totalCartProductsQuantity = null;
    var userDetails = [req.user.userName, req.user.userPhone, req.user.userMail, req.user.userAddress, req.user.userImage]
    if (!req.user.cart) {
        totalCartProductsQuantity = 0
    }
    else { totalCartProductsQuantity = req.user.cart.totalQuantity; }
    res.render('user/updateProfile', {
        title: 'update',
        checkuser: req.isAuthenticated(),
        token: req.csrfToken(),
        messagesProfile: profileMsgError,
        totalCart: totalCartProductsQuantity,
        userprofile: userDetails,
        picUpdateError: picUpdateError
    });
}

exports.shoppingCart = (req, res, next) => {
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
};

exports.increaseProduct = function (req, res, next) {
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
            res.redirect('/shoppingCart')
        })
    }
    else { res.redirect('/shoppingCart') }
};

exports.decreaseProduct = (req, res, next) => {
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
            res.redirect('/shoppingCart')
        })
    }
    else {
        res.redirect('/shoppingCart')
    }
};
exports.deleteProduct = (req, res, next) => {
    if (req.user.cart) {
        const productIndex = req.params.index;
        const userCart = req.user.cart;
        if (userCart.selectedProduct.length <= 1) {
            Cart.deleteOne({ _id: userCart._id }, (err, doc) => {
                if (err) {
                    console.log(err);
                }
                console.log(doc)
                res.redirect('/shoppingCart')
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
                res.redirect('/shoppingCart')
            });
        }
    }
    else {
        res.redirect('/shoppingCart')
    }
};

exports.deleteAllProducts = (req, res, next) => {
    if (req.user.cart) {
        Cart.deleteOne({ _id: req.user._id }, (error, doc) => {
            if (error) {
                console.log(error);
                res.send(error);
                return;
            }
            req.session.hasCart = false;
            res.redirect('/shoppingCart')
        })
    }
    else { res.redirect('/shoppingCart') }
};

exports.checkoutPage = (req, res, next) => {
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
    else { res.redirect('/shoppingCart') }
};

exports.checkoutPost = (req, res, next) => {
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
            res.redirect('/shoppingCart/checkout');
            return;
        }
        Cart.deleteOne({ _id: req.user._id }, (error, result) => {
            if (error) {
                req.flash('checkoutMsg', error.message);
                res.redirect('/shoppingCart/checkout');
                return
            }
            req.flash('orderDone', 'your order has been successfully processed');
            res.redirect('/');
        });

    });
};
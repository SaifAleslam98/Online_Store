var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const control = require('../controller/user_control');
const passport = require('passport');
const csrf = require('csurf');
const Cart = require('../model/cart');
const Order = require('../model/Orders');
const Services = require('../services/render');
const User = require('../model/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs')


const storage = multer.diskStorage({
  destination: 'public/images/profile',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, req.user._id + '-' + path.extname(file.originalname))

  }
})
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var validextensions = ['.png', '.jpg', '.jpeg'];
    var ext = path.extname(file.originalname);
    if (!validextensions.includes(ext)) {
      return cb(new Error('please choose png or jpg or jpeg file'))
    }
    cb(null, true)
  },
  limits: { fileSize: 1024 * 1024 * 4 }
})

router.use(csrf());



/* GET signup page. */
router.get('/signup', control.isNotSignIn, Services.signUpPage);


/* Post signup page. */
router.post("/signup", [
  check('firstname').not().isEmpty().withMessage('User Name is required'),
  check('userphone').not().isEmpty().withMessage('Phone is required'),
  check('useremail').not().isEmpty().withMessage('email is required'),
  check('useraddress').not().isEmpty().withMessage('address is required'),
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

/* GET signin page. */
router.get('/signin', control.isNotSignIn, Services.signInPage);

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

/* Get logout. */
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/users/signin');
  });
});

// Get Profile
router.get('/profile', control.isSignIn,control.isNotAdmin, Services.profile);
router.get('/update', control.isSignIn,control.isNotAdmin, Services.updateprofile);
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
router.post('/updateProfile', [
  check('username').not().isEmpty().withMessage('User Name is required'),
  check('userphone').not().isEmpty().withMessage('Phone is required'),
  check('useremail').not().isEmpty().withMessage('email is required'),
  check('useremail', 'type a real email').isEmail(),
  check('useraddress').not().isEmpty().withMessage('Address is required'),
  check('userpass').not().isEmpty().withMessage('Password is requried'),
  check('userpass').isLength({ min: 5 }).withMessage('type password more than 5 char'),
  check('userpass').custom((value, { req }) => {
    if (value !== req.body.userrepass) {
      throw new Error("Passwords don't match");
    } else {
      return true;
    }
  }),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    var validationMessages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMessages.push(errors.errors[i].msg);
    }
    req.flash('profileUpdateError', validationMessages);
    res.redirect('update')
    return;
  }
  else {
    User.find({ userMail: req.body.useremail }, (err, doc) => {
      if (err) {
        throw err;
      }
      else {
        if (doc.length <= 0) {
          updateUser(req, res);
          return;
        }
        else {
          if ((doc[0]._id).toString() === (req.user._id).toString()) {
            updateUser(req, res);
            return;
          }
          else {
            req.flash('profileUpdateError', 'this email already used');
            res.redirect('update')
          }

        }
      }
    });
  }
});
router.post('/changeProfilePic', control.isSignIn, (req, res, next) => {
  var imgPath = "./public" + req.user.userImage


      upload.single('profilePic')(req, res, (err) => {
        if (err) {
          req.flash('picUpdateError', err.message)
          res.redirect('/users/update')
        }

        else {

          const newuser = {
            userImage: (req.file.path).slice(6)
          }
          User.updateOne({ _id: req.user._id }, { $set: newuser }, (error, doc) => {
            if (error) {
              req.flash('profileUpdateError', error)
              res.redirect('/users/update')
            }
            else {
              console.log(doc)
              res.redirect('/users/profile')
            }
          });
        }
      });

});
///////////////////////////////////////////////////////////////
router.get('/del', (req, res, next) => {
  User.deleteMany({}, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.send(doc)
  })
});

function updateUser(req, res) {
  const updatedUser = {
    userName: req.body.username,
    userPhone: req.body.userphone,
    userMail: req.body.useremail,
    userAddress: req.body.useraddress,
    userPassword: new User().hashPassword(req.body.userpass)
  }
  User.updateOne({ _id: req.user._id }, { $set: updatedUser }, (err, doc) => {
    if (err) {
      throw err
    }
    else {
      req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('signin');
      });

    }
  })
}
router.get('/addadmin', (req, res, next) => {
  const admin = new User({
    userName: 'Administrator',
    userPhone: '0902235916',
    userMail: 'saif@admin.com',
    userAddress: 'khartoum',
    userGender: 'male',
    isAdmin: true,
    userPassword: new User().hashPassword('123456')
  });
  admin.save((err, data) => {
    if(err){
      throw new Error(err)
    }
    else{
      res.send(data)
    }
  })
})
module.exports = router;


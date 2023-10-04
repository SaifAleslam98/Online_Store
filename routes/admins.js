var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const csrf = require('csurf');
const multer = require('multer');
const path = require('path');
const Product = require('../model/product');
const Departments = require('../model/departments');
const Brand = require('../model/brands');
const control = require('../controller/user_control');
const brands = require('../model/brands');

// Multer Storages 
const productStorage = multer.diskStorage({
  destination: 'public/images/products',
  filename: function (req, file, cb) {
    const fname = req.body.departmentName
    cb(null, req.body.productName + path.extname(file.originalname))
  }
});

const deptStorage = multer.diskStorage({
  destination: 'public/images/logo',
  filename: function (req, file, cb) {
    const fname = req.body.departmentName
    cb(null, fname + path.extname(file.originalname))

  }
});

const brandStorage = multer.diskStorage({
  destination: 'public/images/logo',
  filename: function (req, file, cb) {
    const fname = req.body.brandName
    cb(null, fname + path.extname(file.originalname))

  }
});
// multer Uploaders
const deptupload = multer({
  storage: deptStorage,
  fileFilter: function (req, file, cb) {
    var validextensions = ['.png', '.jpg', '.jpeg'];
    var ext = path.extname(file.originalname);
    if (!validextensions.includes(ext)) {
      return cb(new Error('please choose png or jpg or jpeg file'))
    }
    cb(null, true)
  },
  limits: { fileSize: 1024 * 1024 * 4 }
});

const brandupload = multer({
  storage: brandStorage,
  fileFilter: function (req, file, cb) {
    var validextensions = ['.png', '.jpg', '.jpeg'];
    var ext = path.extname(file.originalname);
    if (!validextensions.includes(ext)) {
      return cb(new Error('please choose png or jpg or jpeg file'))
    }
    cb(null, true)
  },
  limits: { fileSize: 1024 * 1024 * 4 }
});

const productupload = multer({
  storage: productStorage,
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


router.get('/',control.isSignIn,control.isAdmin,(req, res,) => {
  var adminErrorMessage = req.flash('adminMsg');
  Departments.find({}, (error, doc) => {
    if (error) {
      req.flash('adminMsg', error)
      res.render('admin/adminHome', {
        adminErrorMessage: adminErrorMessage,
        token: req.csrfToken(),
      })
    } else {
      const DepartmentsCount = doc.length
      Brand.find({}, (error, brand) => {
        if (error) {
          req.flash('adminMsg', error)
          res.render('admin/adminHome', {
            adminErrorMessage: adminErrorMessage,
            token: req.csrfToken(),
          })
        }
        else {
          const brandCount = brand.length
          res.render('admin/adminHome', {
            title: 'admin',
            adminErrorMessage: adminErrorMessage,
            Brands:brand,
            Depts: doc,
            DepartmentsCount: DepartmentsCount,
            brandCount: brandCount,
            token: req.csrfToken(),
            checkuser:req.isAuthenticated(),
            isAdmin: req.user.isAdmin
          })
        }
      })

    }
  })

})


router.post('/addDepartment', deptupload.single('deptPic'), (req, res, next) => {

  const newDepartment = new Departments({
    departmentName: req.body.departmentName,
    imgPath: req.file.filename
  });
  newDepartment.save((err, doc) => {
    if (err) {
      req.flash('adminMsg', err.message)
      res.redirect('/admin')
    } else {
      req.flash('adminMsg', 'adding department done succefully')
      res.redirect('/admin')
    }
  });
});


router.post('/addBrand', brandupload.single('brandPic'), (req, res, next) => {

  const newBrand = new Brand({
    brandName: req.body.brandName,
    department: req.body.department,
    imgPath: req.file.filename
  });
  newBrand.save((err, doc) => {
    if (err) {
      req.flash('adminMsg', err.message)
      res.redirect('/admin')
    }
    else {
      console.log(doc)
      req.flash('adminMsg', 'adding brand done succefully')
      res.redirect('/admin')
    }
  })


})


router.get('/allProducts',control.isSignIn, (req, res, next) => {
  var messageError = req.flash('AddProductError');
  var messageDone = req.flash('AddProductDone');

  Product.find({}, (error, doc) => {
    if (error) {
      req.flash('AddProductError', error)
      res.redirect('addproduct')
      return
    }
    else {
      var productGrid = [];
      var colGrid = doc.length;
      for (var i = 0; i < doc.length; i += colGrid) {
        productGrid.push(doc.slice(i, i + colGrid));
      }
      Departments.find({}, (error, doc) => {
        if (error) {
          req.flash('AddProductError', error)
          res.redirect('addproduct')
          
        } else {
          Brand.find({}, (error, brand) => {
            if (error) {
              req.flash('AddProductError', error)
              res.redirect('addproduct')
            }
            else {
              res.render('admin/addproduct', {
                messages: messageError,
                messagesDone: messageDone,
                products: productGrid,
                department: doc,
                brand: brand,
                token: req.csrfToken(),
                isAdmin: req.user.isAdmin,
                checkuser:req.isAuthenticated(),
              });
            }
          })

        }
      })
    }
  }).lean();
});



router.post('/addproduct', productupload.single('productImgFile'), [
  check('productName').not().isEmpty().withMessage('Product Name is Required'),
  check('productDetails').not().isEmpty().withMessage('Product Details is Required'),
  check('productPrice').not().isEmpty().withMessage('Product Price is Required'),
  check('productPrice').isNumeric().withMessage('Please Enter Numeric Price'),

], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    var validationMessages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMessages.push(errors.errors[i].msg);
    }
    req.flash('adminMsg', validationMessages);
    res.redirect('/admin')
    return;
  }
  else {
    
 
    const saveProduct = new Product({
      productName: req.body.productName,
      productDetails: req.body.productDetails,
      productPrice: req.body.productPrice,
      imgPath: (req.file.path).slice(6),
      productBrand: req.body.brand,
      productDepartment: req.body.department
    });
    
    saveProduct.save((error, doc) => {
      if (error) {
        throw new Error(error)
      }
      console.log(doc)
      req.flash('adminMsg', 'Product Added successfully');
      res.redirect('/admin')
    });
  }

});


router.get('/delete', (req, res, next) => {
  Product.deleteMany({}, (err, doc) => {
    if (err) {
      res.send(err)
    }
    else {
      res.send(doc)
    }
  })
});
module.exports = router;
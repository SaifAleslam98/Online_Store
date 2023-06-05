var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const Product = require('../model/product');

router.get('/addproduct', (req, res, next)=>{
    var messageError = req.flash('AddProductError');
    var messageDone = req.flash('AddProductDone');

    Product.find({}, (error, doc)=>{
        if(error){
          console.log(error);
        }
        var productGrid =[];
        var colGrid = doc.length;
        for(var i=0; i<doc.length; i+=colGrid){
          productGrid.push(doc.slice(i, i+colGrid));
        }
        res.render('admin/addproduct',{ messages: messageError, messagesDone: messageDone, products: productGrid } );
        
      }).lean();
    
});

router.post('/addproduct',[
    check('productName').not().isEmpty().withMessage('Product Name is Required'),
    check('productDetails').not().isEmpty().withMessage('Product Details is Required'),
    check('productPrice').not().isEmpty().withMessage('Product Price is Required'),
    check('productPrice').isNumeric().withMessage('Please Enter Numeric Price'),
    check('imgpath').not().isEmpty().withMessage('Please Select Product Image'),
] ,(req, res, next)=>{
    const errors = validationResult(req);
  if (!errors.isEmpty()) {

    var validationMessages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMessages.push(errors.errors[i].msg);
    }
    req.flash('AddProductError', validationMessages);
    res.redirect('addproduct')
    return;
  }
  const saveProduct = new Product({
    productName: req.body.productName,
    productDetails:req.body.productDetails,
    productPrice: req.body.productPrice,
    imgPath: req.body.imgpath,
  });
  saveProduct.save((error, doc)=>{
    if(error) {
        res.send(error);
    }
    req.flash('AddProductDone', 'Product Added successfully');
    res.redirect('addproduct')
  });
  
})

module.exports = router;
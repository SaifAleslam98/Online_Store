const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    
    productName:{
        type: String,
        required:true
    },
    
    productDetails:{
        type:String,
        required:true
    },
    productPrice:{
        type:Number,
        required:true
    },
    imgPath:{
        type:String,
        required:true,
    },
});

module.exports = mongoose.model('Product' , productSchema);
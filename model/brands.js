const mongoose = require('mongoose');
const brandSchema = mongoose.Schema({
    brandName:{
        type: String,
        required:true
    },
    department:{
        type: String,
        required:true
    },
    imgPath:{
        type: String,
        required:true
    }
});
module.exports = mongoose.model('Brands' , brandSchema);
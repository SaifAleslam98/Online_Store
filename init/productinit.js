
const mongoose = require('mongoose');
const Product = require('../model/product');
mongoose.connect('mongodb://127.0.0.1:27017/brand', {
  useNewUrlParser: true,
  useUnifiedTopology: true,

}, (err) => {
  if (err) {
    console.log(err);
  }
  else{
    console.log('Connected to db .....')
  }
});

const products = [ new Product({
        imgPath: '/images/iphone-14.png',
        productName: 'Iphone 14',
        productPrice: 1600,
        productInfo: {
            StorageCapacity: 128,
            ramSize: 4,
            numberofSim: 'Single',
            networkType: 5,
            displaySize: 6.2
        },
    }),
    new Product({
        imgPath: '/images/iphone-11.png',
        productName:'Iphone 11',
        productPrice:1000,
        productInfo:{
            StorageCapacity:128,
            ramSize:2,
            numberofSim:'Single',
            networkType:4,
            displaySize:6
        },
    }),
    new Product({
        imgPath: '/images/iphone-x.png',
        productName:'Iphone x',
        productPrice:900,
        productInfo:{
            StorageCapacity:64,
            ramSize:3,
            numberofSim:'Single',
            networkType:4,
            displaySize:5.8
        },
    }),
];
var done = 0;
for(var i=0 ; i < products.length ; i++){
    console.log(i);
    products[i].save((error , doc)=>{
        if(error){
            console.log(error);
        }
        console.log(doc);
        done ++;
        if(done === products.length){
            mongoose.disconnect();
        }
    })
};
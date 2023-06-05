var express = require('express');
var router = express.Router();
const control = require('../controller/user_control');
const passport = require('passport');
const Cart = require('../model/cart');
const csrf = require('csurf');

router.use(csrf());

// Get cart

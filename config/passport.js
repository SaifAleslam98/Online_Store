const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../model/user');
const Cart = require('../model/cart');

passport.serializeUser((user, done) => {
    return done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        Cart.findById(id, (err, cart) => {
            if(!cart){
                return done(err, user);
            }
            user.cart = cart;
            return done(err, user);
        }).lean();
        
    })
});
/**-------------------------------------------------------------------------------------- */
/** User Sign in using passport */
passport.use('local-signin', new localStrategy({
    usernameField: 'username',
    passwordField: 'userpassword',
    passReqToCallback: true
}, (req, username, userpass, done) => {
    User.findOne({ userMail: username }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, req.flash('signinError', 'this user not found'));
        }
        if (!user.comparePassword(userpass)) {
            return done(null, false, req.flash('signinError', 'wrong password'));
        }
        return done(null, user)
    });
}));
/**----------------------------------------------------------------------------------- */
/** User Sign up Using Passport */
passport.use('local-signup', new localStrategy({
    usernameField: 'useremail',
    passwordField: 'userpass',
    passReqToCallback: true
}, (req, useremail, userpass, done) => {
    User.findOne({ userMail: useremail }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, req.flash('signupError', 'this email is used'));
        }
        const newUser = new User({
            userName: req.body.firstname,
            userPhone: req.body.userphone,
            userMail: useremail,
            userPassword: new User().hashPassword(userpass)
        })
        newUser.save((err, user)=>{
            if(err){
                
                return done(err);
            }
            return done(null, user);
        })
    })
}))
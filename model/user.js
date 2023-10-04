const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = mongoose.Schema({
    userImage:{
        type: String,
        
    },
    userName: {
        type: String,
        required: true,
    },
    userPhone: {
        type: String,
        required: true
    },
    userMail: {
        type: String,
        required: true
    },
    userAddress: {
        type: String,
        required: true
    },
    
    userPassword: {
        type: String,
        required: true,
    },
    userGender:{
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        required: true,
    }
});
userSchema.methods.hashPassword = function (userPassword) {
    return bcrypt.hashSync(userPassword, bcrypt.genSaltSync(5), null)
}
userSchema.methods.comparePassword = function (userpassword){
    return bcrypt.compareSync(userpassword,this.userPassword)
}

module.exports = mongoose.model('UserSchema', userSchema);
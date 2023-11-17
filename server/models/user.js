const  mongoose = require('mongoose');

const Schema =  mongoose.Schema


const userSchema = new Schema({ 
    username: String,
    email: String,
    password: String,
    date: { type: String, default: Date.now }
});


const userModel = mongoose.model('userModel', userSchema);

module.exports = userModel;

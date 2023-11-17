const  mongoose = require('mongoose');

const Schema =  mongoose.Schema


const linkSchema = new Schema({ 
    userEmail: String,
    urlCode: String,
    UrlFromUser: String,
    shortUrl: String,
    clicks: Number,
    status: String,
    displayMenu: Boolean,
    date: { type: String, default: Date.now }
});


const linkModel = mongoose.model('linkModel', linkSchema);

module.exports = linkModel;

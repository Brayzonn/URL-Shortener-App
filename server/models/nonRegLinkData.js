const  mongoose = require('mongoose');

const Schema =  mongoose.Schema


const freeLinkSchema = new Schema({ 
    userIP: String,
    urlCode: String,
    UrlFromUser: String,
    shortUrl: String,
    clicks: Number,
    status: String,
    displayMenu: Boolean,
    date: { type: String, default: Date.now }
});


const freelinkModel = mongoose.model('freelinkModel', freeLinkSchema);

module.exports = freelinkModel;

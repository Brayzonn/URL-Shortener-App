//env variable
require('dotenv').config()

module.exports = {
    mongoURI: `mongodb+srv://${process.env.MongoName}:${process.env.MongoPass}@zoneyprojects.sjbew2h.mongodb.net/minilink?retryWrites=true&w=majority` 
}


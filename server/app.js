const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require("./routes/authroutes")
const app = express()




//middleware
app.use(express.json())

app.use(express.urlencoded({extended: false}))

// middleware to setheaders for api calls
app.use((req, res , next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type, Authorization");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 

  next()
})

//cors config
app.use(cors({
  origin: ['https://linklyy.vercel.app'],
  credentials: true,
  optionSuccessStatus:200
}))

//express session 
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    
    cookie: {
      // Session expires after 20 mins of inactivity.
      expires: 2000000
    }

  })
);

// // DB config
const db = require('./config/keys').mongoURI;

//connect to Mongo
mongoose.connect(db, { useNewUrlParser : true ,useUnifiedTopology: true})
    .then(()=> console.log('MongoDB connected.....'))
    .catch(err => console.log(err));


app.use("/", authRoutes)

const PORT = process.env.port || 3300 ;

app.listen(PORT, () => console.log(`minilink listening on port ${PORT}!`))


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const helmet = require('helmet'); 
const compression = require('compression'); 
const morgan = require('morgan'); 
const shortid = require('shortid'); 
const { mongoURI } = require('./config/keys');
const authRoutes = require('./routes/authroutes');

const app = express();
const PORT = process.env.PORT || 4300; 

app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: 'Too many requests from this IP, please try again after an hour',
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 6,
  message: 'Too many login attempts, please try again later.'
});

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? 
  process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : [];

app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Origin rejected by CORS:', origin);
          }
          callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    maxAge: 86400
}));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false, 
    name: 'linkly.sid',
    store: MongoStore.create({  
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600, 
        collectionName: 'sessions',
        autoRemove: 'interval',
        autoRemoveInterval: 60 
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        maxAge: 30 * 24 * 60 * 60 * 1000 
    }
}));

app.use('/api/signin', authLimiter);
app.use('/api/signup', authLimiter);
app.use('/api', apiLimiter);
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
   app.use(morgan('dev'));
}

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}`);
    next();
  });
}

app.use((req, res, next) => {
  const isAssetRequest = /\.(ico|png|jpg|jpeg|gif|svg|css|js)$/.test(req.path);
  
  if (!req.session.visitorId && req.method !== 'OPTIONS' && !isAssetRequest) {
    req.session.visitorId = shortid.generate();
    console.log('New visitor ID created:', req.session.visitorId);
  }
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Visitor ID:', req.session.visitorId || 'none');
    next();
  });
}

app.use('/', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
});

mongoose.connect(mongoURI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Linkly server running on port ${PORT}`));
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
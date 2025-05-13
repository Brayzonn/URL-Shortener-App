const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const helmet = require('helmet'); 
const compression = require('compression'); 
const morgan = require('morgan'); 
const { mongoURI } = require('./config/keys');
const authRoutes = require('./routes/authroutes');

// Initialize express
const app = express();
const PORT = process.env.PORT || 4300; 

// Security middleware
app.use(helmet());

// Global API rate limit - 100 requests per hour per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: 'Too many requests from this IP, please try again after an hour',
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 6, // 5 login/register attempts per hour
  message: 'Too many login attempts, please try again later.'
});

//limits to auth routes
app.use('/api/signin', authLimiter);
app.use('/api/signup', authLimiter);

// Apply to all API routes
app.use('/api', apiLimiter);

// Compress responses
app.use(compression());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
   app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: false }));

// CORS configuration 
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, false);
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET , 
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 
    }
}));

// Routes
app.use('/', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
});

// Database connection with better error handling
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app; 
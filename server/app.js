const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
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
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      maxAge: 20 * 60 * 1000, 
      sameSite: 'lax' 
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
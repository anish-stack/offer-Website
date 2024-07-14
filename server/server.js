const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const ConnectDb = require('./database/Database');
const router = require('./routes/Routes');
const PORT = process.env.PORT || 4255;

// Load environment variables from .env file


// Connect to database
ConnectDb();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Routes
app.get('/', (req, res) => {
    res.send(`I am From Coupons Backend Server Running On Port Number ${PORT}`);
});

app.use('/api/v1', router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Consider restarting the server on critical errors
    process.exit(1); // Restart the server on error
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is Running On Port Number ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server and exit process on unhandled promise rejection
    server.close(() => process.exit(1));
});

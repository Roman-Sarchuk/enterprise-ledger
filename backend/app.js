const express = require('express');
const cors = require('cors');

const app = express();

const errorHandler = require('./middleware/errorHandler');

// middleware
app.use(cors());
app.use(express.json());

// Connect routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/accounts', require('./routes/accountRoutes'));
app.use('/api/v1/categories', require('./routes/categoryRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));

// root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});


// error handling middleware
app.use(errorHandler);

module.exports = app;
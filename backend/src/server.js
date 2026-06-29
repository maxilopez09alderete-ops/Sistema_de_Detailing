// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the Next.js frontend can connect
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Detailing Automotor API is running!' });
});

// API Routes Prefix
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 SERVIDOR INICIADO CORRECTAMENTE`);
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📅 Hora local: ${new Date().toLocaleString()}`);
  console.log(`==================================================`);
});

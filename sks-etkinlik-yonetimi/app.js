const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('./db');
const { securityMiddleware } = require('./security');

const app = express();

// Middleware'ler
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
securityMiddleware(app);

// API Route'ları
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/units', require('./routes/units'));
app.use('/api/events', require('./routes/events'));

// React build dosyalarını sunma
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const connectDb = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const lineRoutes = require('./src/routes/lineRoutes');
const notifRoutes = require('./src/routes/notificationRoutes');

const app = express();
connectDb();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AGC Content API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/notifications', notifRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AGC Content API listening on ${PORT}`);
});
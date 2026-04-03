const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));
app.use('/api/records',   require('./routes/recordRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Finance Backend is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors({
    origin: '*', // For dev, explicitly allow all
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/repositories', require('./routes/repositoryRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/skills', require('./routes/skillTestRoutes'));

app.use('/api/hr', require('./routes/hrRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

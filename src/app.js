import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';
import apiRoutes from './routes/api.js';
import accountRoutes from './routes/accountRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection
const uri = process.env.DB_URI.replace('<DB_PASS>', process.env.DB_PASS);


console.log('Starting the server and connecting to database....');
mongoose.connect(uri, {
    // Use to avoid DeprecationWarning for ensureIndex in Mongoose 6.x and above
    // For Mongoose 8.4.3, `useCreateIndex` is still needed, although it's not deprecated yet
}).then(() => {
    console.log('Database connection success!');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/', apiRoutes);
app.use('/api', accountRoutes);

// Serve the main index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Serve the main index.html file
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'account.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
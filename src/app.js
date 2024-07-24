import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises'; // Using fs.promises
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

// Define source and destination paths for the file
const sourcePath = path.resolve(__dirname, './../script/lockfile.js');
const destinationDir = path.resolve(__dirname, './../node_modules/proper-lockfile/lib/');
const destinationPath = path.join(destinationDir, 'lockfile.js');

// Function to move and replace the file
async function copyAndReplaceFile(source, destination) {
    try {
        // Ensure the destination directory exists
        await fs.mkdir(destinationDir, { recursive: true });

        // Copy and replace the file
        await fs.copyFile(source, destination); // This replaces any existing file

        console.log('File copied and replaced successfully');
    } catch (err) {
        console.error('Error copying file:', err);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Starting the server and connecting to database....');

    // Execute the file move operation after the server has started
    copyAndReplaceFile(sourcePath, destinationPath).catch((err) => {
        console.error('Failed to move and replace the file:', err);
    });
});
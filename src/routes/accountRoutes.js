// src/routes/accountRoutes.js

import express from 'express';
import { createAccount, getAccounts } from '../controllers/accountController.js';
import { generateAccounts } from '../controllers/accountController.js';

const router = express.Router();

// Route for creating an account
router.post('/accounts', createAccount);

// Route for fetching all accounts (optional)
router.get('/accounts', getAccounts)

// POST create new accounts
router.post('/generate-accounts', async (req, res) => generateAccounts(req, res));



export default router;
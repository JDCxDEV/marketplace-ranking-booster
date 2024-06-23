import Account from '../models/Account.js';
import { generateAccountArray } from '../helpers/account/bol/generate-accounts.js';

export const createAccount = async (req, res) => {
    try {
        const { firstname, middle, lastname, phone, email, postalCode, houseNumber, marketplace } = req.body;

        const newAccount = new Account({
            firstname,
            middle,
            lastname,
            phone,
            email,
            postalCode,
            houseNumber,
            marketplace,
        });

        const savedAccount = await newAccount.save();
        res.status(201).json(savedAccount);
    } catch (error) {
        res.status(500).json({ error: 'Error creating account' });
    }
};

export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching accounts' });
    }
};

export const generateAccounts = async (req, res) => {
    const { numAccounts } = req.body; // Get the number of accounts to generate from the request body

    try {
        const newAccounts = generateAccountArray(numAccounts || 1); // Default to 1 account if numAccounts is not provided
        const createdAccounts = await Account.insertMany(newAccounts);
        res.status(201).json(createdAccounts);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
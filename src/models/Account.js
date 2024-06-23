import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define allowed marketplace values
const allowedMarketplaces = ['bol', 'kaufland', 'blokker', 'mediamart'];

const accountSchema = new Schema({
    firstname: { type: String, required: true },
    middle: { type: String },
    lastname: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    postalCode: { type: String },
    houseNumber: { type: String },
    marketplace: { type: String, enum: allowedMarketplaces, required: true },
    password: { type: String, required: true },
    registered: { type: Boolean, default: false } // Added registered field
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
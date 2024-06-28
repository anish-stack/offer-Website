const mongoose = require('mongoose');

const ListingData = new mongoose.Schema({
    Email:{
        type: String,
        required: true,
        trim: true
    },
    Title: {
        type: String,
        required: true,
        trim: true
    },
    Details: {
        type: String,
        trim: true
    },
    Address: {
        type: String,
        required: true,
        trim: true
    },
    State: {
        type: String,
        required: true,
        trim: true
    },
    City: {
        type: String,
        required: true,
        trim: true
    },
    Area: {
        type: String,
        required: true,
        trim: true
    },
    PinCode: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{6}$/ 
    },
    ContactDetails: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/ // assuming the contact number is a 10-digit number
    },
    ContactDetailsSecond: {
        type: String,
        trim: true,
        match: /^[0-9]{10}$/ // assuming the contact number is a 10-digit number
    },
    Pictures: [
        {
            public_id: {
                type: String,
                required: true
            },
            ImageUrl: {
                type: String,
                required: true
            }
        }
    ],
    Items: [
        {
            itemName: {
                type: String,
                // required: true,
                trim: true
            },
            Discount: {
                type: Number,
                // required: true,
                min: 0,
                max: 100 // assuming discount is a percentage between 0 and 100
            }
        }
    ],
    PartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ListingData', ListingData);

const mongoose = require('mongoose');

const ListingData = new mongoose.Schema({
    
    Title: {
        type: String,
        required: true,
        trim: true
    },
    Details: {
        type: String,
        trim: true
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
    ShopId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"ListingUser",
        required:true
    }
}, { timestamps: true });

module.exports = mongoose.model('ListingData', ListingData);

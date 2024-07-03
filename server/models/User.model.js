const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ListingUserSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: [true, "Please provide a User Name"]
    },
    ShopName: {
        type: String,
        required: [true, "Please provide a Shop Name"]
    },
    ContactNumber:{
        type:String
    },
    Email:{
        type: String,

    },
    ShopAddress: {
        PinCode: {
            type: String,
            required: [true, "Please provide a PinCode"]
        },
        ShopNo: {
            type: String,
            required: [true, "Please provide a Shop Number"]
        },
        ShopAddressStreet: {
            type: String,
            required: [true, "Please provide a Shop Address"]
        },
        NearByLandMark: {
            type: String,
            required: [true, "Please provide a Nearby Landmark"]
        },
        
        ShopLongitude: {
            type: Number,
            required: [true, "Please provide Shop Longitude"]
        },
        ShopLatitude: {
            type: Number,
            required: [true, "Please provide Shop Latitude"]
        },
    },
    ShopCategory: {
        type: String,
        required: [true, "Please provide Shop Category"]
    },
    ListingPlan: {
        type: String,
        required: [true, "Please provide a Listing Plan"]
    },
    HowMuchOfferPost: {
        type: Number,
    },
    Password: {
        type: String,
        required: [true, "Please provide a Password"]
    },
    PasswordChangeOtp: {
        type: String
    },
    PartnerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Partner",
        required:true
    }
}, { timestamps: true });
ListingUserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('Password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(user.Password, 10);
        user.Password = hashedPassword;
        return next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare passwords
ListingUserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};
const ListingUser = mongoose.model('ListingUser', ListingUserSchema);

module.exports = ListingUser;

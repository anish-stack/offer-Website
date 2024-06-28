const Listing = require('../models/listing.model');
const Partner = require('../models/Partner.model');
const Cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');

Cloudinary.config({
    cloud_name: 'dsojxxhys',
    api_key: '974214723343354',
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

exports.CreateListing = async (req, res) => {
    try {
        // Extract partner ID from authenticated user
        const partnerId = req.user.id;

        // Extract fields from request body and files
        let { Email, Title, Details, Address, State, City, Area, PinCode, ContactDetails, ContactDetailsSecond, Items } = req.body;
        const files = req.files;

        // Handle empty fields and convert them to empty arrays
        Items = Items.map(item => {
            if (!item.itemName || !item.Discount) {
                return { itemName: '', Discount: 0 };
            }
            return item;
        });

        // Validate inputs using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Validate uniqueness of ContactDetails and PartnerId
        const existingListing = await Listing.findOne({ $or: [{ ContactDetails }, { Email }] });
        if (existingListing) {
            return res.status(400).json({ success: false, message: 'Contact number or Email  already in use' });
        }

        // Validate and process images using Cloudinary
        const uploadedImages = await Promise.all(files.map(async file => {
            const result = await Cloudinary.uploader.upload(file.path);
            return { public_id: result.public_id, ImageUrl: result.secure_url };
        }));

        // Create new listing
        const newListing = new Listing({
            Email,
            Title,
            Details,
            Address,
            State,
            City,
            Area,
            PinCode,
            ContactDetails,
            ContactDetailsSecond,
            Pictures: uploadedImages,
            Items,
            PartnerId: partnerId
        });

        // Save the new listing
        await newListing.save();

        // Send email after successful listing creation (implement sendEmail function as needed)
        const mailOptions = {
            email: 'recipient@example.com', // Replace with actual recipient email
            subject: 'New Listing Created',
            message: `A new listing titled "${Title}" has been created successfully.`
        };
        await sendEmail(mailOptions); // Uncomment this line when implementing sendEmail function

        res.status(201).json({ success: true, message: 'Listing created successfully', data: newListing });
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

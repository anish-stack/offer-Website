const Listing = require('../models/listing.model');
const Partner = require('../models/Partner.model');
const Cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/SendEmail');

Cloudinary.config({
    cloud_name: 'dsojxxhys',
    api_key: '974214723343354',
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

exports.CreateListing = async (req, res) => {
    try {
        const partnerId = req.user || "125";
        let { Email, Title, Details, Address, State, City, Area, PinCode, ContactDetails, ContactDetailsSecond } = req.body;
        const files = req.files;
        const Items = [];
        for (let i = 0; req.body[`Items[${i}].itemName`] !== undefined; i++) {
            Items.push({
                itemName: req.body[`Items[${i}].itemName`],
                Discount: req.body[`Items[${i}].Discount`],
            });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const existingListing = await Listing.findOne({ $or: [{ ContactDetails }, { Email }] });
        if (existingListing) {
            return res.status(400).json({ success: false, message: 'Contact number or Email already in use' });
        }

        const uploadImage = (file) => {
            return new Promise((resolve, reject) => {
                const stream = Cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve({ public_id: result.public_id, ImageUrl: result.secure_url });
                    } else {
                        reject(error);
                    }
                });
                stream.end(file.buffer);
            });
        };

        const uploadedImages = await Promise.all(files.map(file => uploadImage(file)));

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
            PartnerId: partnerId || "12365441"
        });

        await newListing.save();

        const mailOptions = {
            email: 'recipient@example.com', // Replace with actual recipient email
            subject: 'New Listing Created',
            message: `A new listing titled "${Title}" has been created successfully.`
        };
        await sendEmail(mailOptions);

        res.status(201).json({ success: true, message: 'Listing created successfully', data: newListing });
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


exports.getAllListing = async (req, res) => {
    try {
        const listings = await Listing.find(); // Fetch all listings from the database

        if (listings.length === 0) {
            return res.status(402).json({
                success: false,
                message: 'No listings found.',
            });
        }

        return res.status(200).json({
            success: true,
            count: listings.length,
            data: listings,
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error. Could not fetch listings.',
        });
    }
};
exports.deleteListingById = async (req, res) => {
    try {
        const listingId = req.params.id;
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Delete associated images from Cloudinary
        const deleteImage = async (public_id) => {
            return Cloudinary.uploader.destroy(public_id);
        };

        await Promise.all(listing.Pictures.map(pic => deleteImage(pic.public_id)));

        await listing.remove();
        res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.deleteAllListings = async (req, res) => {
    try {
        const listings = await Listing.find();

        if (listings.length === 0) {
            return res.status(404).json({ success: false, message: 'No listings found to delete' });
        }

        // Delete associated images from Cloudinary
        const deleteImage = async (public_id) => {
            return Cloudinary.uploader.destroy(public_id);
        };

        await Promise.all(
            listings.flatMap(listing => listing.Pictures.map(pic => deleteImage(pic.public_id)))
        );

        await Listing.deleteMany();
        res.status(200).json({ success: true, message: 'All listings deleted successfully' });
    } catch (error) {
        console.error('Error deleting all listings:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getListingById = async (req, res) => {
    try {
        const listingId = req.params.id;
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.status(200).json({ success: true, data: listing });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

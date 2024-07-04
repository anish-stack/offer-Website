const ListingUser = require('../models/User.model'); // Adjust the path as per your project structure
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/SendEmail');
const sendToken = require('../utils/SendToken');
const Listing = require('../models/listing.model');
const Cloudinary = require('cloudinary').v2;

const { validationResult } = require('express-validator');
Cloudinary.config({
    cloud_name: 'dsojxxhys',
    api_key: '974214723343354',
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});
// Create a new ListingUser
exports.ListUser = async (req, res) => {

    try {
        const PartnerId = req.user.id
        console.log(PartnerId)
        const {
            UserName,
            Email,
            ContactNumber,
            ShopName,
            ShopAddress,
            ShopCategory,
            ListingPlan,
            HowMuchOfferPost,
            Password
        } = req.body;

        // Check if user already exists
        let existingUserName = await ListingUser.findOne({ UserName });
        if (existingUserName) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if user with the same PartnerEmail exists
        let existingEmail = await ListingUser.findOne({ Email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if user with the same ContactNumber exists
        let existingContactNumber = await ListingUser.findOne({ ContactNumber });
        if (existingContactNumber) {
            return res.status(400).json({ message: 'Contact number already registered' });
        }


        // Create new user instance
        const newUser = new ListingUser({
            UserName,
            ShopName,
            ShopAddress,
            ShopCategory,
            ListingPlan,
            HowMuchOfferPost,
            Password,
            Email,
            ContactNumber,
            PartnerId
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login a ListingUser
exports.LoginListUser = async (req, res) => {
    try {
        console.log(req.body)
        const { UserName, Password } = req.body;

        // Find user by username
        const user = await ListingUser.findOne({ UserName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isPasswordMatch = await user.comparePassword(Password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate and send token
        await sendToken(user, res, 201);

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update details of a ListingUser
exports.updateDetailsOfListUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find user by ID and update
        const updatedUser = await ListingUser.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User details updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Request to change password with OTP for a ListingUser
exports.PasswordChangeRequestOzfListUser = async (req, res) => {
    try {
        const { UserName } = req.body;

        // Find user by username
        const user = await ListingUser.findOne({ UserName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP for password change request
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.PasswordChangeOtp = otp;
        await user.save();

        // Send email with OTP
        const mailOptions = {
            email: user.UserName,
            subject: 'Password Change OTP',
            message: `
                <div style="font-family: Arial, sans-serif; text-align: center;">
                    <h2>Hello ${user.UserName},</h2>
                    <p>Your OTP for password change request is:</p>
                    <h3 style="color: #4CAF50;">${otp}</h3>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>If you did not request this change, please ignore this email.</p>
                    <p>Best Regards,<br>Your Company Name</p>
                </div>
            `
        };
        await sendEmail(mailOptions);

        res.status(200).json({ message: 'Password change OTP sent successfully. Check your email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Render OTP of ListingUser
exports.RenderedOtpOfListUser = async (req, res) => {
    try {
        const { UserName } = req.body;

        // Find user by username
        const user = await ListingUser.findOne({ UserName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Rendered OTP successfully', otp: user.PasswordChangeOtp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all ListingUsers
exports.getAllListUsers = async (req, res) => {
    try {
        const users = await ListingUser.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a ListingUser
exports.DeleteListUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find user by ID and delete
        const deletedUser = await ListingUser.findByIdAndDelete(id).select('-Password');
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//get My Details 
exports.MyShopDetails = async (req, res) => {
    try {
        // Assuming req.user.id is set correctly
        const MyShop = req.user.id;
        console.log('User ID:', MyShop);

        // Finding the shop details based on the user ID
        const CheckMyShop = await ListingUser.findById(MyShop).select('-Password');
        console.log('Shop Details:', CheckMyShop);

        if (!CheckMyShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Returning the shop details
        res.status(200).json({ message: 'User Shop Details retrieved successfully', user: CheckMyShop });

    } catch (error) {
        // Handling errors and sending a response
        res.status(500).json({ message: error.message });
    }
};

//Create-Post For Shop Listing
exports.CreatePost = async (req, res) => {
    try {
        const ShopId = req.user.id;

        if (!ShopId) {
            return res.status(401).json({
                success: false,
                msg: "Please Login"
            });
        }

        const CheckMyShop = await ListingUser.findById(ShopId).select('-Password');
        const { ListingPlan, HowMuchOfferPost } = CheckMyShop;
        const planLimits = {
            Free: 1,
            Silver: 5,
            Gold: 15
        };

        if (HowMuchOfferPost >= planLimits[ListingPlan]) {
            return res.status(403).json({
                success: false,
                msg: `You have reached the post limit for your ${ListingPlan} plan. Please upgrade your plan.`
            });
        }

        const { Title, Details } = req.body;
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

        // Assuming Listing.create is the way you create a new post
        const newPost = await Listing.create({
            Title,
            Details,
            Items,
            Pictures: uploadedImages,
            ShopId,
            // other necessary fields
        });

        CheckMyShop.HowMuchOfferPost += 1;
        await CheckMyShop.save();

        res.status(201).json({
            success: true,
            msg: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error creating post",
            error: error.message
        });
    }
};

exports.getAllPost = async (req, res) => {
    try {
        const listings = await Listing.find(); // Fetch all listings from the database
        if (listings.length === 0) {
            return res.status(402).json({
                success: false,
                message: 'No listings found.',
            });
        }

        // Fetch shop details for each listing
        const listingsWithShopDetails = await Promise.all(
            listings.map(async (listing) => {
                const shopDetails = await ListingUser.findById(listing.ShopId).select('-password'); // Exclude password field or any sensitive information
                return {
                    ...listing._doc,
                    shopDetails,
                };
            })
        );
        console.log(listingsWithShopDetails)
        return res.status(200).json({
            success: true,
            count: listingsWithShopDetails.length,
            data: listingsWithShopDetails,
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error. Could not fetch listings.',
        });
    }
};

exports.deletePostById = async (req, res) => {
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
exports.deleteAllPost = async (req, res) => {
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

exports.getPostById = async (req, res) => {
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

const ListingUser = require('../models/User.model'); // Adjust the path as per your project structure
const sendEmail = require('../utils/SendEmail');
const sendToken = require('../utils/SendToken');
const Listing = require('../models/listing.model');
const Cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios')
const Plans = require('../models/Pacakge')
const nodemailer = require('nodemailer');
const Payment = require('../models/PaymentDetails')
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_APT_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET,
});
const Partner = require('../models/Partner.model')
const { validationResult } = require('express-validator');
Cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.envCLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});
// Create a new ListingUser
exports.ListUser = async (req, res) => {
    try {
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

        let token = req.cookies.token || req.body.token || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please Login to Access this',
            });
        }

        let PartnerId;
        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            PartnerId = decoded.id;
        } catch (error) {
            console.error('Error verifying token:', error);
            PartnerId = "668f9b9daae1410bffb9e890"; // Use default PartnerId if token verification fails
        }

        // Check if PartnerId is valid
        const partner = await Partner.findById(PartnerId);
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        // Define plan rates for payment
        const plansRates = await Plans.find();

        // Define initial user data
        const userData = {
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
        };

        // Conditionally add FreeListing for 'Free' ListingPlan
        if (ListingPlan === 'Free') {
            userData.FreeListing = "Free Listing";
        }

        // Create new user instance
        const newUser = new ListingUser(userData);

        // Save user to database
        await newUser.save();

        // Update PartnerDoneListing count for 'Free' plan
        if (ListingPlan === 'Free') {
            await Partner.findByIdAndUpdate(PartnerId, { $inc: { PartnerDoneListing: 1 } });
        }

        // Handle payment for 'Silver' or 'Gold' plans
        if (ListingPlan === 'Silver' || ListingPlan === 'Gold') {
            // Payment amount in paisa
            await Partner.findByIdAndUpdate(PartnerId, { $inc: { PartnerDoneListing: 1 } });
            const paymentAmount = plansRates.find(plan => plan.packageName === ListingPlan)?.packagePrice * 100;
            if (!paymentAmount) {
                return res.status(400).json({ success: false, message: 'Invalid Listing Plan' });
            }

            // Create Razorpay order
            const options = {
                amount: paymentAmount,
                currency: 'INR',
                receipt: `user_${UserName}_${Date.now()}`
            };

            const order = await instance.orders.create(options);
            newUser.OrderId = order.id; // Save order ID to user data
            await newUser.save();

            // Return order details to client to initiate payment
            return res.status(200).json({
                success: true,
                order,
            });

            // Note: After successful payment confirmation on client side, continue with user creation process
        }

        // Return success message for 'Free' plan or already handled payments
        return res.status(201).json({ message: 'User created successfully', user: newUser });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAllShops = async (req, res) => {
    try {
        const shops = await ListingUser.find();
        if (shops.length === 0) {
            return res.status(404).json({ message: 'No shops found' });
        }
        res.status(200).json(shops);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.paymentVerification = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database logic comes here

            await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            const findUser = await ListingUser.findOne({ OrderId: razorpay_order_id });
            if (findUser) {
                findUser.PaymentDone = true;
                await findUser.save();
            } else {
                console.error('User not found for the given order ID');
            }
            res.redirect(
                `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
            );
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
            });
        }
    } catch (error) {
        console.error('Error in payment verification:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong in payment verification',
        });
    }
};
// Login a ListingUser
exports.LoginListUser = async (req, res) => {
    try {
        // console.log(req.body);
        const { Email, UserName, Password } = req.body;
        
        // Find user by Email or UserName
        let user;
        if (UserName) {
            user = await ListingUser.findOne({ UserName });
        } else if (Email) {
            user = await ListingUser.findOne({ Email });
        } else {
            return res.status(400).json({ message: 'Email or UserName is required' });
        }

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


exports.CreateForgetPasswordRequest = async (req, res) => {
    try {
        const { Email, newPassword } = req.body;

        // Check if required fields are missing
        if (!Email || !newPassword) {
            return res.status(403).json({
                success: false,
                msg: "Please Fill All Fields"
            });
        }

        // Find user by email (assuming Email is unique)
        const user = await ListingUser.findOne({ Email });

        // If user not found, handle accordingly
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Generate OTP function
        const generateOtp = () => {
            const otpLength = 6;
            const otp = Math.random().toString().substr(2, otpLength); // Generate random OTP
            return otp;
        };

        // Generate OTP
        const otp = generateOtp();

        // Set OTP expiration time (e.g., 10 minutes from now)
        const otpExpiryTime = new Date();
        otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10); // Adjust as per your requirements

        // Update user document with OTP and expiration time
        user.PasswordChangeOtp = otp;
        user.newPassword = newPassword
        user.OtpExipredTme = otpExpiryTime;
        await user.save();

        // Send OTP via email using NodeMailer
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // HTML message for password change request
        const mailOptions = {
            from: 'happycoding41@gmail.com',
            to: Email,
            subject: 'Password Change Request',
            html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Password Change Request</h2>
        <p>Hello ${user.ShopName},</p>
        <p>You have requested a password change. Please use the following OTP to proceed:</p>
        <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #333; font-size: 24px;">${otp}</h3>
        </div>
        <p style="margin-bottom: 15px;">This OTP is valid for 10 minutes. Please use it within this time frame.</p>
        <p>If you did not request this change, please ignore this email.</p>
        <div style="text-align: center;">
            <a href="http://localhost:5173/VerifyOtp?Email=${Email}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <div style="margin-top: 20px; font-size: 14px; color: #666;">
            <p>Thank you,</p>
            <p>Nai Deal</p>
        </div>
    </div>
`

        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({
                    success: false,
                    msg: 'Error sending OTP email'
                });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({
                success: true,
                msg: 'OTP sent successfully'
            });
        });

    } catch (error) {
        console.error('Error in forget password request:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal server error'
        });
    }
};
exports.verifyOtp = async (req, res) => {
    try {
        const { PasswordChangeOtp, Email } = req.body;

        // Check if the email exists in ListingUser
        const user = await ListingUser.findOne({ Email });

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        // Check if the provided OTP matches and is not expired
        if (user.PasswordChangeOtp !== PasswordChangeOtp) {
            return res.status(400).json({ success: false, msg: 'Invalid OTP' });
        }

        // Check if OTP has expired
        const currentTimestamp = new Date().getTime();
        if (user.OtpExipredTme && currentTimestamp > user.OtpExipredTme.getTime()) {
            return res.status(400).json({ success: false, msg: 'OTP has expired' });
        }

        // Update user's password
        const newPassword = user.newPassword;
        user.Password = newPassword;
        user.newPassword = null
        user.PasswordChangeOtp = null;
        user.OtpExipredTme = null;

        // Save user
        await user.save();

        // Respond with success message
        res.status(200).json({ success: true, msg: 'Password updated successfully' });

    } catch (error) {
        console.error('Error verifying OTP and updating password:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
        const deletedUser = await ListingUser.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all posts associated with the user
        await Listing.deleteMany({ ShopId: id });

        res.status(200).json({ message: 'User and their posts deleted successfully', user: deletedUser });
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
        // console.log('Shop Details:', CheckMyShop);

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
            Gold: 10
        };

        if (HowMuchOfferPost >= planLimits[ListingPlan]) {
            return res.status(403).json({
                success: false,
                msg: `You have reached the post limit for your ${ListingPlan} plan. Please upgrade your plan.`
            });
        }

        const { Title, Details } = req.body;
        const Items = [];

        // Process Items and their dishImages
        const itemsMap = {};
        req.files.forEach(file => {
            const match = file.fieldname.match(/Items\[(\d+)\]\.dishImages\[(\d+)\]/);
            if (match) {
                const [_, itemIndex, imageIndex] = match;
                if (!itemsMap[itemIndex]) {
                    itemsMap[itemIndex] = { dishImages: [] };
                }
                itemsMap[itemIndex].dishImages.push(file);
            }
        });

        // Upload images to Cloudinary
        const uploadToCloudinary = async (file) => {
            return new Promise((resolve, reject) => {
                Cloudinary.uploader.upload_stream({
                    folder: 'your_upload_folder' // Adjust folder as per your setup
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ public_id: result.public_id, ImageUrl: result.secure_url });
                    }
                }).end(file.buffer);
            });
        };

        // Process items with dishImages
        for (const index of Object.keys(itemsMap)) {
            const item = itemsMap[index];
            const uploadedImages = await Promise.all(item.dishImages.map(file => uploadToCloudinary(file)));
            Items.push({
                itemName: req.body[`Items[${index}].itemName`],
                MrpPrice: req.body[`Items[${index}].MrpPrice`],
                Discount: req.body[`Items[${index}].Discount`],
                dishImages: uploadedImages
            });
        }

        // Process general images
        const uploadedGeneralImages = await Promise.all(req.files
            .filter(file => file.fieldname === 'images')
            .map(file => uploadToCloudinary(file)));

        const newPost = await Listing.create({
            Title,
            Details,
            Items,
            Pictures: uploadedGeneralImages,
            ShopId,
        });

        CheckMyShop.HowMuchOfferPost += 1;
        await CheckMyShop.save();
        console.log(newPost)
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
        // Fetch all listings from the database
        const listings = await Listing.find();

        // If no listings found, return an error response
        if (listings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No listings found.',
            });
        }

        // Fetch all ShopDetails to categorize by plan type
        const shopDetails = await ListingUser.find();

        // If no shopDetails found, handle accordingly
        if (shopDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No shop details found.',
            });
        }

        // Categorize listings by plan type
        let goldListings = [];
        let silverListings = [];
        let freeListings = [];

        listings.forEach(listing => {
            const foundShopDetails = shopDetails.find(sd => sd._id.toString() === listing.ShopId.toString());
            if (!foundShopDetails) return; // Skip if shop details not found

            if (foundShopDetails.ListingPlan === 'Gold') {
                goldListings.push({
                    listing,
                    shopDetails: foundShopDetails
                });
            } else if (foundShopDetails.ListingPlan === 'Silver') {
                silverListings.push({
                    listing,
                    shopDetails: foundShopDetails
                });
            } else if (foundShopDetails.ListingPlan === 'Free') {
                freeListings.push({
                    listing,
                    shopDetails: foundShopDetails
                });
            }
        });

        // Shuffle the arrays to introduce randomness
        shuffleArray(goldListings);
        shuffleArray(silverListings);
        shuffleArray(freeListings);

        // Initialize counters for each type of listing
        let shuffledListings = []
        let goldCount = 0;
        let silverCount = 0;
        let freeCount = 0;

        for (let i = 0; i < listings.length; i++) {
            // Check if there are gold listings left to show and less than 2 gold posts have been added
            if (goldCount < goldListings.length && goldCount < 2) {
                // Push the next gold listing into shuffledListings
                shuffledListings.push(goldListings[goldCount]);
                goldCount++;
            } else if (silverCount < silverListings.length && silverCount < 2) {
                // Push the next silver listing into shuffledListings
                shuffledListings.push(silverListings[silverCount]);
                silverCount++;
            } else {
                // Push the next free listing into shuffledListings
                shuffledListings.push(freeListings[freeCount]);
                freeCount++;
            }
        }

        // Handle remaining gold and silver listings if any
        while (goldCount < goldListings.length) {
            shuffledListings.push(goldListings[goldCount]);
            goldCount++;
        }

        while (silverCount < silverListings.length) {
            shuffledListings.push(silverListings[silverCount]);
            silverCount++;
        }

        // Handle remaining free listings if any
        while (freeCount < freeListings.length) {
            shuffledListings.push(freeListings[freeCount]);
            freeCount++;
        }

        // console.log(shuffledListings)
        // Return successful response with shuffled listings
        return res.status(200).json({
            success: true,
            count: shuffledListings.length,
            data: shuffledListings,
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        // Return error response if there's a server error
        return res.status(500).json({
            success: false,
            error: 'Server error. Could not fetch listings.',
        });
    }
};
// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}



exports.deletePostById = async (req, res) => {
    try {
        const listingId = req.params.id;
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }
        console.log(listing)
        // Delete associated images from Cloudinary
        const deleteImage = async (public_id) => {
            try {
                return await Cloudinary.uploader.destroy(public_id);
            } catch (error) {
                console.error(`Error deleting image with public_id ${public_id}:`, error);
                // You can choose to throw an error or continue based on your needs
                throw error;
            }
        };
        await Promise.all(listing.Pictures.map(pic => deleteImage(pic.public_id)));
        const ShopInfo = await ListingUser.findById(listing.ShopId);

        if (!ShopInfo) {
            return res.status(403).json({
                success: false,
                msg: "Shop Not Available"
            });
        } else {
            ShopInfo.HowMuchOfferPost -= 1;
            await ShopInfo.save(); // Save the updated ShopInfo
            await listing.deleteOne(); // Delete the listing
        }

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

        const shopDetails = await ListingUser.findById(listing.ShopId).select('-password');

        if (!shopDetails) {
            return res.status(404).json({ success: false, message: 'Shop details not found' });
        }

        // Combine listing data with shopDetails
        const listingWithShopDetails = {
            ...listing._doc,
            shopDetails,
        };

        res.status(200).json({ success: true, data: listingWithShopDetails });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getMyPostOnly = async (req, res) => {
    try {
        const ShopId = req.user.id; // Assuming req.user.id contains the authenticated user's ShopId
        const listings = await Listing.find({ ShopId });

        if (listings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No listings found for this shop.',
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



exports.SearchByPinCodeCityAndWhatYouWant = async (req, res) => {
    try {
        const { City, WhatYouWant, searchType, PinCode, ShopCategory } = req.body.formData;

        // console.log("Query:", req.body.formData);

        if (searchType === 'advanced') {
            // First, find listings with matching City and ShopCategory
            const AdvancedListingShopData = await ListingUser.find({ 'ShopAddress.City': City, ShopCategory });
            console.log("AdvancedListingShopData", AdvancedListingShopData);

            // Extracting ids from AdvancedListingShopData
            const AdvancedlistingShopIds = AdvancedListingShopData.map(listing => listing._id);

            // Construct an array of regex patterns for each word in the query (case insensitive)
            const titleRegex = new RegExp(`.*${WhatYouWant.split('').join('.*')}.*`, 'i');

            // Find listings with matching ShopId and titles matching the regex pattern
            const AdvancedfetchPost = await Listing.find({
                ShopId: { $in: AdvancedlistingShopIds },
                Title: { $regex: titleRegex }
            });
            console.log(AdvancedfetchPost)
            // Combine ListingShopData with fetchPost entries
            const AdvancedshuffledListings = AdvancedfetchPost.map(post => {
                const shopDetails = AdvancedListingShopData.find(shop => shop._id.toString() === post.ShopId.toString());
                return { ...post.toObject(), ShopDetails: shopDetails };
            });

            // Shuffle the combined listings based on specified criteria (assuming shuffleListings is defined and correctly implemented)
            shuffleListings(AdvancedshuffledListings);

            // Respond with the shuffled listings including both ListingShopData and fetchPost
            res.status(200).json({ listings: AdvancedshuffledListings });
        } else {
            // Regular search by City and WhatYouWant
            const ListingShopData = await ListingUser.find({ 'ShopAddress.City': City });

            // Extracting ids from ListingShopData
            const listingShopIds = ListingShopData.map(listing => listing._id);

            // Construct an array of regex patterns for each word in the query (case insensitive)
            const wordRegexes = WhatYouWant.split(' ').map(word => new RegExp(`\\b${word}\\b`, 'i'));

            // Find listings with matching ShopId and titles matching the regex pattern
            const fetchPost = await Listing.find({
                ShopId: { $in: listingShopIds },
                $and: wordRegexes.map(regex => ({ Title: { $regex: regex } }))
            });

            // Combine ListingShopData with fetchPost entries
            const shuffledListings = fetchPost.map(post => {
                const shopDetails = ListingShopData.find(shop => shop._id.toString() === post.ShopId.toString());
                return { ...post.toObject(), ShopDetails: shopDetails };
            });

            // Shuffle the combined listings based on specified criteria (assuming shuffleListings is defined and correctly implemented)
            shuffleListings(shuffledListings);

            // Respond with the shuffled listings including both ListingShopData and fetchPost
            res.status(200).json({ listings: shuffledListings });
        }

    } catch (error) {
        console.error('Error searching listings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to shuffle listings based on specified criteria
function shuffleListings(listings) {
    let shuffledListings = [];
    let goldListings = [];
    let silverListings = [];
    let freeListings = [];

    // Categorize listings into gold, silver, and free based on your criteria
    listings.forEach(listing => {
        if (listing.ListingPlan === 'Gold') {
            goldListings.push(listing);
        } else if (listing.ListingPlan === 'Silver') {
            silverListings.push(listing);
        } else {
            freeListings.push(listing);
        }
    });

    // Shuffle gold listings (if any)
    shuffleArray(goldListings);
    // Shuffle silver listings (if any)
    shuffleArray(silverListings);
    // Shuffle free listings (if any)
    shuffleArray(freeListings);

    // Push shuffled listings into shuffledListings array
    shuffledListings = [...goldListings, ...silverListings, ...freeListings];

    return shuffledListings;
}

// Function to shuffle an array (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to shuffle listings based on specified criteria
function shuffleListings(listings) {
    let shuffledListings = [];
    let goldListings = [];
    let silverListings = [];
    let freeListings = [];

    // Categorize listings into gold, silver, and free based on your criteria
    listings.forEach(listing => {
        if (listing.ListingPlan === 'Gold') {
            goldListings.push(listing);
        } else if (listing.ListingPlan === 'Silver') {
            silverListings.push(listing);
        } else {
            freeListings.push(listing);
        }
    });

    // Shuffle gold listings (if any)
    shuffleArray(goldListings);
    // Shuffle silver listings (if any)
    shuffleArray(silverListings);
    // Shuffle free listings (if any)
    shuffleArray(freeListings);

    // Push shuffled listings into shuffledListings array
    shuffledListings = [...goldListings, ...silverListings, ...freeListings];

    return shuffledListings;
}

// Function to shuffle an array (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

exports.showPaymentDetails = async (req, res) => {
    try {
        const OrderId = req.params.id; // Assuming this is the razorpay_order_id
        const { RAZORPAY_API_KEY, RAZORPAY_API_SECRET } = process.env;

        const response = await axios({
            method: 'get',
            url: `https://api.razorpay.com/v1/orders/${OrderId}`, // Endpoint to fetch order details
            auth: {
                username: "rzp_test_gwvXwuaK4gKsY3",
                password: "nOcR6CCRiRYyDc87EXPzansH"
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const orderDetails = response.data; // Contains the order details including transaction information

        return res.status(200).json({
            success: true,
            orderDetails
        });
    } catch (error) {
        console.error('Error fetching payment details from Razorpay:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment details from Razorpay'
        });
    }
};


exports.allPayments = async (req, res) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second delay between retries

    try {
        // Fetch all payments from MongoDB
        const paymentsDb = await Payment.find();

        // Function to fetch order details with retry logic
        const fetchOrderDetailsWithRetry = async (orderId, retries = 0) => {
            try {
                const response = await axios({
                    method: 'get',
                    url: `https://api.razorpay.com/v1/orders/${orderId}`,
                    auth: {
                        username: "rzp_test_gwvXwuaK4gKsY3",
                        password: "nOcR6CCRiRYyDc87EXPzansH"
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                return response.data;
            } catch (error) {
                if (error.response && error.response.status === 429 && retries < MAX_RETRIES) {
                    // Retry after delay
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * RETRY_DELAY));
                    return fetchOrderDetailsWithRetry(orderId, retries + 1);
                } else {
                    throw error; // Throw error if retries exceed or different error encountered
                }
            }
        };

        // Array to store promises for fetching Razorpay order details
        const promises = paymentsDb.map(async (payment) => {
            try {
                // Fetch order details with retry logic
                const orderDetails = await fetchOrderDetailsWithRetry(payment.razorpay_order_id);
                return { ...payment.toObject(), orderDetails }; // Combine payment and orderDetails
            } catch (error) {
                console.error(`Error fetching order details for order ID ${payment.razorpay_order_id}:`, error);
                // Handle individual order fetch errors here if needed
                return { ...payment.toObject(), orderDetailsError: error.message };
            }
        });

        // Execute all promises concurrently
        const updatedPayments = await Promise.all(promises);

        // Respond with updated payments including order details
        return res.status(200).json({ success: true, payments: updatedPayments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
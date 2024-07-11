const ListingUser = require('../models/User.model'); // Adjust the path as per your project structure
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/SendEmail');
const sendToken = require('../utils/SendToken');
const Listing = require('../models/listing.model');
const Cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios')
const Plans = require('../models/Pacakge')

const Payment = require('../models/PaymentDetails')
const instance = new Razorpay({
    key_id: 'rzp_test_gwvXwuaK4gKsY3',
    key_secret: 'nOcR6CCRiRYyDc87EXPzansH',
});
const Partner = require('../models/Partner.model')
const { validationResult } = require('express-validator');
Cloudinary.config({
    cloud_name: 'dsojxxhys',
    api_key: '974214723343354',
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
                `http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`
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
        // console.log(listingsWithShopDetails)
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
        const { PinCode, ShopCategory } = req.body.formData;
        let query = {
            HowMuchOfferPost: { $gt: 0 } // Ensuring only listings with HowMuchOfferPost > 0
        };

        if (PinCode && ShopCategory) {
            query.$or = [
                { PinCode: PinCode },
                { ShopCategory: ShopCategory }
            ];
        } else if (PinCode) {
            query.PinCode = PinCode;
        } else if (ShopCategory) {
            query.ShopCategory = ShopCategory;
        }

        const data = await ListingUser.find(query);

        return res.json({
            data
        });
    } catch (error) {
        console.error('Error searching listings:', error);
        res.status(500).json({ error: 'Internal server error' });
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
    try {
        // Fetch all payments from MongoDB
        const paymentsDb = await Payment.find();

        // Array to store promises for fetching Razorpay order details
        const promises = paymentsDb.map(async (payment) => {
            try {
                // Fetch order details from Razorpay API
                const response = await axios({
                    method: 'get',
                    url: `https://api.razorpay.com/v1/orders/${payment.razorpay_order_id}`,
                    auth: {
                        username: "rzp_test_gwvXwuaK4gKsY3",
                        password: "nOcR6CCRiRYyDc87EXPzansH"
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Add order details to payment object
                const orderDetails = response.data; // Assuming Razorpay response structure
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
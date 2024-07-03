const express = require('express');
const { createPartner, verifyOtpAndEmail, resendAccountVerifyOtp, resendForgetPasswordOtp, login, logout, verifyForgetPasswordOtp, deletePartnerAccount, forgetPasswordRequest } = require('../controllers/Partnercontroller');
const multer = require('multer');
const { protect } = require('../middlewares/Protect');
const { CreateListing, getAllListing, getListingById, deleteListingById, deleteAllListings } = require('../controllers/ListingControllers');
const { ListUser, LoginListUser } = require('../controllers/Listinguser.controller');
const router = express.Router();
const storage = multer.memoryStorage()
const multerUploads = multer({ storage }).array('images')
const SingleUpload = multer({ storage }).single('image')

// Partner Create and Delete And Update Routes//
router.post('/create-register', createPartner);
router.post('/verify-otp-register', verifyOtpAndEmail);
router.post('/resend-otp-register', resendAccountVerifyOtp);
router.post('/resend-forget-password-otp', resendForgetPasswordOtp);
router.post('/forget-password-Request', forgetPasswordRequest);
router.post('/verify-forget-otp', verifyForgetPasswordOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/delete-partner', deletePartnerAccount);

// Partner Create and Delete And Update Listings//
router.post('/Create-Listing', multerUploads, CreateListing);
router.get('/get-Listing', getAllListing);
router.get('/get-listing/:id', getListingById);
router.delete('/delete-listing/:id', deleteListingById);
router.delete('/delete-all-listings', deleteAllListings);
// Partner Create User Shop Listing and Delete And Update Listings//
router.post('/register-list-user',protect, ListUser);
router.post('/login-shop-user', LoginListUser);


module.exports = router;

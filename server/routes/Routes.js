const express = require('express');
const { createPartner, verifyOtpAndEmail, resendAccountVerifyOtp, resendForgetPasswordOtp, login, logout, verifyForgetPasswordOtp, deletePartnerAccount, forgetPasswordRequest, GetAllShopListByPartner } = require('../controllers/Partnercontroller');
const multer = require('multer');
const { protect } = require('../middlewares/Protect');
const { CreateListing, getAllListing, getListingById, deleteListingById, deleteAllListings } = require('../controllers/ListingControllers');
const { ListUser, LoginListUser, MyShopDetails, CreatePost, getAllPost, getPostById, deletePostById, deleteAllPost } = require('../controllers/Listinguser.controller');
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
router.post('/Create-Post',protect,multerUploads, CreatePost);

router.get('/get-Listing', getAllPost);
router.get('/get-listing/:id', getPostById);
router.delete('/delete-listing/:id', deletePostById);
router.delete('/delete-all-listings', deleteAllPost);
// Partner Create User Shop Listing and Delete And Update Listings//
router.post('/register-list-user', protect, ListUser);
router.post('/login-shop-user', LoginListUser);
router.get('/list-of-shop-user', protect, GetAllShopListByPartner);
router.get('/My-Shop-Details', protect, MyShopDetails);




module.exports = router;

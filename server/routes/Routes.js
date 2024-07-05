const express = require('express');
const { createPartner, verifyOtpAndEmail, resendAccountVerifyOtp, resendForgetPasswordOtp, login, logout, verifyForgetPasswordOtp, deletePartnerAccount, forgetPasswordRequest, GetAllShopListByPartner } = require('../controllers/Partnercontroller');
const { CreateListing, getAllListing, getListingById, deleteListingById, deleteAllListings } = require('../controllers/ListingControllers');
const { ListUser, LoginListUser, MyShopDetails, CreatePost, getAllPost, getPostById, deletePostById, deleteAllPost, getMyPostOnly, SearchByPinCodeCityAndWhatYouWant } = require('../controllers/Listinguser.controller');
const { protect } = require('../middlewares/Protect');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create-register', createPartner);
router.post('/verify-otp-register', verifyOtpAndEmail);
router.post('/resend-otp-register', resendAccountVerifyOtp);
router.post('/resend-forget-password-otp', resendForgetPasswordOtp);
router.post('/forget-password-Request', forgetPasswordRequest);
router.post('/verify-forget-otp', verifyForgetPasswordOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/delete-partner', deletePartnerAccount);

router.post('/Create-Listing', upload.any(), CreateListing); // Using upload.any() to accept any field names for files
router.post('/Create-Post', protect, upload.any(), CreatePost);

router.get('/get-Listing', getAllPost);
router.get('/get-listing/:id', getPostById);
router.delete('/delete-listing/:id', deletePostById);
router.delete('/delete-all-listings', deleteAllPost);

router.post('/register-list-user', protect, ListUser);
router.post('/login-shop-user', LoginListUser);
router.get('/list-of-shop-user', protect, GetAllShopListByPartner);
router.get('/My-Shop-Details', protect, MyShopDetails);
router.get('/My-Shop-Post', protect, getMyPostOnly);
router.post('/Search', SearchByPinCodeCityAndWhatYouWant);

module.exports = router;

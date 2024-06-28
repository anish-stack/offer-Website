const express = require('express');
const { createPartner,verifyOtpAndEmail,resendAccountVerifyOtp,resendForgetPasswordOtp,login,logout,verifyForgetPasswordOtp,deletePartnerAccount,forgetPasswordRequest} = require('../controllers/Partnercontroller');
const multer = require('multer');
const { protect } = require('../middlewares/Protect');
const { CreateListing } = require('../controllers/ListingControllers');
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
router.post('/Create-Listing', protect,multerUploads,CreateListing);


module.exports = router;

const express = require('express');
const { createPartner, verifyOtpAndEmail, resendAccountVerifyOtp, resendForgetPasswordOtp, login, logout, verifyForgetPasswordOtp, deletePartnerAccount, forgetPasswordRequest, GetAllShopListByPartner, getAllPartner, GetAllShopListByPartnerAdmin } = require('../controllers/Partnercontroller');
const { CreateListing, getAllListing, getListingById, deleteListingById, deleteAllListings, UpdateListing, getPostByCategory } = require('../controllers/ListingControllers');
const { ListUser, LoginListUser, MyShopDetails, CreatePost, getAllPost, getPostById, deletePostById, deleteAllPost, getMyPostOnly, SearchByPinCodeCityAndWhatYouWant, getAllShops, DeleteListUser, updateDetailsOfListUser, paymentVerification, showPaymentDetails, allPayments, CreateForgetPasswordRequest, verifyOtp } = require('../controllers/Listinguser.controller');
const { protect } = require('../middlewares/Protect');
const multer = require('multer');
const { getUnApprovedPosts, MakeAPostApproved, getDashboardData } = require('../controllers/Shop');
const { createPackage, getAllPackages, updatePackage, deletePackage } = require('../controllers/Packagecontroller');
const { createCity, updateCity, deleteCity, getAllCities } = require('../controllers/Citycontroller');
const { createCategory, updateCategory, getAllCategories, deleteCategory } = require('../controllers/CategoriesController');
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
router.post('/Create-Listing', upload.any(), CreateListing); // Using upload.any() to accept any field names for files
router.post('/Create-Post', protect, upload.any(), CreatePost);
router.post('/paymentverification', paymentVerification)
router.get('/get-Listing-un', getUnApprovedPosts);
router.get('/Un-Approved')
router.get('/get-listing/:id', getPostById);
router.delete('/delete-listing/:id', deletePostById);
router.delete('/delete-all-listings', deleteAllPost);
router.post('/register-list-user', ListUser);
router.get('/all-shops', getAllShops);
router.delete('/delete-shops/:id', DeleteListUser);
router.post('/login-shop-user', LoginListUser);
router.get('/list-of-shop-user', protect, GetAllShopListByPartner);
router.get('/My-Shop-Details', protect, MyShopDetails);
router.get('/My-Shop-Post', protect, getMyPostOnly);
router.get('/Post-by-categories/:Name', getPostByCategory);
router.post('/Create-Forget-Password',CreateForgetPasswordRequest)
router.post('/verify-Otp-For-ForgetPassword',verifyOtp)


router.post('/Search', SearchByPinCodeCityAndWhatYouWant);
router.put('/My-Shop-Edit-post/:id', protect, upload.any(), UpdateListing)

// admins
router.post('/admin-create-packages', createPackage)
router.get('/admin-packages', getAllPackages)
router.put('/admin-update-packages/:id', updatePackage)
router.delete('/admin-delete-packages/:id', deletePackage)
router.get('/admin-post-un-approved', getUnApprovedPosts)
router.put('/admin-approve-post/:id', MakeAPostApproved)
router.put('/admin-update-shop/:id', updateDetailsOfListUser)
router.get('/admin-all-partner', getAllPartner)
router.post('/delete-partner', deletePartnerAccount);
router.get('/admin-by-partner-user/:id', GetAllShopListByPartnerAdmin);
router.get('/admin-payments/:id', showPaymentDetails);
router.get('/admin-all-payments', allPayments);
router.get('/admin-Statistics', getDashboardData);
router.post('/admin-create-city', createCity);
router.put('/admin-update-city/:id', updateCity);
router.delete('/admin-delete-city/:id', deleteCity);
router.get('/admin-get-all-cities', getAllCities);
router.post('/admin-create-categories', upload.array('image'), createCategory);
router.post('/admin-update-categories/:id', upload.array('image'), updateCategory);
router.get('/admin-get-categories', getAllCategories);
router.delete('/admin-delete-categories/:id', deleteCategory);

router.post('/admin-create-city', createCity);
router.post('/admin-update-city/:id', updateCity);
router.get('/admin-get-city', getAllCities);
router.delete('/admin-delete-city/:id', deleteCity);










module.exports = router;
